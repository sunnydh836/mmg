export default function LoadingAdminProducts() {
    return (
        <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 p-8" aria-label="Loading products">
            <div className="h-12 w-72 rounded bg-white/10" />
            <div className="h-16 rounded-2xl bg-white/5" />
            <div className="h-96 rounded-2xl bg-white/5" />
        </div>
    );
}
