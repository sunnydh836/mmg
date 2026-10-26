'use client';

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, CheckCircle, XCircle, Image as ImageIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createOffer, updateOffer, deleteOffer, toggleOfferStatus, reorderOffers } from "./actions";
import { useRouter } from "next/navigation";
import { compressImage } from "@/components/admin/image-upload/imageCompression";
import { formatOfferDateRange } from "@/lib/formatters";
import { useEffect } from "react";

interface Offer {
    id: string;
    title: string;
    description: string;
    shortDescription: string | null;
    imageUrl: string | null;
    badge: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    displayOrder: number;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
}

export function OfferClient({ initialOffers }: { initialOffers: Offer[] }) {
    const [offers, setOffers] = useState<Offer[]>(initialOffers);

    // Sync from server to clear out stale cache after revalidation mutations.
    useEffect(() => {
        setOffers(initialOffers);
    }, [initialOffers]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const [formState, setFormState] = useState({
        title: "",
        description: "",
        shortDescription: "",
        badge: "",
        ctaText: "",
        ctaLink: "",
        startDate: "",
        endDate: "",
        isActive: true,
        imageFile: null as File | null,
        imagePreview: null as string | null,
    });

    const resetForm = () => {
        setFormState({
            title: "",
            description: "",
            shortDescription: "",
            badge: "",
            ctaText: "",
            ctaLink: "",
            startDate: "",
            endDate: "",
            isActive: true,
            imageFile: null,
            imagePreview: null,
        });
        setEditingOffer(null);
        setIsFormOpen(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Unsupported format. Use JPG, PNG, or WEBP.");
            return;
        }

        try {
            setIsCompressing(true);
            const { file: processedFile, compressed } = await compressImage(file, { maxSizeMB: 2 });
            setIsCompressing(false);

            if (processedFile.size > 5 * 1024 * 1024) {
                setError("Image is too large.");
                return;
            }

            setFormState(prev => ({
                ...prev,
                imageFile: processedFile,
                imagePreview: URL.createObjectURL(processedFile)
            }));
        } catch (err) {
            console.error("Compression error:", err);
            setError("Failed to process image.");
            setIsCompressing(false);
        }
    };

    const startAdd = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const startEdit = (offer: Offer) => {
        setFormState({
            title: offer.title,
            description: offer.description,
            shortDescription: offer.shortDescription || "",
            badge: offer.badge || "",
            ctaText: offer.ctaText || "",
            ctaLink: offer.ctaLink || "",
            startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : "",
            endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : "",
            isActive: offer.isActive,
            imageFile: null,
            imagePreview: offer.imageUrl,
        });
        setEditingOffer(offer);
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const formData = new FormData();
        formData.append("title", formState.title);
        formData.append("description", formState.description);
        formData.append("shortDescription", formState.shortDescription);
        formData.append("badge", formState.badge);
        formData.append("ctaText", formState.ctaText);
        formData.append("ctaLink", formState.ctaLink);
        formData.append("isActive", String(formState.isActive));

        if (formState.startDate) formData.append("startDate", new Date(formState.startDate).toISOString());
        if (formState.endDate) formData.append("endDate", new Date(formState.endDate).toISOString());
        if (formState.imageFile) formData.append("image", formState.imageFile);

        let result;
        if (editingOffer) {
            formData.append("displayOrder", String(editingOffer.displayOrder));
            result = await updateOffer(editingOffer.id, formData);
        } else {
            formData.append("displayOrder", String(offers.length));
            result = await createOffer(formData);
        }

        if (result.error) {
            setError(result.error);
        } else {
            setSuccessMessage(editingOffer ? "Offer updated successfully" : "Offer created successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
            resetForm();
            router.refresh(); // Rely on server data refetch instead of complex optimistic UI for images
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer?")) return;
        setOffers(offers.filter(o => o.id !== id));
        const res = await deleteOffer(id);
        if (res.error) setError(res.error);
        router.refresh();
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        setOffers(offers.map(o => o.id === id ? { ...o, isActive: newStatus } : o));
        const res = await toggleOfferStatus(id, newStatus);
        if (res.error) setError(res.error);
        router.refresh();
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === offers.length - 1)) return;

        const newOffers = [...offers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newOffers[index];
        newOffers[index] = newOffers[targetIndex];
        newOffers[targetIndex] = temp;

        const updatedOffers = newOffers.map((o, idx) => ({ ...o, displayOrder: idx }));
        setOffers(updatedOffers);

        const itemsToUpdate = updatedOffers.map(o => ({ id: o.id, displayOrder: o.displayOrder }));
        const res = await reorderOffers(itemsToUpdate);
        if (res.error) setError(res.error);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {(error || successMessage) && (
                <div className={`p-4 rounded-xl border ${error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {error || successMessage}
                </div>
            )}

            {!isFormOpen ? (
                <>
                    <div className="flex justify-between items-center bg-neutral-900 border border-white/5 p-4 rounded-xl">
                        <div>
                            <h2 className="text-white font-medium">Active Offers</h2>
                            <p className="text-xs text-neutral-400">{offers.length} total offers</p>
                        </div>
                        <Button variant="primary" onClick={startAdd} className="gap-2">
                            <Plus className="w-4 h-4" /> Add Offer
                        </Button>
                    </div>

                    <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-neutral-950/50 text-neutral-400 border-b border-white/5">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Order</th>
                                    <th className="px-4 py-3 font-medium">Image</th>
                                    <th className="px-4 py-3 font-medium">Offer Details</th>
                                    <th className="px-4 py-3 font-medium">Badge/Dates</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {offers.map((offer, index) => (
                                        <motion.tr
                                            key={offer.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="text-white bg-white/10 px-2 py-0.5 rounded text-xs">#{index + 1}</span>
                                                    <div className="flex gap-1 mt-1">
                                                        <button disabled={index === 0} onClick={() => handleMove(index, 'up')} className="p-1 text-neutral-500 hover:text-white rounded disabled:opacity-30">
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button disabled={index === offers.length - 1} onClick={() => handleMove(index, 'down')} className="p-1 text-neutral-500 hover:text-white rounded disabled:opacity-30">
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {offer.imageUrl ? (
                                                    <div className="w-16 h-10 relative rounded overflow-hidden">
                                                        <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover" />
                                                    </div>
                                                ) : <ImageIcon className="w-6 h-6 text-neutral-600" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-white font-medium">{offer.title}</div>
                                                <div className="text-neutral-400 text-xs w-[200px] truncate">{offer.shortDescription || offer.description}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <div className="text-cyan-400 font-medium mb-1">{offer.badge || ''}</div>
                                                <div className="text-neutral-500">
                                                    {formatOfferDateRange(offer.startDate, offer.endDate)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleToggleStatus(offer.id, offer.isActive)} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold ${offer.isActive ? "bg-green-500/20 text-green-400" : "bg-neutral-500/20 text-neutral-400"}`}>
                                                    {offer.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                    {offer.isActive ? "Active" : "Hidden"}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => startEdit(offer)} className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(offer.id)} className="p-1.5 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {offers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">No offers found. Create one.</td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl relative">
                    <button onClick={resetForm} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-medium text-white mb-6">{editingOffer ? "Edit Offer" : "Create New Offer"}</h2>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Col */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Offer Title <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Short Description (for homepage card)</label>
                                    <input type="text" value={formState.shortDescription} onChange={e => setFormState({ ...formState, shortDescription: e.target.value })} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Detailed Description (optional internal)</label>
                                    <textarea value={formState.description} onChange={e => setFormState({ ...formState, description: e.target.value })} rows={3} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white resize-none" />
                                </div>
                            </div>

                            {/* Right Col */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Badge / Tag (e.g., LIMITED OFFER)</label>
                                    <input type="text" value={formState.badge} onChange={e => setFormState({ ...formState, badge: e.target.value })} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">CTA Text</label>
                                        <input type="text" value={formState.ctaText} onChange={e => setFormState({ ...formState, ctaText: e.target.value })} placeholder="e.g. Enquire Now" className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">CTA Link</label>
                                        <input type="text" value={formState.ctaLink} onChange={e => setFormState({ ...formState, ctaLink: e.target.value })} placeholder="e.g. /products" className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">Start Date</label>
                                        <input type="date" value={formState.startDate} onChange={e => setFormState({ ...formState, startDate: e.target.value })} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">End Date</label>
                                        <input type="date" value={formState.endDate} onChange={e => setFormState({ ...formState, endDate: e.target.value })} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" checked={formState.isActive} onChange={e => setFormState({ ...formState, isActive: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-neutral-950 text-cyan-500" />
                                        <span className="text-white">Active</span>
                                    </label>
                                    <p className="text-xs text-neutral-500 mt-1">Inactive offers are hidden regardless of dates.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-6">
                            <label className="block text-sm text-neutral-400 mb-2">Offer Image / Banner</label>
                            <div className="flex items-start gap-6">
                                <div className="flex-1">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isCompressing}>
                                        {isCompressing ? "Processing..." : "Select Image"}
                                    </Button>
                                    <p className="text-xs text-neutral-500 mt-2">Recommended: Widescreen banner format (approx 16:9 or 21:9). Max 5MB.</p>
                                </div>
                                {formState.imagePreview && (
                                    <div className="w-[300px] h-[150px] relative rounded-lg overflow-hidden border border-white/10">
                                        <Image src={formState.imagePreview} alt="Preview" fill className="object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={isSaving || isCompressing}>
                                {isSaving ? "Saving..." : "Save Offer"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
