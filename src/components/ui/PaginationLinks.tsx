import Link from "next/link";

export function PaginationLinks({
    page,
    hasNext,
    basePath,
}: {
    page: number;
    hasNext: boolean;
    basePath: string;
}) {
    if (page <= 1 && !hasNext) return null;

    const hrefForPage = (targetPage: number) =>
        targetPage <= 1 ? basePath : `${basePath}?page=${targetPage}`;

    return (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-4 py-6">
            {page > 1 ? (
                <Link href={hrefForPage(page - 1)} scroll={false} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10">
                    Previous
                </Link>
            ) : (
                <span className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-600">Previous</span>
            )}
            <span className="text-sm text-neutral-400">Page {page}</span>
            {hasNext ? (
                <Link href={hrefForPage(page + 1)} scroll={false} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10">
                    Next
                </Link>
            ) : (
                <span className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-600">Next</span>
            )}
        </nav>
    );
}
