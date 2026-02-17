/**
 * Extract text content from a PDF file buffer
 * NOTE: PDF support is temporarily disabled due to library compatibility issues with Next.js
 * Users can still upload TXT and MD files
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    throw new Error('PDF support is temporarily unavailable. Please upload TXT or MD files instead.');
}

/**
 * Extract text content from TXT or MD file buffer
 */
export function extractTextFromText(buffer: Buffer): string {
    try {
        return buffer.toString('utf-8');
    } catch (error) {
        console.error('Error extracting text from text file:', error);
        throw new Error(`Failed to extract text from file: ${error}`);
    }
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(size: number, maxSizeMB: number = 4): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file type
 * NOTE: PDF temporarily disabled, only TXT and MD supported
 */
export function validateFileType(filename: string): boolean {
    const allowedExtensions = ['txt', 'md']; // Removed 'pdf' temporarily
    const extension = getFileExtension(filename);
    return allowedExtensions.includes(extension);
}
