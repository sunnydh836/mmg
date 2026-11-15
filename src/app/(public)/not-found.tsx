import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
    title: "404 - Page Not Found",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <Section className="min-h-[70vh] flex flex-col items-center justify-center text-center pt-28 pb-16">
            <div className="max-w-xl mx-auto space-y-6">
                <span className="text-8xl font-bold text-accent mb-2 block">404</span>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase">
                    Page Not Found
                </h1>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                    We could not find the page you were looking for. It might have been moved, renamed, or is temporarily unavailable.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/">
                        <Button variant="primary" className="px-8 font-semibold tracking-wide w-full sm:w-auto">
                            Return to Homepage
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="secondary" className="px-8 font-semibold tracking-wide w-full sm:w-auto bg-white/5 border border-white/10">
                            Browse Mobile Collection
                        </Button>
                    </Link>
                </div>
            </div>
        </Section>
    );
}
