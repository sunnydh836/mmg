"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { createProduct, updateProduct, uploadProductImage } from "./actions";
import Link from "next/link";
import ImageUploadArea, { ImageState } from "./components/ImageUploadArea";

interface ProductFormProps {
    initialData?: any;
    brands: any[];
    categories: any[];
    isEdit?: boolean;
}

export default function ProductForm({ initialData, brands, categories, isEdit }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [images, setImages] = useState<ImageState[]>([]);
    const [priceType, setPriceType] = useState<"public" | "enquiry">(initialData?.price === null ? "enquiry" : "public");
    const router = useRouter();

    // Initialize images if editing
    useEffect(() => {
        if (isEdit && initialData?.images) {
            setImages(initialData.images.map((img: any) => ({
                id: img.id,
                type: "existing",
                url: img.imageUrl
            })));
        }
    }, [isEdit, initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Upload each image separately to stay below Vercel Function request limits.
        for (const img of images) {
            if (img.type !== "new" || !img.file || img.url.startsWith("/") || img.url.startsWith("https://")) continue;
            const uploadData = new FormData();
            uploadData.set("image", img.file);
            const uploaded = await uploadProductImage(uploadData);
            if (uploaded.error || !uploaded.url) {
                setError(uploaded.error || "Product image upload failed");
                setLoading(false);
                return;
            }
            img.url = uploaded.url;
        }

        // Append image metadata after new files have been persisted.
        images.forEach((img, index) => {
            if (img.type === "new" && img.file) {
                formData.append(`imageInfo_${index}`, JSON.stringify({ type: "new", url: img.url, isPrimary: index === 0 }));
            } else if (img.type === "existing") {
                formData.append(`imageInfo_${index}`, JSON.stringify({ type: "existing", id: img.id, isPrimary: index === 0 }));
            }
        });
        formData.append("imageCount", images.length.toString());

        let result;
        if (isEdit && initialData) {
            result = await updateProduct(initialData.id, formData);
        } else {
            result = await createProduct(formData);
        }

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/admin/products");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <Link href="/admin/products" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}</span>
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <section className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Product Name <span className="text-red-500">*</span></label>
                            <input required name="name" defaultValue={initialData?.name} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Brand <span className="text-red-500">*</span></label>
                                <select required name="brandId" defaultValue={initialData?.brandId} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none">
                                    <option value="">Select a brand</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Category <span className="text-red-500">*</span></label>
                                <select required name="categoryId" defaultValue={initialData?.categoryId} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none">
                                    <option value="">Select a category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Short Description</label>
                            <input name="shortDescription" defaultValue={initialData?.shortDescription} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. 256GB • 5G • Pro Camera" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Detailed Description</label>
                            <textarea name="description" defaultValue={initialData?.description} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[150px]" />
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Pricing & Status */}
                    <section className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Pricing & Inventory</h2>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Condition Type</label>
                            <select name="type" defaultValue={initialData?.type || "NEW"} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white outline-none">
                                <option value="NEW">New</option>
                                <option value="USED">Used / Pre-owned</option>
                                <option value="REFURBISHED">Refurbished</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Pricing Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="priceType" value="public" checked={priceType === "public"} onChange={() => setPriceType("public")} className="accent-blue-500" />
                                        <span className="text-sm text-white">Public Price</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="priceType" value="enquiry" checked={priceType === "enquiry"} onChange={() => setPriceType("enquiry")} className="accent-blue-500" />
                                        <span className="text-sm text-white">Price on Enquiry</span>
                                    </label>
                                </div>
                            </div>

                            {priceType === "public" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-2">Selling Price (₹) <span className="text-red-500">*</span></label>
                                        <input type="number" step="0.01" min="0" name="price" required defaultValue={initialData?.price || ""} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white outline-none" placeholder="e.g. 74999" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-2">MRP (₹) <span className="text-neutral-500 text-xs ml-1">(Optional)</span></label>
                                        <input type="number" step="0.01" min="0" name="mrp" defaultValue={initialData?.mrp || ""} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white outline-none" placeholder="e.g. 79999" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Availability</label>
                            <select name="availability" defaultValue={initialData?.availability || "In Stock"} className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white outline-none">
                                <option value="In Stock">In Stock</option>
                                <option value="Limited Stock">Limited Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Available on Order">Available on Order</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="hidden" name="featured" value="false" />
                                    <input type="checkbox" name="featured" value="true" defaultChecked={initialData?.featured} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 border border-white/10 group-hover:border-white/20"></div>
                                </div>
                                <span className="text-sm font-medium text-neutral-300">Featured Product</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="hidden" name="isDemo" value="false" />
                                    <input type="checkbox" name="isDemo" value="true" defaultChecked={initialData?.isDemo} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 border border-white/10 group-hover:border-white/20"></div>
                                </div>
                                <span className="text-sm font-medium text-neutral-300">Mark as Demo / Placeholder (Will generate dynamic images)</span>
                            </label>
                        </div>
                    </section>
                </div>
            </div>

            <div className="mt-8">
                <ImageUploadArea images={images} onChange={setImages} />
            </div>
        </form>
    );
}
