"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";
import { getSession } from "@/lib/auth";

function productSlugBase(name: string) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "product";
}

async function getAvailableProductSlug(name: string, currentProductId?: string) {
    const base = productSlugBase(name);
    let candidate = base;
    let suffix = 2;

    while (await prisma.product.findFirst({
        where: {
            slug: candidate,
            ...(currentProductId ? { id: { not: currentProductId } } : {}),
        },
        select: { id: true },
    })) {
        candidate = `${base}-${suffix++}`;
    }

    return candidate;
}

function isSlugConflict(error: unknown) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== "P2002") return false;
    if (!("meta" in error) || !error.meta || typeof error.meta !== "object" || !("target" in error.meta)) return false;

    const target = error.meta.target;
    return Array.isArray(target) ? target.includes("slug") : typeof target === "string" && target.includes("slug");
}

function isAllowedProductImageUrl(value: string) {
    if (value.startsWith("/uploads/products/")) return true;
    try {
        const url = new URL(value);
        const endpointValue = process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/+$/, "");
        if (!endpointValue) return false;
        const endpoint = new URL(endpointValue);
        return url.protocol === "https:" && url.origin === endpoint.origin && url.pathname.startsWith(`${endpoint.pathname}/`);
    } catch {
        return false;
    }
}

export async function deleteProduct(id: string) {
    try {
        // Fetch existing product to safely capture image URLs before deletion
        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!existingProduct) {
            throw new Error("Product not found");
        }

        // Delete database record first. This guarantees cascade triggers
        // remove the DB relations without leaving DB in inconsistent state.
        await prisma.product.delete({
            where: { id },
        });

        // Keep the database deletion successful even if external image cleanup fails.
        const cleanupResults = await Promise.all(existingProduct.images.map((img) => storage.deleteFile(img.imageUrl)));
        const imageCleanupWarning = cleanupResults.some((result) => !result.success)
            ? "The product was deleted, but one or more image files could not be removed from ImageKit."
            : undefined;

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { success: true, imageCleanupWarning };
    } catch (error) {
        console.error("Failed to delete product", error);
        return { error: error instanceof Error ? error.message : "Failed to delete product" };
    }
}

export async function uploadProductImage(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.userId) return { error: "Unauthorized" };

        const file = formData.get("image");
        if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload" };
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            return { error: "Only JPG, PNG, and WEBP images are allowed" };
        }
        if (file.size > 2 * 1024 * 1024) return { error: "Image must be 2 MB or smaller after processing" };

        return await storage.uploadFile(file);
    } catch (error) {
        console.error("Failed to upload product image", error);
        return { error: error instanceof Error ? error.message : "Product image upload failed" };
    }
}

