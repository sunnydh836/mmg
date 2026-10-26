import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { BrandsManager } from "./components/BrandsManager";

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
    // Fetch all brands with their associated products count
    const brands = await prisma.brand.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: {
            name: "asc"
        }
    });

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Brands</h1>
                <p className="text-neutral-400 text-sm">
                    Manage the brands available for your products. Deleting a brand is only possible if it has no associated products.
                </p>
            </div>

            <Suspense fallback={<div className="text-neutral-400">Loading brands...</div>}>
                <BrandsManager initialBrands={brands} />
            </Suspense>
        </div>
    );
}
