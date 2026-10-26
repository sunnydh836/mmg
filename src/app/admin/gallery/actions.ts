"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";

export async function addGalleryImage(formData: FormData) {
    try {
        const imageFile = formData.get("image") as File | null;
        const title = formData.get("title") as string | null;
        const category = formData.get("category") as string || "STORE";

        if (!imageFile || imageFile.size === 0) {
            return { error: "No image file provided." };
        }

        const { url, error } = await storage.uploadFile(imageFile);

        if (error || !url) {
            return { error: "Failed to upload image." };
        }

        // Get highest current display order
        const maxOrderGalleryImage = await prisma.galleryImage.findFirst({
            orderBy: { displayOrder: 'desc' }
        });
        const nextOrder = maxOrderGalleryImage ? maxOrderGalleryImage.displayOrder + 1 : 0;

        const galleryImage = await prisma.galleryImage.create({
            data: {
                imageUrl: url,
                title: title || null,
                category,
                displayOrder: nextOrder,
                isActive: true
            }
        });

        revalidatePath("/admin/gallery");
        revalidatePath("/gallery");

        return { success: true, galleryImage };
    } catch (error) {
        console.error("Failed to add gallery image", error);
        return { error: error instanceof Error ? error.message : "Failed to add gallery image" };
    }
}

export async function updateGalleryImage(id: string, formData: FormData) {
    try {
        const title = formData.get("title") as string | null;
        const category = formData.get("category") as string;

        const galleryImage = await prisma.galleryImage.update({
            where: { id },
            data: {
                title: title || null,
                category
            }
        });

        revalidatePath("/admin/gallery");
        revalidatePath("/gallery");

        return { success: true, galleryImage };
    } catch (error) {
        console.error("Failed to update gallery image", error);
        return { error: error instanceof Error ? error.message : "Failed to update gallery image" };
    }
}

export async function deleteGalleryImage(id: string) {
    try {
        const gallery = await prisma.galleryImage.findUnique({ where: { id } });
        if (gallery?.imageUrl) {
            await storage.deleteFile(gallery.imageUrl);
        }

        await prisma.galleryImage.delete({
            where: { id },
        });

        revalidatePath("/admin/gallery");
        revalidatePath("/gallery");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete gallery image", error);
        return { error: error instanceof Error ? error.message : "Failed to delete gallery image" };
    }
}

export async function toggleGalleryImageStatus(id: string, isActive: boolean) {
    try {
        await prisma.galleryImage.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/admin/gallery");
        revalidatePath("/gallery");

        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status", error);
        return { error: error instanceof Error ? error.message : "Failed to toggle status" };
    }
}

export async function reorderGalleryImages(items: { id: string; displayOrder: number }[]) {
    try {
        // Use a transaction to perform all updates safely
        await prisma.$transaction(
            items.map(item =>
                prisma.galleryImage.update({
                    where: { id: item.id },
                    data: { displayOrder: item.displayOrder }
                })
            )
        );

        revalidatePath("/admin/gallery");
        revalidatePath("/gallery");

        return { success: true };
    } catch (error) {
        console.error("Failed to reorder gallery images", error);
        return { error: error instanceof Error ? error.message : "Failed to reorder gallery images" };
    }
}
