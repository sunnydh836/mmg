"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, GripVertical, AlertTriangle, Loader2 } from "lucide-react";
import { MAX_PRODUCT_IMAGE_SIZE_MB, ORIGINAL_UPLOAD_LIMIT_MB, MAX_PRODUCT_IMAGES, ALLOWED_IMAGE_TYPES } from "@/lib/constants";
import { compressImage } from "@/components/admin/image-upload/imageCompression";

export interface ImageState {
    id: string;
    type: "new" | "existing";
    url: string;
    file?: File;
}

interface ImageUploadAreaProps {
    images: ImageState[];
    onChange: (images: ImageState[]) => void;
}

export default function ImageUploadArea({ images, onChange }: ImageUploadAreaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionMessage, setCompressionMessage] = useState<string | null>(null);

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            images.forEach((img) => {
                if (img.type === "new") {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const processFiles = async (files: File[]) => {
        setError(null);
        setCompressionMessage(null);
        setIsCompressing(true);

        const validFiles: File[] = [];
        let currentError: string | null = null;
        let anyCompressed = false;
        let totalOriginal = 0;
        let totalFinal = 0;

        for (const file of files) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                currentError = `Invalid file type: ${file.name}. Only JPG, PNG, WEBP are allowed.`;
                break;
            }

            // Check original upload limit before compression
            if (file.size > ORIGINAL_UPLOAD_LIMIT_MB * 1024 * 1024) {
                currentError = `Original file too large: ${file.name}. Maximum upload size is ${ORIGINAL_UPLOAD_LIMIT_MB}MB.`;
                break;
            }

            try {
                const { file: processedFile, originalSizeMB, finalSizeMB, compressed } = await compressImage(file, { maxSizeMB: MAX_PRODUCT_IMAGE_SIZE_MB });

                // Check if final size is within limit
                if (processedFile.size > MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024) {
                    currentError = `File too large: ${file.name}. Maximum size is ${MAX_PRODUCT_IMAGE_SIZE_MB}MB.`;
                    break;
                }

                validFiles.push(processedFile);
                if (compressed) {
                    anyCompressed = true;
                    totalOriginal += originalSizeMB;
                    totalFinal += finalSizeMB;
                }
            } catch (e) {
                currentError = `Failed to process image: ${file.name}`;
                break;
            }
        }

        setIsCompressing(false);

        if (currentError) {
            setError(currentError);
            return;
        }

        if (anyCompressed) {
            setCompressionMessage(`Images optimized: Original ${totalOriginal.toFixed(1)} MB → ${totalFinal.toFixed(1)} MB`);
        }

        if (images.length + validFiles.length > MAX_PRODUCT_IMAGES) {
            setError(`You can only upload up to ${MAX_PRODUCT_IMAGES} images in total.`);
            return;
        }

        const newImageStates: ImageState[] = validFiles.map((file) => ({
            id: Math.random().toString(36).substring(7),
            type: "new",
            url: URL.createObjectURL(file),
            file: file,
        }));

        onChange([...images, ...newImageStates]);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFiles(Array.from(e.target.files));
            // Reset input so the same file could be selected again if removed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        const imgToRemove = images.find(img => img.id === id);
        if (imgToRemove && imgToRemove.type === "new") {
            URL.revokeObjectURL(imgToRemove.url);
        }
        onChange(images.filter((img) => img.id !== id));
    };

    const setAsPrimary = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        const index = images.findIndex((img) => img.id === id);
        if (index > 0) {
            const newImages = [...images];
            const [selected] = newImages.splice(index, 1);
            newImages.unshift(selected); // Move to start (primary)
            onChange(newImages);
        }
    };

    // Keep re-ordering simple with buttons rather than complex drag-drop to avoid external dependencies
    const moveImage = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        const temp = newImages[index];
        newImages[index] = newImages[swapIndex];
        newImages[swapIndex] = temp;

        onChange(newImages);
    };

    return (
        <section className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Product Images</h2>
                <p className="text-sm text-neutral-400">
                    Upload up to {MAX_PRODUCT_IMAGES} images. Supported formats: JPG, PNG, WEBP. Maximum original size: {ORIGINAL_UPLOAD_LIMIT_MB}MB.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {compressionMessage && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 text-sm font-medium">
                    {compressionMessage}
                </div>
            )}

            {/* Drop Zone */}
            {images.length < MAX_PRODUCT_IMAGES && (
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? "border-blue-500 bg-blue-500/5" : "border-neutral-700/50 hover:border-neutral-600 bg-neutral-950/50"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {isCompressing ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-4">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-sm font-medium text-blue-500">
                                Processing images...
                            </p>
                        </div>
                    ) : (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept={ALLOWED_IMAGE_TYPES.join(',')}
                                onChange={handleChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Click to select images"
                            />
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white mb-1">
                                        Drag & drop images here or Click to browse
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        You can select multiple files at once
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            className={`group relative aspect-square bg-neutral-950 rounded-xl border overflow-hidden ${index === 0 ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "border-white/5"
                                }`}
                        >
                            {/* Image element */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Primary Badge */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                                    PRIMARY
                                </div>
                            )}

                            {/* Hover Controls Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button
                                    onClick={(e) => removeImage(img.id, e)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition-colors"
                                    title="Remove Image"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex gap-2">
                                    {index > 0 && (
                                        <button
                                            onClick={(e) => moveImage(index, 'up', e)}
                                            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded outline-none transition-colors"
                                            title="Move Left"
                                        >
                                            <span className="text-xs font-bold">&larr;</span>
                                        </button>
                                    )}

                                    {index < images.length - 1 && (
                                        <button
                                            onClick={(e) => moveImage(index, 'down', e)}
                                            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded outline-none transition-colors"
                                            title="Move Right"
                                        >
                                            <span className="text-xs font-bold">&rarr;</span>
                                        </button>
                                    )}
                                </div>

                                {index !== 0 && (
                                    <button
                                        onClick={(e) => setAsPrimary(img.id, e)}
                                        className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded hover:bg-neutral-200 transition-colors"
                                    >
                                        Set Primary
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
