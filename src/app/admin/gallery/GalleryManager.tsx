"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, ArrowLeft, ArrowRight, Check, X, Image as ImageIcon, Save, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addGalleryImage, deleteGalleryImage, toggleGalleryImageStatus, reorderGalleryImages, updateGalleryImage } from "./actions";
import { useRouter } from "next/navigation";
import { compressImage } from "@/components/admin/image-upload/imageCompression";

interface GalleryImage {
    id: string;
    imageUrl: string;
    title: string | null;
    category: string;
    displayOrder: number;
    isActive: boolean;
}

const CATEGORIES = ["STORE", "PHONES", "ACCESSORIES", "EVENTS"];

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionStats, setCompressionStats] = useState<{ originalMB: number; finalMB: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const [uploadCategory, setUploadCategory] = useState("STORE");
    const [uploadTitle, setUploadTitle] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ title: string, category: string }>({ title: "", category: "STORE" });

    const handleUploadClick = () => {
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
            if (uploadTitle.trim()) {
                formData.append("title", uploadTitle.trim());
            }
            formData.append("category", uploadCategory);

            const result = await addGalleryImage(formData);

            if (result?.error) {
                if (result.error.toLowerCase().includes("body exceeded") || result.error.toLowerCase().includes("size limit")) {
                    setError("Image upload failed. Maximum file size is 5 MB.");
                } else {
                    setError(result.error);
                }
            } else if (result?.success && result.galleryImage) {
                setImages(prev => [...prev, result.galleryImage as GalleryImage]);
                setSuccessMessage("Gallery image uploaded successfully.");
                setUploadTitle(""); // Reset
                setTimeout(() => setSuccessMessage(null), 3000);
                router.refresh();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "";
            console.error("Upload error caught client-side:", err);
            if (errorMessage.toLowerCase().includes("body exceeded") || errorMessage.toLowerCase().includes("size limit")) {
                setError("Image upload failed. Maximum file size is 5 MB.");
            } else {
                setError("Failed to upload gallery image. Please try again.");
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
        if (!window.confirm("Delete this gallery image? Deleting it will remove it from the gallery.")) return;

        setError(null);
        setImages(images.filter(img => img.id !== id));
        const result = await deleteGalleryImage(id);

        if (result?.error) {
            setError(result.error);
            router.refresh();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const isActivating = !currentStatus;
        setError(null);
        setImages(images.map(img => img.id === id ? { ...img, isActive: isActivating } : img));
        const result = await toggleGalleryImageStatus(id, isActivating);

        if (result?.error) {
            setError(result.error);
            router.refresh();
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        setError(null);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === images.length - 1)
        ) return;

        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;

        const updatedImages = newImages.map((img, i) => ({ ...img, displayOrder: i }));
        setImages(updatedImages);

        const itemsToUpdate = updatedImages.map(img => ({ id: img.id, displayOrder: img.displayOrder }));
        const result = await reorderGalleryImages(itemsToUpdate);

        if (result?.error) {
            setError(result.error);
            router.refresh();
        }
    };

    const startEditing = (img: GalleryImage) => {
        setEditingId(img.id);
        setEditForm({ title: img.title || "", category: img.category });
    };

    const handleSaveEdit = async (id: string) => {
        const formData = new FormData();
        if (editForm.title.trim()) {
            formData.append("title", editForm.title.trim());
        }
        formData.append("category", editForm.category);

        // Optimistically update
        setImages(images.map(img => img.id === id ? { ...img, title: editForm.title.trim() || null, category: editForm.category } : img));
        setEditingId(null);

        const result = await updateGalleryImage(id, formData);
        if (result?.error) {
            setError(result.error);
            router.refresh();
        } else {
            setSuccessMessage("Gallery image updated.");
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-neutral-900 border border-white/5 p-4 rounded-xl space-y-4">
                <div className="flex flex-col">
                    <h2 className="text-white font-medium">Upload New Gallery Image</h2>
                    <p className="text-xs text-neutral-400 mt-1">Provide a high quality photo to be shown on the public gallery.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Title / Caption (optional)</label>
                        <input
                            type="text"
                            className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                            placeholder="e.g. Shop Exterior"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Category</label>
                        <select
                            className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
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
                        disabled={isUploading || isCompressing}
                        className="whitespace-nowrap"
                    >
                        {isCompressing ? "Processing..." : isUploading ? "Uploading..." : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Upload & Add to Gallery
                            </span>
                        )}
                    </Button>
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

            <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-x-auto min-w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-neutral-950/50 text-neutral-400 border-b border-white/5">
                        <tr>
                            <th className="px-4 py-3 font-medium">Order</th>
                            <th className="px-4 py-3 font-medium">Thumbnail</th>
                            <th className="px-4 py-3 font-medium">Title & Category</th>
                            <th className="px-4 py-3 font-medium">Active</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {images.map((image, index) => (
                                <motion.tr
                                    key={image.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="text-white bg-white/10 px-2 py-0.5 rounded text-xs">#{index + 1}</span>
                                            <div className="flex gap-1 mt-1">
                                                <button
                                                    onClick={() => handleMove(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-neutral-500 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                                                </button>
                                                <button
                                                    onClick={() => handleMove(index, 'down')}
                                                    disabled={index === images.length - 1}
                                                    className="p-1 text-neutral-500 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="relative w-16 h-12 bg-neutral-950 rounded overflow-hidden">
                                            <Image
                                                src={image.imageUrl}
                                                alt={image.title || "Gallery image"}
                                                fill
                                                className={`object-cover ${!image.isActive ? 'grayscale opacity-50' : ''}`}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-normal min-w-[200px]">
                                        {editingId === image.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="Title (optional)"
                                                    className="w-full bg-neutral-950 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                                                />
                                                <select
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full bg-neutral-950 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                                                >
                                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-white font-medium">{image.title || <span className="text-neutral-500 italic">No title</span>}</div>
                                                <div className="text-xs text-neutral-400 mt-0.5 px-1.5 py-0.5 bg-neutral-800 rounded-md inline-block">{image.category}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
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
                                            {image.isActive ? "Active" : "Hidden"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {editingId === image.id ? (
                                            <button
                                                onClick={() => handleSaveEdit(image.id)}
                                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                                                title="Save"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startEditing(image)}
                                                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {images.length === 0 && (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key="empty-state"
                                >
                                    <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        No gallery images found.
                                    </td>
                                </motion.tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
