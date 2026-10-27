export const dynamic = 'force-dynamic';
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Plus, Package, Edit, Trash2 } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import { PaginationLinks } from "@/components/ui/PaginationLinks";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const parsedPage = Number.parseInt(params.page || "1", 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const records = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            availability: true,
            createdAt: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE + 1,
    });
    const hasNext = records.length > PAGE_SIZE;
    const products = records.slice(0, PAGE_SIZE);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                    <p className="text-neutral-400">Manage your store catalogue and inventory.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Package className="w-12 h-12 text-neutral-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
                        <p className="text-neutral-400 mb-6">You haven't added any products to your catalogue yet.</p>
                        <Link
                            href="/admin/products/new"
                            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all"
                        >
                            Create your first product
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-white/5 border-b border-white/5 text-neutral-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Product Name</th>
                                    <th className="px-6 py-4 font-semibold">Brand / Category</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{product.name}</div>
                                            <div className="text-xs mt-1">{product.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{product.brand?.name || "No Brand"}</div>
                                            <div className="text-xs mt-1">{product.category?.name || "No Category"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs font-medium">
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.availability === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {product.availability}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <DeleteProductButton id={product.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <PaginationLinks page={page} hasNext={hasNext} basePath="/admin/products" />
        </div>
    );
}


