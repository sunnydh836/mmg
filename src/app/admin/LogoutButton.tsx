"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
        </button>
    );
}
