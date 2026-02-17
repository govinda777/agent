import { NextResponse } from 'next/server';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbeddings } from '@/utils/embeddings';
import { chunkTextSmart } from '@/utils/text-chunker';
import {
    extractTextFromPDF,
    extractTextFromText,
    validateFileSize,
    validateFileType,
    getFileExtension,
} from '@/utils/file-processor';
import { promises as fs } from 'fs';
import { Readable } from 'stream';

export const runtime = 'nodejs';

// Helper to convert Request to Node.js IncomingMessage
async function parseFormData(request: Request): Promise<{
    files: FormidableFile[];
    fields: any;
}> {
    const formData = await request.formData();
    const files: FormidableFile[] = [];
    const fields: any = {};

    // Convert to array to avoid iterator issues
    const entries = Array.from(formData.entries());

    for (const [key, value] of entries) {
        if (value instanceof File) {
            // Convert Web API File to Buffer
            const arrayBuffer = await value.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Create a temporary file-like object
            files.push({
                filepath: '', // We'll use the buffer directly
                originalFilename: value.name,
                mimetype: value.type,
                size: value.size,
                // @ts-ignore - adding buffer for our use
                buffer: buffer,
            } as any);
        } else {
            fields[key] = value;
        }
    }

    return { files, fields };
}

export async function POST(req: Request) {
    try {
        // Parse the multipart form data
        const { files, fields } = await parseFormData(req);

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const file = files[0];
        const namespace = fields.namespace || '';

        // Validate file
        if (!file.originalFilename) {
            return NextResponse.json(
                { error: 'Invalid file' },
                { status: 400 }
            );
        }

        if (!validateFileType(file.originalFilename)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF, TXT, and MD files are allowed.' },
                { status: 400 }
            );
        }

        if (!validateFileSize(file.size || 0)) {
            return NextResponse.json(
                { error: 'File size exceeds 4MB limit' },
                { status: 400 }
            );
        }

        // Read file buffer
        const buffer = (file as any).buffer as Buffer;

        // Extract text based on file type
        const fileExtension = getFileExtension(file.originalFilename);
        let text: string;

        if (fileExtension === 'pdf') {
            text = await extractTextFromPDF(buffer);
        } else {
            text = extractTextFromText(buffer);
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'No text content found in file' },
                { status: 400 }
            );
        }

        // Chunk the text
        const chunks = chunkTextSmart(text, 1000, 200);

        if (chunks.length === 0) {
            return NextResponse.json(
                { error: 'Failed to process file content' },
                { status: 500 }
            );
        }

        // Generate embeddings for each chunk
        const embeddings = await Promise.all(
            chunks.map((chunk) => getEmbeddings(chunk))
        );

        // Prepare vectors for Pinecone
        const vectors = chunks.map((chunk, index) => ({
            id: `${namespace || 'default'}-${file.originalFilename || 'file'}-${Date.now()}-${index}`,
            values: embeddings[index],
            metadata: {
                text: chunk,
                chunk: chunk, // For compatibility with existing context.ts
                fileName: file.originalFilename || 'unknown',
                fileType: fileExtension,
                chunkIndex: index,
                totalChunks: chunks.length,
                namespace: namespace || 'default',
                uploadedAt: new Date().toISOString(),
            },
        }));

        // Initialize Pinecone and upsert vectors
        const pinecone = new Pinecone();
        const indexName = process.env.PINECONE_INDEX || '';

        if (!indexName) {
            return NextResponse.json(
                { error: 'Pinecone index not configured' },
                { status: 500 }
            );
        }

        const index = pinecone.Index(indexName);

        // Upsert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await index.namespace(namespace || '').upsert(batch);
        }

        return NextResponse.json({
            success: true,
            message: 'File processed successfully',
            fileName: file.originalFilename,
            chunks: chunks.length,
            namespace: namespace,
        });
    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
            { error: `Failed to process file: ${error}` },
            { status: 500 }
        );
    }
}
