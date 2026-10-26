"use client";

import { useEffect } from 'react';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <Section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-500 text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Something went wrong</h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                    We encountered an unexpected error while trying to process your request.
                </p>
                <div className="pt-8 w-full flex justify-center">
                    <Button variant="primary" onClick={() => reset()} className="px-8 font-semibold tracking-wide">
                        Try Again
                    </Button>
                </div>
            </div>
        </Section>
    );
}
