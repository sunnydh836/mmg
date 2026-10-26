import Link from 'next/link';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <Section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
                <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Page Not Found</h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                    We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
                </p>
                <div className="pt-8">
                    <Link href="/">
                        <Button variant="primary" className="px-8 font-semibold tracking-wide">
                            Return to Homepage
                        </Button>
                    </Link>
                </div>
            </div>
        </Section>
    );
}
