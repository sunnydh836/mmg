import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { CategoriesManager } from "./components/CategoriesManager";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    // Fetch all categories with their associated products count
    const categories = await prisma.category.findMany({
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
                <h1 className="text-2xl font-bold text-white mb-2">Categories</h1>
                <p className="text-neutral-400 text-sm">
                    Manage the categories available for your products. Deleting a category is only possible if it has no associated products.
                </p>
            </div>

            <Suspense fallback={<div className="text-neutral-400">Loading categories...</div>}>
                <CategoriesManager initialCategories={categories} />
            </Suspense>
        </div>
    );
}
