"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { AddCategoryModal } from "./AddCategoryModal";
import { deleteCategory } from "../actions";

type Category = {
    id: string;
    name: string;
    slug: string;
    _count: {
        products: number;
    };
};

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;

        setIsDeleting(id);
        setError(null);
        setSuccessMsg(null);

        try {
            const result = await deleteCategory(id);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccessMsg(result.message || "Category removed successfully.");
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {(error || successMsg) && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>{error || successMsg}</div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Category</span>
                </button>
            </div>

            {initialCategories.length === 0 ? (
                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                    <p className="text-neutral-400 mb-6">No categories added yet.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-6 rounded-xl transition-all"
                    >
                        Add Category
                    </button>
                </div>
            ) : (
                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 uppercase text-xs tracking-wider text-neutral-500">
                                    <th className="px-6 py-4 font-medium">Category Name</th>
                                    <th className="px-6 py-4 font-medium">Slug</th>
                                    <th className="px-6 py-4 font-medium">Products</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {initialCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white">
                                            <span className="font-medium">{category.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            {category.slug}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-500/10 text-blue-400 py-1 px-2.5 rounded-full text-xs font-medium">
                                                    {category._count.products} used
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                disabled={isDeleting === category.id}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50 ml-auto"
                                                title="Remove Category"
                                            >
                                                {isDeleting === category.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(msg) => {
                    setIsAddModalOpen(false);
                    setSuccessMsg(msg);
                    setError(null);
                }}
            />
        </div>
    );
}
