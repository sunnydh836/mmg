"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, Save } from "lucide-react";
import { addReel, updateReel } from "@/app/admin/gallery/reels/actions";
import { compressImage } from "@/components/admin/image-upload/imageCompression";

interface ReelFormProps {
    initialData?: {
        id: string;
        title: string | null;
        reelUrl: string;
        thumbnailUrl: string | null;
        thumbnailSource: string;
        displayOrder: number;
        isActive: boolean;
    };
    onClose?: () => void;
}

export function ReelForm({ initialData, onClose }: ReelFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.thumbnailUrl || null);
    const [removeCustom, setRemoveCustom] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionStats, setCompressionStats] = useState<{ originalMB: number; finalMB: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File | undefined) => {
        if (!file) return;

        setError(null);
        setSuccess(null);
        setCompressionStats(null);

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Unsupported image format. Please upload JPG, PNG, or WEBP.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            setIsCompressing(true);
            const { file: processedFile, originalSizeMB, finalSizeMB, compressed } = await compressImage(file, { maxSizeMB: 5 });
            setIsCompressing(false);

            if (processedFile.size > 5 * 1024 * 1024) {
                setError("Image is too large and could not be compressed under 5 MB.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            if (compressed) {
                setCompressionStats({ originalMB: originalSizeMB, finalMB: finalSizeMB });
            }

            setCustomThumbnail(processedFile);
            setPreviewUrl(URL.createObjectURL(processedFile));
            setRemoveCustom(false);
        } catch (e) {
            setIsCompressing(false);
            setError("Failed to process image.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFile(e.target.files?.[0]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files?.[0]);
    };

    const handleAreaClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveCustom = () => {
        setCustomThumbnail(null);
        setRemoveCustom(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (initialData?.thumbnailSource === "CUSTOM") {
            setPreviewUrl(null);
        } else if (initialData?.thumbnailUrl) {
            setPreviewUrl(initialData.thumbnailUrl);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        if (customThumbnail) {
            formData.set("thumbnail", customThumbnail);
        }
        if (removeCustom) {
            formData.set("removeCustomThumbnail", "true");
        }

        const reelUrl = formData.get("reelUrl") as string;
        if (!reelUrl.includes("instagram.com/reel/")) {
            setIsLoading(false);
            setError("Must be a valid Instagram Reel URL (e.g. https://www.instagram.com/reel/XXXXX/)");
            return;
        }

        try {
            const res = initialData
                ? await updateReel(initialData.id, formData)
                : await addReel(formData);

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(initialData ? "Reel updated successfully!" : "Reel added successfully!");
                if (!initialData && formRef.current) {
                    formRef.current.reset();
                    setCustomThumbnail(null);
                    setPreviewUrl(null);
                    setRemoveCustom(false);
                }
                router.refresh();

                if (onClose) {
                    setTimeout(() => {
                        setSuccess(null);
                        onClose();
                    }, 1500);
                } else {
                    setTimeout(() => setSuccess(null), 3000);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-lg text-sm">
                    {success}
                </div>
            )}
            {compressionStats && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-4 py-3 rounded-lg text-sm">
                    Image optimized: Original {compressionStats.originalMB.toFixed(1)} MB → {compressionStats.finalMB.toFixed(1)} MB
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Instagram Reel URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        name="reelUrl"
                        id="reelUrl"
                        required
                        defaultValue={initialData?.reelUrl}
                        pattern=".*instagram\.com\/reel\/.*"
                        placeholder="https://www.instagram.com/reel/XXXXXXXXXXX/"
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Reel Title (Optional)
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        defaultValue={initialData?.title || ""}
                        placeholder="e.g. New Smartphone Launch"
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Thumbnail (Optional)
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                        We will attempt to automatically fetch the thumbnail from Instagram.
                        If it fails, you can upload a custom fallback thumbnail here.
                    </p>

                    <div
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? "border-brand bg-brand/5" : "border-border hover:border-brand/50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleAreaClick}
                    >
                        <div className="space-y-1 text-center">
                            {previewUrl ? (
                                <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewUrl}
                                        alt="Thumbnail preview"
                                        className="h-32 object-contain rounded-md bg-secondary/50 p-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveCustom}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {isCompressing ? (
                                        <>
                                            <Loader2 className="mx-auto h-12 w-12 text-brand animate-spin mb-2" />
                                            <span className="font-medium text-brand">Processing image...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <div className="flex text-sm mt-2">
                                                <span className="font-medium text-brand">
                                                    Upload a file
                                                </span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    disabled={isCompressing}
                                                    accept="image/png,image/jpeg,image/webp"
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef}
                                                />
                                                <p className="pl-1 text-muted-foreground">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PNG, JPG, WEBP up to 5MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Display Order
                        </label>
                        <input
                            type="number"
                            name="displayOrder"
                            id="displayOrder"
                            defaultValue={initialData?.displayOrder ?? 0}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Status
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                value="true"
                                defaultChecked={initialData?.isActive ?? true}
                                className="w-5 h-5 rounded border-border text-brand focus:ring-brand bg-secondary/50"
                            />
                            <span className="text-sm">Active</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-border mt-6">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading || isCompressing}
                    className={`flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors ${isLoading || isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span>
                        {isLoading
                            ? (initialData ? "Updating Reel..." : "Adding Reel...")
                            : (initialData ? "Update Reel" : "Add Reel")
                        }
                    </span>
                </button>
            </div>
        </form>
    );
}
