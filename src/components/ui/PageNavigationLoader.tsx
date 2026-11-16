'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loader from './Loader';

export default function PageNavigationLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const navStartTimeRef = useRef<number>(0);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    // When route or search parameters change, hide loader after ensuring a smooth minimum display
    useEffect(() => {
        if (!navStartTimeRef.current) {
            setIsNavigating(false);
            return;
        }

        const elapsed = Date.now() - navStartTimeRef.current;
        const remaining = Math.max(0, 350 - elapsed);

        const timer = setTimeout(() => {
            setIsNavigating(false);
            navStartTimeRef.current = 0;
        }, remaining);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target) return;

            const anchor = target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Ignore non-navigation schemes & modifier keys
            if (
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('#') ||
                href.startsWith('javascript:') ||
                anchor.target === '_blank' ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            try {
                const targetUrl = new URL(anchor.href, window.location.href);
                const currentUrl = new URL(window.location.href);

                // Ignore external domains
                if (targetUrl.origin !== currentUrl.origin) {
                    return;
                }

                // Ignore if it's the exact same page & search
                if (
                    targetUrl.pathname === currentUrl.pathname &&
                    targetUrl.search === currentUrl.search
                ) {
                    return;
                }

                // Trigger navigation loader immediately
                navStartTimeRef.current = Date.now();
                setIsNavigating(true);

                // Safety timeout: auto-hide after 8 seconds if navigation aborts
                if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = setTimeout(() => {
                    setIsNavigating(false);
                    navStartTimeRef.current = 0;
                }, 8000);
            } catch {
                // Ignore malformed URLs
            }
        };

        const handlePopState = () => {
            navStartTimeRef.current = Date.now();
            setIsNavigating(true);
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = setTimeout(() => {
                setIsNavigating(false);
                navStartTimeRef.current = 0;
            }, 8000);
        };

        document.addEventListener('click', handleAnchorClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleAnchorClick, true);
            window.removeEventListener('popstate', handlePopState);
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        };
    }, []);

    if (!isNavigating) {
        return null;
    }

    return (
        <aside
            aria-live="assertive"
            aria-busy="true"
            aria-label="Loading page navigation"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#09090b]/85 backdrop-blur-md transition-opacity duration-200"
        >
            <Loader />
        </aside>
    );
}
