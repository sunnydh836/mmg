"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            startTransition(async () => {
                await deleteProduct(id);
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`p-2 bg-red-500/10 text-red-500 rounded-lg transition-colors hover:bg-red-500/20 ${isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
