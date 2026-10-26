export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { Package, Smartphone, Star, Image as ImageIcon, HelpCircle, CheckCircle } from "lucide-react";

export default async function AdminDashboard() {
    // Fetch overview statistics
    const [
        totalProducts,
        availableProducts,
        preOwnedProducts,
        featuredProducts,
        totalGallery,
        totalFaqs,
    ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { availability: "In Stock" } }), // or standard availability logic
        prisma.product.count({ where: { type: { in: ["USED", "REFURBISHED"] } } }),
        prisma.product.count({ where: { featured: true } }),
        prisma.galleryImage.count(),
        prisma.fAQ.count(),
    ]);

    const stats = [
        { label: "Total Products", value: totalProducts, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Available Products", value: availableProducts, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Pre-owned Devices", value: preOwnedProducts, icon: Smartphone, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Featured Products", value: featuredProducts, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Gallery Images", value: totalGallery, icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "FAQs", value: totalFaqs, icon: HelpCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-neutral-400">Welcome to the store admin portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <a href="/admin/products/new" className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-300 hover:text-white transition-colors border border-dashed border-white/10 hover:border-white/20">
                        <Package className="w-5 h-5" />
                        <span className="font-medium text-sm">Add Product</span>
                    </a>
                    <a href="/admin/gallery" className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-300 hover:text-white transition-colors border border-dashed border-white/10 hover:border-white/20">
                        <ImageIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">Add Photos</span>
                    </a>
                    <a href="/admin/settings" className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-300 hover:text-white transition-colors border border-dashed border-white/10 hover:border-white/20">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Update Rules</span>
                    </a>
                    <a href="/" target="_blank" className="flex items-center justify-center gap-2 p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-colors border border-transparent border-dashed">
                        <Star className="w-5 h-5" />
                        <span className="font-medium text-sm">View Website</span>
                    </a>
                </div>
            </div>
        </div>
    );
}


