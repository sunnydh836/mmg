"use client";

import { useState, useTransition } from "react";
import { Service } from "@prisma/client";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addService, updateService, deleteService, updateServiceStatus, updateServiceOrder } from "./actions";

export function ServiceClient({ initialServices }: { initialServices: Service[] }) {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [isPending, startTransition] = useTransition();

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selection
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        features: [] as string[],
        icon: "",
        sortOrder: 0,
        isActive: true,
    });

    // UI state for features textarea
    const [featuresText, setFeaturesText] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", features: [], icon: "", sortOrder: 0, isActive: true });
        setFeaturesText("");
        setEditingService(null);
        setError(null);
    };

    const openAdd = () => {
        resetForm();
        setFormData(prev => ({ ...prev, sortOrder: services.length + 1 }));
        setIsFormOpen(true);
    };

    const openEdit = (service: Service) => {
        resetForm();
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description,
            features: (service as any).features || [],
            icon: service.icon || "",
            sortOrder: service.sortOrder,
            isActive: service.isActive,
        });
        setFeaturesText(((service as any).features || []).join("\n"));
        setIsFormOpen(true);
    };

    const openDelete = (service: Service) => {
        setDeletingService(service);
        setIsDeleteOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            setError("Service name and description are required");
            return;
        }

        startTransition(async () => {
            try {
                setError(null);
                let result;
                if (editingService) {
                    result = await updateService(editingService.id, formData);
                } else {
                    result = await addService(formData);
                }

                if (!result.success) {
                    setError(result.error || "Failed to save service");
                    return;
                }

                showToast(`Service ${editingService ? 'updated' : 'added'} successfully.`);
                window.location.reload();
            } catch (err: any) {
                setError("Failed to save service");
            }
        });
    };

    const confirmDelete = async () => {
        if (!deletingService) return;
        startTransition(async () => {
            try {
                await deleteService(deletingService.id);
                showToast("Service deleted successfully.");
                window.location.reload();
            } catch (err: any) {
                showToast("Unable to delete service. Please try again.", "error");
            }
        });
    };

    const toggleStatus = async (service: Service) => {
        startTransition(async () => {
            try {
                await updateServiceStatus(service.id, !service.isActive);
                showToast("Status updated successfully.");
                window.location.reload();
            } catch (err: any) {
                showToast("Unable to update status.", "error");
            }
        });
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === services.length - 1) return;

        const current = services[index];
        const target = direction === 'up' ? services[index - 1] : services[index + 1];

        // Ensure we assign distinct values if they are currently the same
        let currentSort = target.sortOrder;
        let targetSort = current.sortOrder;

        if (currentSort === targetSort) {
            currentSort = direction === 'up' ? Math.max(0, currentSort - 1) : currentSort + 1;
        }

        startTransition(async () => {
            try {
                await updateServiceOrder([
                    { id: current.id, sortOrder: currentSort },
                    { id: target.id, sortOrder: targetSort }
                ]);
                showToast("Order updated successfully.");
                window.location.reload();
            } catch (err: any) {
                showToast("Unable to update order.", "error");
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
                <h2 className="text-xl font-bold text-white">All Services</h2>
                <Button onClick={openAdd} disabled={isPending} className="flex items-center gap-2">
                    <Plus size={18} />
                    Add Service
                </Button>
            </div>

            {/* List */}
            {services.length === 0 ? (
                <div className="bg-secondary/50 border border-border p-8 rounded-xl text-center">
                    <p className="text-gray-400 mb-4">No services added yet.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={openAdd} disabled={isPending}>
                            <Plus size={18} className="mr-2" />
                            Add Service
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
                                    <th className="px-4 py-3 w-1/4">Name</th>
                                    <th className="px-4 py-3 w-1/3">Description</th>
                                    <th className="px-4 py-3 text-center">Active</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-secondary-focus transition-colors">
                                        <td className="px-4 py-3 font-semibold">{service.sortOrder}</td>
                                        <td className="px-4 py-3 font-medium text-white">{service.title}</td>
                                        <td className="px-4 py-3 text-gray-400">
                                            <div className="truncate max-w-[200px]">{service.description}</div>
                                            {(service as any).features && (service as any).features.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">{(service as any).features.length} features</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleStatus(service)}
                                                disabled={isPending}
                                                className={`inline-flex items-center justify-center p-1 rounded-full transition-colors ${service.isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-500/10'
                                                    }`}
                                                title={service.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {service.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="flex flex-col mr-2">
                                                    <button
                                                        onClick={() => moveOrder(services.indexOf(service), 'up')}
                                                        disabled={isPending || services.indexOf(service) === 0}
                                                        className={`p-1 rounded transition-colors ${services.indexOf(service) === 0 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveOrder(services.indexOf(service), 'down')}
                                                        disabled={isPending || services.indexOf(service) === services.length - 1}
                                                        className={`p-1 rounded transition-colors ${services.indexOf(service) === services.length - 1 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => openEdit(service)}
                                                    disabled={isPending}
                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDelete(service)}
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
                            <h3 className="text-xl font-bold text-white">{editingService ? "Edit Service" : "Add Service"}</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Service Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                                    placeholder="e.g. Mobile Repairing"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent resize-none"
                                    placeholder="Brief summary..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Service Points / Features</label>
                                <textarea
                                    rows={4}
                                    value={featuresText}
                                    onChange={e => {
                                        setFeaturesText(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            features: e.target.value.split('\n').map(f => f.trim()).filter(Boolean)
                                        }));
                                    }}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent resize-none"
                                    placeholder="One feature per line"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Icon (optional)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                                    placeholder="e.g. Smartphone (Lucide name)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter a Lucide React icon name (e.g. Smartphone, Settings, Tool) or leave blank for default.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.sortOrder}
                                        onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
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
                                    {isPending ? "Saving..." : "Save Service"}
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
                            <h3 className="text-xl font-bold text-white mb-2">Delete this service?</h3>
                            <p className="text-gray-400 text-sm">
                                This action cannot be undone. This service will be permanently removed.
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
