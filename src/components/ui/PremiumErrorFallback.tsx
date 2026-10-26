"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface PremiumErrorFallbackProps {
    onRetry?: () => void;
    message?: string;
    className?: string;
}

export function PremiumErrorFallback({
    onRetry,
    message = "Something went wrong with this section.",
    className = ""
}: PremiumErrorFallbackProps) {
    return (
        <div className={`w-full min-h-[300px] flex items-center justify-center p-6 bg-neutral-950 border border-white/5 rounded-2xl ${className}`}>
            <div className="flex flex-col items-center text-center space-y-4 max-w-md">
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-neutral-400 text-sm">{message}</p>
                <p className="text-neutral-500 text-xs mb-4">Please try again.</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1F] hover:bg-[#2A2A35] border border-white/10 text-cyan-400 font-medium text-sm rounded-lg transition-colors group"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Retry</span>
                    </button>
                )}
            </div>
        </div>
    );
}
