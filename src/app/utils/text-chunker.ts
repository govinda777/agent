/**
 * Split text into overlapping chunks
 * @param text - The text to split
 * @param chunkSize - Size of each chunk in characters
 * @param overlap - Number of characters to overlap between chunks
 * @returns Array of text chunks
 */
export function chunkText(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
): string[] {
    // Handle edge cases
    if (!text || text.trim().length === 0) {
        return [];
    }

    if (text.length <= chunkSize) {
        return [text];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        // Calculate end index for this chunk
        const endIndex = Math.min(startIndex + chunkSize, text.length);

        // Extract the chunk
        const chunk = text.substring(startIndex, endIndex);
        chunks.push(chunk);

        // Move to next chunk with overlap
        // If we're at the end, break to avoid infinite loop
        if (endIndex === text.length) {
            break;
        }

        // Move start index forward, accounting for overlap
        startIndex += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Split text into chunks with smart boundary detection
 * Tries to split at sentence boundaries when possible
 */
export function chunkTextSmart(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
): string[] {
    if (!text || text.trim().length === 0) {
        return [];
    }

    if (text.length <= chunkSize) {
        return [text];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + chunkSize, text.length);

        // If not at the end of text, try to find a sentence boundary
        if (endIndex < text.length) {
            // Look for sentence endings within the last 20% of the chunk
            const searchStart = endIndex - Math.floor(chunkSize * 0.2);
            const searchText = text.substring(searchStart, endIndex);

            // Find the last sentence ending (., !, ?, or newline)
            const sentenceEndings = ['. ', '.\n', '! ', '!\n', '? ', '?\n', '\n\n'];
            let lastBoundary = -1;

            for (const ending of sentenceEndings) {
                const pos = searchText.lastIndexOf(ending);
                if (pos > lastBoundary) {
                    lastBoundary = pos + ending.length;
                }
            }

            // If we found a good boundary, use it
            if (lastBoundary > 0) {
                endIndex = searchStart + lastBoundary;
            }
        }

        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        if (endIndex === text.length) {
            break;
        }

        startIndex = endIndex - overlap;
    }

    return chunks;
}
