"use client";

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
    namespace: string;
    onUploadSuccess?: (data: any) => void;
    onUploadError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
    namespace,
    onUploadSuccess,
    onUploadError,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File): string | null => {
        const allowedTypes = ['text/plain', 'text/markdown'];
        const allowedExtensions = ['.txt', '.md'];

        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            return 'Invalid file type. Only TXT and MD files are supported (PDF temporarily unavailable).';
        }

        const maxSize = 4 * 1024 * 1024; // 4MB
        if (file.size > maxSize) {
            return 'File size exceeds 4MB limit.';
        }

        return null;
    };

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setUploadStatus({ type: 'error', message: validationError });
            onUploadError?.(validationError);
            return;
        }

        setIsUploading(true);
        setUploadStatus({ type: null, message: '' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('namespace', namespace);

            const response = await fetch('/api/ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadStatus({
                type: 'success',
                message: `Successfully uploaded ${data.fileName} (${data.chunks} chunks)`,
            });
            onUploadSuccess?.(data);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setUploadStatus({ type: null, message: '' });
            }, 5000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setUploadStatus({ type: 'error', message: errorMessage });
            onUploadError?.(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                await uploadFile(files[0]);
            }
        },
        [namespace]
    );

    const handleFileInput = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                await uploadFile(files[0]);
            }
            // Reset input
            e.target.value = '';
        },
        [namespace]
    );

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        `}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".txt,.md"
                    onChange={handleFileInput}
                    disabled={isUploading}
                />

                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                >
                    {isUploading ? (
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    ) : (
                        <Upload className="w-12 h-12 text-gray-400" />
                    )}

                    <div className="space-y-1">
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            {isUploading ? 'Uploading...' : 'Upload a document'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Drag and drop or click to select
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            TXT or MD files (max 4MB) - PDF temporarily unavailable
                        </p>
                    </div>
                </label>
            </div>

            {/* Status Messages */}
            {uploadStatus.type && (
                <div
                    className={`
            mt-4 p-4 rounded-lg flex items-start gap-3
            ${uploadStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : ''}
            ${uploadStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : ''}
          `}
                >
                    {uploadStatus.type === 'success' && (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    {uploadStatus.type === 'error' && (
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{uploadStatus.message}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
