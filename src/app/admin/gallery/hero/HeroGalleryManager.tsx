"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, ArrowLeft, ArrowRight, Check, X, Image as ImageIcon, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addHeroImage, deleteHeroImage, toggleHeroImageStatus, reorderHeroImages } from "./actions";
import { useRouter } from "next/navigation";
import { compressImage } from "@/components/admin/image-upload/imageCompression";

interface HeroImage {
    id: string;
    imageUrl: string;
    displayOrder: number;
    isActive: boolean;
}

export function HeroGalleryManager({ initialImages }: { initialImages: HeroImage[] }) {
    const [images, setImages] = useState<HeroImage[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionStats, setCompressionStats] = useState<{ originalMB: number; finalMB: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const activeCount = images.filter(img => img.isActive).length;

    const handleUploadClick = () => {
        if (activeCount >= 6 && images.length >= 6) {
            setError("Maximum 6 hero images allowed.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccessMessage(null);
        setCompressionStats(null);

        // Image type validation
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Unsupported image format. Please upload JPG, PNG, or WEBP.");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        try {
            setIsCompressing(true);
            const { file: processedFile, originalSizeMB, finalSizeMB, compressed } = await compressImage(file, { maxSizeMB: 5 });
            setIsCompressing(false);

            if (compressed) {
                setCompressionStats({ originalMB: originalSizeMB, finalMB: finalSizeMB });
            }

            if (processedFile.size > 5 * 1024 * 1024) {
                setError("Image is too large and could not be compressed under 5 MB.");
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }

            setIsUploading(true);

            const formData = new FormData();
            formData.append("image", processedFile);

            const result = await addHeroImage(formData);

            if (result?.error) {
                // If server explicitly returns error
                if (result.error.toLowerCase().includes("body exceeded") || result.error.toLowerCase().includes("size limit")) {
                    setError("Image upload failed. Maximum file size is 5 MB.");
                } else {
                    setError(result.error);
                }
            } else if (result?.success && result.heroImage) {
                setImages(prev => [...prev, result.heroImage as HeroImage]);
                setSuccessMessage("Hero image uploaded successfully.");
                setTimeout(() => setSuccessMessage(null), 3000);

                // Refresh backend state subtly while UI reflects optimistic update
                router.refresh();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "";
            console.error("Upload error caught client-side:", err);
            if (errorMessage.toLowerCase().includes("body exceeded") || errorMessage.toLowerCase().includes("size limit")) {
                setError("Image upload failed. Maximum file size is 5 MB.");
            } else {
                setError("Failed to upload hero image. Please try again.");
            }
        } finally {
            setIsUploading(false);
            setIsCompressing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this hero image?")) return;

        setError(null);
        setImages(images.filter(img => img.id !== id));
        const result = await deleteHeroImage(id);

        if (result?.error) {
            setError(result.error);
            router.refresh();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const isActivating = !currentStatus;
        if (isActivating && activeCount >= 6) {
            setError("Maximum 6 active hero images allowed.");
            return;
        }

        setError(null);
        setImages(images.map(img => img.id === id ? { ...img, isActive: isActivating } : img));
        const result = await toggleHeroImageStatus(id, isActivating);

        if (result?.error) {
            setError(result.error);
            router.refresh();
        }
    };

    const handleMove = async (index: number, direction: 'left' | 'right') => {
        setError(null);
        if (
            (direction === 'left' && index === 0) ||
            (direction === 'right' && index === images.length - 1)
        ) return;

        const newImages = [...images];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;

        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;

        const updatedImages = newImages.map((img, i) => ({ ...img, displayOrder: i }));
        setImages(updatedImages);

        const itemsToUpdate = updatedImages.map(img => ({ id: img.id, displayOrder: img.displayOrder }));
        const result = await reorderHeroImages(itemsToUpdate);

        if (result?.error) {
            setError(result.error);
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-neutral-900 border border-white/5 p-4 rounded-xl">
                <div className="flex flex-col">
                    <h2 className="text-white font-medium">Upload Hero Image</h2>
                    <p className="text-xs text-neutral-400 mt-1">Recommended size: 1920x1080px. High quality required.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button
                        variant="primary"
                        onClick={handleUploadClick}
                        disabled={isUploading || isCompressing || activeCount >= 6}
                        className="whitespace-nowrap"
                    >
                        {isCompressing ? "Processing..." : isUploading ? "Uploading..." : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Upload Hero Image
                            </span>
                        )}
                    </Button>
                    <span className="text-xs text-neutral-500 font-medium tracking-wide bg-neutral-800 px-2 py-1 rounded-md">
                        {activeCount} / 6 ACTIVE
                    </span>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                </div>
            )}

            {compressionStats && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 text-sm font-medium">
                    Image optimized: Original {compressionStats.originalMB.toFixed(1)} MB → {compressionStats.finalMB.toFixed(1)} MB
                </div>
            )}

            {successMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm font-medium">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden group flex flex-col"
                        >
                            <div className="relative aspect-video bg-neutral-950">
                                <Image
                                    src={image.imageUrl}
                                    alt={`Hero Image ${index + 1}`}
                                    fill
                                    className={`object-cover transition-opacity duration-300 ${!image.isActive ? 'opacity-40 grayscale' : 'opacity-100 group-hover:scale-105'}`}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                    <span className="bg-black/80 backdrop-blur text-white text-xs font-semibold px-2 py-1 rounded border border-white/10">
                                        #{index + 1}
                                    </span>
                                    <button
                                        onClick={() => handleToggleStatus(image.id, image.isActive)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold backdrop-blur border transition-colors
                                            ${image.isActive
                                                ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                                                : "bg-neutral-500/20 text-neutral-400 border-neutral-500/30 hover:bg-neutral-500/30"
                                            }
                                        `}
                                    >
                                        {image.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                        {image.isActive ? "Active" : "Inactive"}
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex items-center justify-between border-t border-white/5 bg-neutral-900/50">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleMove(index, 'left')}
                                        disabled={index === 0}
                                        className="p-1.5 text-neutral-400 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        title="Move Left"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'right')}
                                        disabled={index === images.length - 1}
                                        className="p-1.5 text-neutral-400 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        title="Move Right"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleDelete(image.id)}
                                    className="p-1.5 text-red-400 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                    title="Delete Image"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-neutral-900/30 rounded-2xl border border-white/5 border-dashed">
                            <ImageIcon className="w-12 h-12 text-neutral-600 mb-4" />
                            <p className="text-neutral-400">No hero images uploaded yet.</p>
                            <Button variant="outline" className="mt-4" onClick={handleUploadClick}>
                                Upload First Image
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
