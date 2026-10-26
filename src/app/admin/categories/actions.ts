"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
    try {
        const name = formData.get("name")?.toString();
        if (!name || name.trim() === "") {
            return { error: "Category name is required." };
        }

        const trimmedName = name.trim();
        const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        // Prevent duplicates case-insensitively
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: "insensitive"
                }
            }
        });

        if (existingCategory) {
            return { error: "Category already exists." };
        }

        await prisma.category.create({
            data: {
                name: trimmedName,
                slug,
            }
        });

        revalidatePath("/");
        revalidatePath("/admin/categories");
        revalidatePath("/admin/products/new");
        revalidatePath("/(public)/products");

        return { success: true, message: "Category added successfully." };
    } catch (error: any) {
        console.error("Error creating category:", error);
        if (error.code === 'P2002') {
            return { error: "Category already exists." };
        }
        return { error: "Something went wrong. Please try again." };
    }
}

export async function deleteCategory(id: string) {
    try {
        // Check for products using this category
        const productCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productCount > 0) {
            return { error: "This category is currently used by one or more products. Please update those products before removing it." };
        }

        await prisma.category.delete({
            where: { id }
        });

        revalidatePath("/");
        revalidatePath("/admin/categories");
        revalidatePath("/admin/products/new");
        revalidatePath("/(public)/products");

        return { success: true, message: "Category removed successfully." };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { error: "Something went wrong. Please try again." };
    }
}
