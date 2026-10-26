"use client";

export interface CompressionOptions {
    maxSizeMB?: number;
    initialQuality?: number;
    maxWidth?: number;
    maxHeight?: number;
}

export interface CompressionResult {
    file: File;
    originalSizeMB: number;
    finalSizeMB: number;
    compressed: boolean;
}

/**
 * Reusable utility to automatically compress an image on the client side 
 * using HTML Canvas before uploading.
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<CompressionResult> {
    const maxSizeMB = options.maxSizeMB || 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const originalSizeMB = file.size / (1024 * 1024);
    const maxWidth = options.maxWidth || 1920;
    const maxHeight = options.maxHeight || 1920;

    // Convert PNG and JPEG to WEBP to save space and standardize format
    const shouldConvertToWebP = file.type === 'image/png' || file.type === 'image/jpeg';
    const outputType = shouldConvertToWebP ? 'image/webp' : file.type;

    // If SVG, return original
    if (file.type === 'image/svg+xml') {
        return { file, originalSizeMB, finalSizeMB: originalSizeMB, compressed: false };
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = async () => {
            URL.revokeObjectURL(objectUrl);

            let currentWidth = img.width;
            let currentHeight = img.height;
            let currentQuality = options.initialQuality || 0.9;

            // Enforce max dimensions while preserving aspect ratio
            if (currentWidth > maxWidth || currentHeight > maxHeight) {
                const ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);
                currentWidth = Math.round(currentWidth * ratio);
                currentHeight = Math.round(currentHeight * ratio);
            }

            // If file is tiny, dimensions are native, and format fits, we can skip processing
            if (file.size <= maxSizeBytes && currentWidth === img.width && currentHeight === img.height && !shouldConvertToWebP) {
                resolve({ file, originalSizeMB, finalSizeMB: originalSizeMB, compressed: false });
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas not supported in this browser.'));
                return;
            }

            const attemptCompression = async (w: number, h: number, q: number): Promise<File | null> => {
                canvas.width = w;
                canvas.height = h;
                // Clear rect to preserve transparency for WEBP
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);

                return new Promise((resolveBlob) => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolveBlob(null);
                        } else {
                            let fileName = file.name;
                            if (shouldConvertToWebP && outputType === 'image/webp') {
                                fileName = fileName.replace(/\.(png|jpe?g|jpeg)$/i, '.webp');
                            }
                            resolveBlob(new File([blob], fileName, { type: outputType }));
                        }
                    }, outputType, q);
                });
            };

            let resultFile: File | null = null;
            let step = 0;
            const maxSteps = 10; // Prevent infinite loops

            // Progressive compression loop
            while (step < maxSteps) {
                resultFile = await attemptCompression(currentWidth, currentHeight, currentQuality);

                if (!resultFile) {
                    break;
                }

                if (resultFile.size <= maxSizeBytes) {
                    break; // Target reached
                }

                // If quality is still > 0.5, reduce it further
                if (currentQuality > 0.5) {
                    currentQuality -= 0.1;
                } else {
                    // Otherwise start reducing dimensions by 15%
                    currentWidth = Math.round(currentWidth * 0.85);
                    currentHeight = Math.round(currentHeight * 0.85);
                    currentQuality = 0.7; // Reset quality slightly for the new smaller size
                }

                step++;
            }

            if (resultFile) {
                const finalSizeMB = resultFile.size / (1024 * 1024);
                // Even if we couldn't get it under maxSizeBytes, we return the best effort.
                // The server can reject it if it's strictly enforced.
                const optimalFile = resultFile.size < file.size ? resultFile : file;
                const optimalFinalSizeMB = optimalFile.size / (1024 * 1024);

                resolve({
                    file: optimalFile,
                    originalSizeMB,
                    finalSizeMB: optimalFinalSizeMB,
                    compressed: optimalFile.size < file.size
                });
            } else {
                reject(new Error('Image processing failed'));
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to read image file'));
        };

        img.src = objectUrl;
    });
}
