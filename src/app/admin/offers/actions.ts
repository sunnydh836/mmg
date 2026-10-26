'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";

export async function createOffer(formData: FormData) {
    try {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string || "";
        const shortDescription = formData.get("shortDescription") as string | null;
        const badge = formData.get("badge") as string | null;
        const ctaText = formData.get("ctaText") as string | null;
        const ctaLink = formData.get("ctaLink") as string | null;
        const displayOrder = parseInt(formData.get("displayOrder") as string || "0");
        const isActive = formData.get("isActive") === "true";

        // Dates
        const startDateStr = formData.get("startDate") as string;
        const endDateStr = formData.get("endDate") as string;
        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        let imageUrl: string | null = null;
        const imageFile = formData.get("image") as File | null;

        if (imageFile && imageFile.size > 0) {
            const { url, error } = await storage.uploadFile(imageFile);
            if (error || !url) {
                return { error: "Failed to upload image." };
            }
            imageUrl = url;
        }

        const offer = await prisma.offer.create({
            data: {
                title,
                description,
                shortDescription,
                badge,
                ctaText,
                ctaLink,
                displayOrder,
                isActive,
                startDate,
                endDate,
                imageUrl,
            },
        });

        revalidatePath('/admin/offers');
        revalidatePath('/');
        return { success: true, offer };
    } catch (error) {
        console.error("Error creating offer:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create offer" };
    }
}

export async function updateOffer(id: string, formData: FormData) {
    try {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string || "";
        const shortDescription = formData.get("shortDescription") as string | null;
        const badge = formData.get("badge") as string | null;
        const ctaText = formData.get("ctaText") as string | null;
        const ctaLink = formData.get("ctaLink") as string | null;
        const displayOrder = parseInt(formData.get("displayOrder") as string || "0");
        let isActive = undefined;
        if (formData.has("isActive")) {
            isActive = formData.get("isActive") === "true";
        }

        // Dates
        const startDateStr = formData.get("startDate") as string;
        const endDateStr = formData.get("endDate") as string;
        let startDate = undefined;
        let endDate = undefined;

        if (formData.has("startDate")) {
            startDate = startDateStr ? new Date(startDateStr) : null;
        }
        if (formData.has("endDate")) {
            endDate = endDateStr ? new Date(endDateStr) : null;
        }

        let imageUrl = undefined;
        const imageFile = formData.get("image") as File | null;

        if (imageFile && imageFile.size > 0) {
            const { url, error } = await storage.uploadFile(imageFile);
            if (error || !url) {
                return { error: "Failed to upload image." };
            }
            imageUrl = url;
        }

        const data: any = {
            title,
            description,
            shortDescription,
            badge,
            ctaText,
            ctaLink,
            displayOrder,
        };

        if (isActive !== undefined) data.isActive = isActive;
        if (startDate !== undefined) data.startDate = startDate;
        if (endDate !== undefined) data.endDate = endDate;
        if (imageUrl !== undefined) data.imageUrl = imageUrl;

        const offer = await prisma.offer.update({
            where: { id },
            data,
        });

        revalidatePath('/admin/offers');
        revalidatePath('/');
        return { success: true, offer };
    } catch (error) {
        console.error("Error updating offer:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update offer" };
    }
}

export async function deleteOffer(id: string) {
    try {
        const offer = await prisma.offer.findUnique({ where: { id } });
        if (offer?.imageUrl) {
            await storage.deleteFile(offer.imageUrl);
        }

        await prisma.offer.delete({
            where: { id },
        });
        revalidatePath('/admin/offers');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Error deleting offer:", error);
        return { success: false, error: "Failed to delete offer" };
    }
}

export async function toggleOfferStatus(id: string, isActive: boolean) {
    try {
        const offer = await prisma.offer.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/admin/offers');
        revalidatePath('/');
        return { success: true, offer };
    } catch (error) {
        console.error("Error toggling offer status:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

export async function reorderOffers(offers: { id: string; displayOrder: number }[]) {
    try {
        await prisma.$transaction(
            offers.map(offer =>
                prisma.offer.update({
                    where: { id: offer.id },
                    data: { displayOrder: offer.displayOrder },
                })
            )
        );
        revalidatePath('/admin/offers');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Error reordering offers:", error);
        return { success: false, error: "Failed to reorder offers" };
    }
}
