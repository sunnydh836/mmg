"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            startTransition(async () => {
                setError("");
                const result = await deleteProduct(id);
                if (result.error) {
                    setError(result.error);
                    return;
                }
                if (result.imageCleanupWarning) window.alert(result.imageCleanupWarning);
                router.refresh();
            });
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={handleDelete}
                disabled={isPending}
                aria-label={isPending ? "Deleting product" : "Delete product"}
                title={isPending ? "Deleting…" : "Delete product"}
                className={`p-2 bg-red-500/10 text-red-500 rounded-lg transition-colors hover:bg-red-500/20 ${isPending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                <Trash2 className="w-4 h-4" />
            </button>
            {error && <span role="alert" className="max-w-48 text-xs text-red-400">{error}</span>}
        </div>
    );
}