export async function createProduct(formData: FormData) {
    try {
        const name = String(formData.get("name") || "").trim();
        if (!name) throw new Error("Product name is required");
        const isDemo = formData.get("isDemo") === "true";

        const imageCount = parseInt(formData.get("imageCount") as string || "0");
        const imageInfos: { type: string; id?: string; url?: string }[] = [];
        for (let i = 0; i < imageCount; i++) {
            imageInfos.push(JSON.parse(formData.get(`imageInfo_${i}`) as string));
        }

        let productImagesData: { imageUrl: string; sortOrder: number }[] = [];
        for (let i = 0; i < imageInfos.length; i++) {
            const info = imageInfos[i];
            if (info.type === 'new') {
                if (!info.url || !isAllowedProductImageUrl(info.url)) throw new Error("Upload a valid product image");
                productImagesData.push({ imageUrl: info.url, sortOrder: i });
            }
        }
        if (productImagesData.length === 0 && isDemo) {
            productImagesData.push({
                imageUrl: `https://via.placeholder.com/800x800?text=${encodeURIComponent(name || 'Demo Product')}`,
                sortOrder: 0
            });
        }

        const priceType = formData.get("priceType") as string;
        let price: number | null = null;
        let mrp: number | null = null;

        if (priceType === "public") {
            price = parseFloat(formData.get("price") as string);
            mrp = parseFloat(formData.get("mrp") as string);

            if (isNaN(price)) price = null;
            if (isNaN(mrp)) mrp = null;

            if (price !== null && price < 0) throw new Error("Selling price cannot be negative");
            if (mrp !== null && mrp < 0) throw new Error("MRP cannot be negative");
            if (price !== null && mrp !== null && price > mrp) {
                throw new Error("Selling price cannot exceed MRP");
            }
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            const slug = await getAvailableProductSlug(name);
            try {
                await prisma.product.create({
                    data: {
                        name,
                        slug,
                        brandId: formData.get("brandId") as string,
                        categoryId: formData.get("categoryId") as string,
                        type: formData.get("type") as string || "NEW",
                        price,
                        mrp,
                        shortDescription: formData.get("shortDescription") as string,
                        description: formData.get("description") as string,
                        availability: formData.get("availability") as string || "In Stock",
                        featured: formData.get("featured") === "true",
                        isDemo: isDemo,
                        images: {
                            create: productImagesData
                        }
                    }
                });
                break;
            } catch (error) {
                if (!isSlugConflict(error) || attempt === 4) throw error;
            }
        }

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Failed to create product", error);
        return { error: error instanceof Error ? error.message : "Failed to create product" };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        const name = String(formData.get("name") || "").trim();
        if (!name) throw new Error("Product name is required");
        const isDemo = formData.get("isDemo") === "true";

        const priceType = formData.get("priceType") as string;
        let price: number | null = null;
        let mrp: number | null = null;

        if (priceType === "public") {
            price = parseFloat(formData.get("price") as string);
            mrp = parseFloat(formData.get("mrp") as string);

            if (isNaN(price)) price = null;
            if (isNaN(mrp)) mrp = null;

            if (price !== null && price < 0) throw new Error("Selling price cannot be negative");
            if (mrp !== null && mrp < 0) throw new Error("MRP cannot be negative");
            if (price !== null && mrp !== null && price > mrp) {
                throw new Error("Selling price cannot exceed MRP");
            }
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            const slug = await getAvailableProductSlug(name, id);
            try {
                await prisma.product.update({
                    where: { id },
                    data: {
                        name,
                        slug,
                        brandId: formData.get("brandId") as string,
                        categoryId: formData.get("categoryId") as string,
                        type: formData.get("type") as string || "NEW",
                        price,
                        mrp,
                        shortDescription: formData.get("shortDescription") as string,
                        description: formData.get("description") as string,
                        availability: formData.get("availability") as string || "In Stock",
                        featured: formData.get("featured") === "true",
                        isDemo: isDemo,
                    }
                });
                break;
            } catch (error) {
                if (!isSlugConflict(error) || attempt === 4) throw error;
            }
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { images: true }
        });

        const imageCount = parseInt(formData.get("imageCount") as string || "0");
        const imageInfos: { type: string; id?: string; url?: string }[] = [];
        for (let i = 0; i < imageCount; i++) {
            imageInfos.push(JSON.parse(formData.get(`imageInfo_${i}`) as string));
        }

        const existingImagesToKeep = new Set<string>();

        for (let i = 0; i < imageInfos.length; i++) {
            const info = imageInfos[i];
            if (info.type === 'new') {
                if (!info.url || !isAllowedProductImageUrl(info.url)) throw new Error("Upload a valid product image");
                await prisma.productImage.create({
                    data: { productId: id, imageUrl: info.url, sortOrder: i }
                });
            } else if (info.type === 'existing' && info.id) {
                existingImagesToKeep.add(info.id);
                // Update sortOrder if changed
                await prisma.productImage.update({
                    where: { id: info.id },
                    data: { sortOrder: i }
                });
            }
        }

        // Delete removed images
        for (const img of existingProduct?.images || []) {
            if (!existingImagesToKeep.has(img.id)) {
                await storage.deleteFile(img.imageUrl);
                await prisma.productImage.delete({ where: { id: img.id } });
            }
        }

        if (existingImagesToKeep.size === 0 && !imageInfos.some((image) => image.type === 'new') && isDemo) {
            await prisma.productImage.create({
                data: {
                    productId: id,
                    imageUrl: `https://via.placeholder.com/800x800?text=${encodeURIComponent(name || 'Demo Product')}`,
                    sortOrder: 0
                }
            });
        }

        revalidatePath("/admin/products");
        revalidatePath(`/admin/products/${id}/edit`);
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Failed to update product", error);
        return { error: error instanceof Error ? error.message : "Failed to update product" };
    }
}
