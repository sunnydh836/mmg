export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create New Product</h1>
                <p className="text-neutral-400">Add a new device or accessory to your catalogue.</p>
            </div>

            <ProductForm brands={brands} categories={categories} />
        </div>
    );
}


