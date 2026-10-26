"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";

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

        // Safely delete physical uploaded files only
        for (const img of existingProduct.images) {
            if (img.imageUrl.startsWith('/uploads/products/')) {
                await storage.deleteFile(img.imageUrl);
            }
        }

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product", error);
        return { error: error instanceof Error ? error.message : "Failed to delete product" };
    }
}

export async function createProduct(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const isDemo = formData.get("isDemo") === "true";

        const newImages = formData.getAll("newImages") as File[];
        const imageCount = parseInt(formData.get("imageCount") as string || "0");
        const imageInfos: { type: string; id?: string }[] = [];
        for (let i = 0; i < imageCount; i++) {
            imageInfos.push(JSON.parse(formData.get(`imageInfo_${i}`) as string));
        }

        let productImagesData: { imageUrl: string; sortOrder: number }[] = [];
        if (newImages.length > 0) {
            let fileIndex = 0;
            for (let i = 0; i < imageInfos.length; i++) {
                const info = imageInfos[i];
                if (info.type === 'new') {
                    const file = newImages[fileIndex++];
                    const { url, error } = await storage.uploadFile(file);
                    if (!error && url) {
                        productImagesData.push({
                            imageUrl: url,
                            sortOrder: i,
                        });
                    }
                }
            }
        } else if (isDemo) {
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
        const name = formData.get("name") as string;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
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

        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { images: true }
        });

        const newImages = formData.getAll("newImages") as File[];
        const imageCount = parseInt(formData.get("imageCount") as string || "0");
        const imageInfos: { type: string; id?: string }[] = [];
        for (let i = 0; i < imageCount; i++) {
            imageInfos.push(JSON.parse(formData.get(`imageInfo_${i}`) as string));
        }

        const existingImagesToKeep = new Set<string>();
        let fileIndex = 0;

        for (let i = 0; i < imageInfos.length; i++) {
            const info = imageInfos[i];
            if (info.type === 'new') {
                const file = newImages[fileIndex++];
                const { url, error } = await storage.uploadFile(file);
                if (!error && url) {
                    await prisma.productImage.create({
                        data: {
                            productId: id,
                            imageUrl: url,
                            sortOrder: i
                        }
                    });
                }
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

        if (existingImagesToKeep.size === 0 && newImages.length === 0 && isDemo) {
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
