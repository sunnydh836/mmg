export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import ProductForm from "../../ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: { images: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!product) {
        notFound();
    }

    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Edit Product</h1>
                <p className="text-neutral-400">Update details for {product.name}.</p>
            </div>

            <ProductForm initialData={product} brands={brands} categories={categories} isEdit={true} />
        </div>
    );
}

