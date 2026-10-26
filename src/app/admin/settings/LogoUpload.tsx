"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compressImage } from "@/components/admin/image-upload/imageCompression";
import { uploadStoreLogo, removeStoreLogo } from "./actions";
import { useRouter } from "next/navigation";

export default function LogoUpload({ initialLogoUrl }: { initialLogoUrl: string | null }) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Unsupported format. Use JPG, PNG, or WEBP.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            setIsCompressing(true);
            const { file: processedFile } = await compressImage(file, { maxSizeMB: 5 });
            setIsCompressing(false);

            if (processedFile.size > 5 * 1024 * 1024) {
                setError("Image is too large and could not be compressed under 5 MB.");
                return;
            }

            setIsUploading(true);
            const formData = new FormData();
            formData.append("image", processedFile);

            const result = await uploadStoreLogo(formData);

            if (result.error) {
                setError(result.error);
            } else if (result.success && result.url) {
                setLogoUrl(result.url);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "Failed to upload logo.");
        } finally {
            setIsUploading(false);
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = async () => {
        if (!window.confirm("Are you sure you want to remove the brand logo?")) return;

        setError(null);
        setLogoUrl(null); // optimistic

        const result = await removeStoreLogo();
        if (result.error) {
            setError(result.error);
            setLogoUrl(initialLogoUrl); // rollback
        } else {
            router.refresh();
        }
    };

    return (
        <div className="bg-neutral-900 border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Brand Logo</h3>
            <p className="text-sm text-neutral-400 mb-6">
                This logo will appear in the top-left corner of the public website and admin panel beside the shop name. Prefer a square or circular composition for best results.
            </p>

            {error && (
                <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative w-24 h-24 bg-neutral-950 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden shrink-0 group">
                    {logoUrl ? (
                        <Image
                            src={logoUrl}
                            alt="Brand Logo"
                            fill
                            className="object-contain p-2"
                        />
                    ) : (
                        <div className="text-xs text-neutral-500 text-center p-2">No logo</div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="primary"
                            onClick={handleUploadClick}
                            disabled={isUploading || isCompressing}
                            className="whitespace-nowrap"
                        >
                            {isCompressing ? "Compressing..." : isUploading ? "Uploading..." : (
                                <span className="flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> {logoUrl ? "Replace Logo" : "Upload Logo"}
                                </span>
                            )}
                        </Button>

                        {logoUrl && (
                            <Button
                                variant="outline"
                                onClick={handleRemove}
                                disabled={isUploading || isCompressing}
                                className="whitespace-nowrap text-red-400 hover:text-red-300 hover:border-red-500/30"
                            >
                                <span className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Remove
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {/* We also store logoUrl in a hidden field so updateSettings receives it when hitting total sumbit, just in case, though we separated the APIs */}
            <input type="hidden" name="logoUrl" value={logoUrl || ""} />
        </div>
    );
}
