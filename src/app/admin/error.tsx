"use client";

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Development logs should contain technical details.
        console.error("Admin Route Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-red-500/20 rounded-xl min-h-[400px]">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-neutral-400 max-w-md text-center mb-8">
                Unable to load this section. An unexpected error occurred while processing your request. Please try again.
            </p>

            <button
                onClick={() => reset()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors font-medium"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        </div>
    );
}
