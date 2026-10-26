"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";

export async function addHeroImage(formData: FormData) {
    try {
        const activeCount = await prisma.heroImage.count({
            where: { isActive: true }
        });

        if (activeCount >= 6) {
            return { error: "Maximum 6 active hero images allowed." };
        }

        const imageFile = formData.get("image") as File | null;
        if (!imageFile || imageFile.size === 0) {
            return { error: "No image file provided." };
        }

        const { url, error } = await storage.uploadFile(imageFile);

        if (error || !url) {
            return { error: "Failed to upload image." };
        }

        // Get highest current display order
        const maxOrderHero = await prisma.heroImage.findFirst({
            orderBy: { displayOrder: 'desc' }
        });
        const nextOrder = maxOrderHero ? maxOrderHero.displayOrder + 1 : 0;

        const heroImage = await prisma.heroImage.create({
            data: {
                imageUrl: url,
                displayOrder: nextOrder,
                isActive: true
            }
        });

        revalidatePath("/admin/gallery/hero");
        revalidatePath("/");

        return { success: true, heroImage };
    } catch (error) {
        console.error("Failed to add hero image", error);
        return { error: error instanceof Error ? error.message : "Failed to add hero image" };
    }
}

export async function deleteHeroImage(id: string) {
    try {
        const hero = await prisma.heroImage.findUnique({ where: { id } });
        if (hero?.imageUrl) {
            await storage.deleteFile(hero.imageUrl);
        }

        await prisma.heroImage.delete({
            where: { id },
        });

        revalidatePath("/admin/gallery/hero");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete hero image", error);
        return { error: error instanceof Error ? error.message : "Failed to delete hero image" };
    }
}

export async function toggleHeroImageStatus(id: string, isActive: boolean) {
    try {
        if (isActive) {
            const activeCount = await prisma.heroImage.count({
                where: { isActive: true, id: { not: id } }
            });
            if (activeCount >= 6) {
                return { error: "Maximum 6 active hero images allowed." };
            }
        }

        await prisma.heroImage.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/admin/gallery/hero");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status", error);
        return { error: error instanceof Error ? error.message : "Failed to toggle status" };
    }
}

export async function reorderHeroImages(items: { id: string; displayOrder: number }[]) {
    try {
        // Use a transaction to perform all updates safely
        await prisma.$transaction(
            items.map(item =>
                prisma.heroImage.update({
                    where: { id: item.id },
                    data: { displayOrder: item.displayOrder }
                })
            )
        );

        revalidatePath("/admin/gallery/hero");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to reorder hero images", error);
        return { error: error instanceof Error ? error.message : "Failed to reorder hero images" };
    }
}
