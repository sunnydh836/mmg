"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBrand(formData: FormData) {
    try {
        const name = formData.get("name")?.toString();
        if (!name || name.trim() === "") {
            return { error: "Brand name is required." };
        }

        const trimmedName = name.trim();
        const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        // Prevent duplicates case-insensitively
        const existingBrand = await prisma.brand.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: "insensitive"
                }
            }
        });

        if (existingBrand) {
            return { error: "Brand already exists." };
        }

        await prisma.brand.create({
            data: {
                name: trimmedName,
                slug,
            }
        });

        revalidatePath("/");
        revalidatePath("/admin/brands");
        revalidatePath("/admin/products/new");

        return { success: true, message: "Brand added successfully." };
    } catch (error: any) {
        console.error("Error creating brand:", error);
        if (error.code === 'P2002') {
            return { error: "Brand already exists." };
        }
        return { error: "Something went wrong. Please try again." };
    }
}

export async function deleteBrand(id: string) {
    try {
        // Check for products using this brand
        const productCount = await prisma.product.count({
            where: { brandId: id }
        });

        if (productCount > 0) {
            return { error: "This brand is currently used by one or more products. Please update those products before removing the brand." };
        }

        await prisma.brand.delete({
            where: { id }
        });

        revalidatePath("/");
        revalidatePath("/admin/brands");
        revalidatePath("/admin/products/new");

        return { success: true, message: "Brand removed successfully." };
    } catch (error) {
        console.error("Error deleting brand:", error);
        return { error: "Something went wrong. Please try again." };
    }
}
