export default function LoadingProducts() {
    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6" aria-label="Loading products">
            <div className="mb-10 animate-pulse space-y-3 text-center">
                <div className="mx-auto h-8 w-56 rounded bg-white/10" />
                <div className="mx-auto h-4 w-80 max-w-full rounded bg-white/5" />
            </div>
            <div className="mb-8 h-20 animate-pulse rounded-2xl bg-white/5" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
                {Array.from({ length: 10 }, (_, index) => (
                    <div key={index} className="aspect-[4/7] animate-pulse rounded-2xl bg-white/5" />
                ))}
            </div>
        </main>
    );
}
