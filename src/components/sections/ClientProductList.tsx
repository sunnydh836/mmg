"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/sections/Products";
import { Product } from "@/types/product";

const SORT_OPTIONS = ["Featured", "Name A-Z", "Newest"] as const;

function ProductListContent({ products, brands, categories, whatsappNumber }: { products: Product[], brands: string[], categories: string[], whatsappNumber: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read initial values from URL
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
    const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
    const [selectedAvailability, setSelectedAvailability] = useState(searchParams.get("availability") || "");
    const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "Featured");
    const [isFeaturedOnly, setIsFeaturedOnly] = useState(searchParams.get("featured") === "true");

    // Sync URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (selectedBrand) params.set("brand", selectedBrand);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedType) params.set("type", selectedType);
        if (selectedAvailability) params.set("availability", selectedAvailability);
        if (selectedSort && selectedSort !== "Featured") params.set("sort", selectedSort);
        if (isFeaturedOnly) params.set("featured", "true");

        const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
        // prevent pushing the exact same URL to history repeatedly, only push if changed
        router.replace(newUrl, { scroll: false });
    }, [search, selectedBrand, selectedCategory, selectedType, selectedAvailability, selectedSort, isFeaturedOnly, router]);


    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search) {
            const query = search.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
        }
        if (selectedBrand) result = result.filter(p => p.brand === selectedBrand);
        if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
        if (selectedType) result = result.filter(p => p.type === selectedType);
        if (selectedAvailability) result = result.filter(p => p.availability === selectedAvailability);
        if (isFeaturedOnly) result = result.filter(p => p.featured);

        // Sorting
        result.sort((a, b) => {
            if (selectedSort === "Name A-Z") return a.name.localeCompare(b.name);
            if (selectedSort === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            // Featured sort (default fallback): Show featured first
            if (selectedSort === "Featured") {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
            }
            return 0;
        });

        return result;
    }, [search, selectedBrand, selectedCategory, selectedType, selectedAvailability, selectedSort, isFeaturedOnly]);

    const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchParams.get("search")));
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    return (
        <div className="flex flex-col gap-8 mt-12 w-full">
            {/* Top Horizontal Filters */}
            <div className={`w-full bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between transition-all duration-300 ${isFiltersOpen ? 'gap-6' : 'gap-0 xl:gap-6'}`}>

                {/* Expandable Search Area & Mobile Menu */}
                <div className="flex items-center justify-between w-full xl:w-auto">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSearchOpen(prev => !prev)}
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-black border border-white/10 text-gray-400 hover:text-white hover:border-accent transition-all duration-300"
                            title="Toggle Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </button>

                        <div className={`overflow-hidden transition-[max-width,opacity,margin] duration-[1500ms] ease-in-out flex items-center ${isSearchOpen ? 'max-w-[calc(100vw-140px)] sm:max-w-[400px] opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'}`}>
                            <div className="relative w-48 sm:w-64 md:w-80">
                                <input
                                    type="text"
                                    placeholder="Search devices..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsFiltersOpen(prev => !prev)}
                        className="xl:hidden flex-shrink-0 ml-4 w-10 h-10 flex items-center justify-center rounded-lg bg-black border border-white/10 text-gray-400 hover:text-white hover:border-accent transition-colors"
                    >
                        {isFiltersOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        )}
                    </button>
                </div>

                {/* Filter Selects Area */}
                <div className={`flex flex-col sm:flex-row flex-wrap items-center sm:justify-center xl:justify-end gap-3 md:gap-4 w-full xl:flex-1 transition-all duration-500 xl:max-h-none xl:opacity-100 xl:mt-0 xl:pointer-events-auto overflow-hidden ${isFiltersOpen ? 'max-h-[800px] opacity-100 mt-4 pointer-events-auto' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors w-full sm:w-auto min-w-[140px]"
                    >
                        <option value="">All Brands</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors w-full sm:w-auto min-w-[150px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors w-full sm:w-auto min-w-[130px]"
                    >
                        <option value="">All Types</option>
                        <option value="NEW">New</option>
                        <option value="USED">Used</option>
                        <option value="REFURBISHED">Refurbished</option>
                    </select>

                    <select
                        value={selectedAvailability}
                        onChange={(e) => setSelectedAvailability(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors w-full sm:w-auto min-w-[140px]"
                    >
                        <option value="">Any Availability</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Limited Stock">Limited Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>

                    <div className="flex items-center justify-center gap-2 px-2 py-1 w-full sm:w-auto">
                        <input
                            type="checkbox"
                            id="featured"
                            checked={isFeaturedOnly}
                            onChange={(e) => setIsFeaturedOnly(e.target.checked)}
                            className="w-4 h-4 rounded bg-black border-white/10 text-accent focus:ring-accent focus:ring-offset-gray-900"
                        />
                        <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer select-none">Featured Only</label>
                    </div>

                    {(search || selectedBrand || selectedCategory || selectedType || selectedAvailability || isFeaturedOnly) && (
                        <button
                            onClick={() => {
                                setSearch(""); setSelectedBrand(""); setSelectedCategory(""); setSelectedType("");
                                setSelectedAvailability(""); setSelectedSort("Featured"); setIsFeaturedOnly(false); setIsSearchOpen(false); setIsFiltersOpen(false);
                            }}
                            className="text-xs font-semibold uppercase tracking-wider text-accent border border-accent/30 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Product Grid Area - Now takes full width as sidebar is removed */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-gray-400 font-medium">
                        Showing <span className="text-white">{filteredProducts.length}</span> devices
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-bold hidden sm:block">Sort By</label>
                        <select
                            value={selectedSort}
                            onChange={(e) => setSelectedSort(e.target.value)}
                            className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                        >
                            {SORT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} isWhatsAppEnabled={true} />
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 border border-white/5 border-dashed rounded-2xl bg-white/[0.02]">
                        <p className="text-gray-400 text-lg mb-2">No products found</p>
                        <p className="text-gray-600 text-sm">Try adjusting your filters to see more results.</p>
                        <button
                            onClick={() => {
                                setSearch(""); setSelectedBrand(""); setSelectedCategory(""); setSelectedType("");
                                setSelectedAvailability(""); setSelectedSort("Featured"); setIsFeaturedOnly(false);
                            }}
                            className="mt-6 text-sm font-semibold tracking-wide text-white bg-accent/20 border border-accent hover:bg-accent px-6 py-2 rounded-xl transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function ClientProductList({ products, brands, categories, whatsappNumber }: { products: Product[], brands: string[], categories: string[], whatsappNumber: string }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center py-32"><div className="w-8 h-8 rounded-full border-b-2 border-accent animate-spin"></div></div>}>
            <ProductListContent products={products} brands={brands} categories={categories} whatsappNumber={whatsappNumber} />
        </Suspense>
    );
}
