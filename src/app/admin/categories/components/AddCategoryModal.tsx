"use client";

import { useState, useEffect } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import { createCategory } from "../actions";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (msg: string) => void;
}

export function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
    const [name, setName] = useState("");
    const [slugPreview, setSlugPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-generate slug preview
    useEffect(() => {
        const generated = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setSlugPreview(generated);
    }, [name]);

    // Reset when opened/closed
    useEffect(() => {
        if (!isOpen) {
            setName("");
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createCategory(formData);
            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else {
                onSuccess(result.message || "Category added successfully.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-semibold text-white">Add Category</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors p-1"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                placeholder="e.g. Feature Phones"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Slug Preview
                            </label>
                            <input
                                readOnly
                                value={slugPreview}
                                className="w-full bg-neutral-950/50 border border-transparent rounded-xl py-2 px-4 text-neutral-500 outline-none cursor-not-allowed"
                                placeholder="auto-generated-slug"
                            />
                            <p className="mt-2 text-xs text-neutral-500">
                                This is automatically generated from the category name.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-neutral-300 font-medium hover:bg-white/5 rounded-xl transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            <span>{loading ? "Saving..." : "Add Category"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
