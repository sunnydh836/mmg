import React from 'react';
import Loader from '@/components/ui/Loader';

export default function RootLoading() {
    return (
        <aside
            aria-live="assertive"
            aria-busy="true"
            aria-label="Loading page"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#09090b]/85 backdrop-blur-md"
        >
            <Loader />
        </aside>
    );
}
