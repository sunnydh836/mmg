"use client";

import { useState, useTransition } from "react";
import { FAQ } from "@prisma/client";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, GripVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addFaq, updateFaq, deleteFaq, updateFaqStatus, updateFaqOrder, seedFaqs } from "./actions";

export function FaqClient({ initialFaqs }: { initialFaqs: FAQ[] }) {
    const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
    const [isPending, startTransition] = useTransition();

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selection
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        sortOrder: 0,
        isActive: true,
    });

    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const resetForm = () => {
        setFormData({ question: "", answer: "", sortOrder: 0, isActive: true });
        setEditingFaq(null);
        setError(null);
    };

    const openAdd = () => {
        resetForm();
        setFormData(prev => ({ ...prev, sortOrder: faqs.length + 1 }));
        setIsFormOpen(true);
    };

    const openEdit = (faq: FAQ) => {
        resetForm();
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            sortOrder: faq.sortOrder,
            isActive: faq.isActive,
        });
        setIsFormOpen(true);
    };

    const openDelete = (faq: FAQ) => {
        setDeletingFaq(faq);
        setIsDeleteOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question.trim() || !formData.answer.trim()) {
            setError("Question and Answer are required");
            return;
        }

        startTransition(async () => {
            try {
                setError(null);
                let result;
                if (editingFaq) {
                    result = await updateFaq(editingFaq.id, formData);
                } else {
                    result = await addFaq(formData);
                }

                if (!result.success) {
                    setError(result.error || "Failed to save FAQ");
                    return;
                }

                showToast(`FAQ ${editingFaq ? 'updated' : 'added'} successfully.`);
                window.location.reload();
            } catch (err: any) {
                setError("Failed to save FAQ");
            }
        });
    };

    const confirmDelete = async () => {
        if (!deletingFaq) return;
        startTransition(async () => {
            try {
                await deleteFaq(deletingFaq.id);
                showToast("FAQ deleted successfully.");
                window.location.reload();
            } catch (err: any) {
                showToast("Unable to delete FAQ. Please try again.", "error");
            }
        });
    };

    const toggleStatus = async (faq: FAQ) => {
        startTransition(async () => {
            try {
                await updateFaqStatus(faq.id, !faq.isActive);
                showToast("Status updated successfully.");
                window.location.reload();
            } catch (err: any) {
                showToast("Unable to update status.", "error");
            }
        });
    };

    const handleSeed = async () => {
        startTransition(async () => {
            try {
                const result = await seedFaqs();
                showToast(result.message, "success");
                window.location.reload();
            } catch (err: any) {
                showToast("Unable to seed FAQs.", "error");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">All FAQs</h2>
                <Button onClick={openAdd} disabled={isPending} className="flex items-center gap-2">
                    <Plus size={18} />
                    Add FAQ
                </Button>
            </div>

            {/* List */}
            {faqs.length === 0 ? (
                <div className="bg-secondary/50 border border-border p-8 rounded-xl text-center">
                    <p className="text-gray-400 mb-4">No FAQs yet. Add your first FAQ to display frequently asked questions on the website.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={openAdd} disabled={isPending}>
                            <Plus size={18} className="mr-2" />
                            Add FAQ
                        </Button>
                        <Button onClick={handleSeed} disabled={isPending} variant="outline">
                            Seed Initial FAQs
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-secondary border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-secondary-focus text-xs uppercase text-gray-400 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3 w-1/3">Question</th>
                                    <th className="px-4 py-3 w-1/3">Answer Preview</th>
                                    <th className="px-4 py-3 text-center">Active</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {faqs.map((faq) => (
                                    <tr key={faq.id} className="hover:bg-secondary-focus transition-colors">
                                        <td className="px-4 py-3 font-semibold">{faq.sortOrder}</td>
                                        <td className="px-4 py-3 font-medium text-white">{faq.question}</td>
                                        <td className="px-4 py-3 truncate max-w-[200px] text-gray-400">{faq.answer}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleStatus(faq)}
                                                disabled={isPending}
                                                className={`inline-flex items-center justify-center p-1 rounded-full transition-colors ${faq.isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-500/10'
                                                    }`}
                                                title={faq.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {faq.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(faq)}
                                                    disabled={isPending}
                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDelete(faq)}
                                                    disabled={isPending}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-secondary border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-xl font-bold text-white">{editingFaq ? "Edit FAQ" : "Add FAQ"}</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Question *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                                    placeholder="e.g. Do you buy old mobile phones?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Answer *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent resize-none"
                                    placeholder="e.g. Yes, we purchase eligible old mobile phones..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.sortOrder}
                                        onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer p-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent bg-background"
                                        />
                                        <span className="text-sm font-medium text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Saving..." : "Save FAQ"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-secondary border border-border rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete this FAQ?</h3>
                            <p className="text-gray-400 text-sm">
                                This action cannot be undone. This FAQ will be permanently removed.
                            </p>
                        </div>
                        <div className="p-4 bg-secondary-focus border-t border-border flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={confirmDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white border-0">
                                {isPending ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
