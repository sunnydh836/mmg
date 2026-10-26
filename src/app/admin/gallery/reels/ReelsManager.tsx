"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Camera, Image as ImageIcon } from "lucide-react";
import { ReelForm } from "@/components/admin/ReelForm";
import { deleteReel, toggleReelStatus } from "./actions";

interface Reel {
    id: string;
    title: string | null;
    reelUrl: string;
    thumbnailUrl: string | null;
    thumbnailSource: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
}

export default function ReelsManager({ reels }: { reels: Reel[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReel, setEditingReel] = useState<Reel | null>(null);

    const handleAdd = () => {
        setEditingReel(null);
        setIsFormOpen(true);
    };

    const handleEdit = (reel: Reel) => {
        setEditingReel(reel);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this Instagram Reel?")) {
            await deleteReel(id);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        await toggleReelStatus(id, !currentStatus);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Instagram Reels</h1>
                    <p className="text-neutral-400">Manage the Instagram Reels displayed on the homepage gallery.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Reel</span>
                </button>
            </div>

            {isFormOpen ? (
                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {editingReel ? "Edit Instagram Reel" : "Add Instagram Reel"}
                    </h2>
                    <ReelForm
                        initialData={editingReel ? {
                            ...editingReel
                        } : undefined}
                        onClose={() => setIsFormOpen(false)}
                    />
                </div>
            ) : null}

            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
                {reels.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Camera className="w-12 h-12 text-neutral-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No Reels found</h3>
                        <p className="text-neutral-400 mb-6">You haven't added any Instagram Reels to display.</p>
                        <button
                            onClick={handleAdd}
                            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all"
                        >
                            Add your first Reel
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-white/5 border-b border-white/5 text-neutral-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Thumbnail</th>
                                    <th className="px-6 py-4 font-semibold">Details</th>
                                    <th className="px-6 py-4 font-semibold">Status / Order</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reels.map((reel) => (
                                    <tr key={reel.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            {reel.thumbnailUrl ? (
                                                <div className="relative w-16 h-16 rounded overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={reel.thumbnailUrl}
                                                        alt={reel.title || "Instagram Reel"}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    {reel.thumbnailSource === 'CUSTOM' && (
                                                        <div className="absolute top-0 right-0 bg-black/60 p-0.5 rounded-bl">
                                                            <ImageIcon className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-neutral-800 rounded flex items-center justify-center">
                                                    <Camera className="w-6 h-6 text-neutral-600" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white mb-1">
                                                {reel.title || "Untitled Reel"}
                                            </div>
                                            <a
                                                href={reel.reelUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-400 hover:underline max-w-[200px] truncate block"
                                            >
                                                {reel.reelUrl}
                                            </a>
                                            <div className="text-xs mt-1 text-neutral-500">
                                                Source: {reel.thumbnailSource}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <button
                                                    onClick={() => handleToggleStatus(reel.id, reel.isActive)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${reel.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                        }`}
                                                >
                                                    {reel.isActive ? "Active" : "Inactive"}
                                                </button>
                                                <span className="text-xs text-neutral-500">
                                                    Order: {reel.displayOrder}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(reel)}
                                                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reel.id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
