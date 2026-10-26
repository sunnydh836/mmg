"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";

export async function updateSettings(formData: FormData) {
    try {
        const data = {
            businessName: formData.get("businessName") as string,
            displayName: formData.get("displayName") as string,
            tagline: formData.get("tagline") as string,
            phone: formData.get("phone") as string,
            whatsapp: formData.get("whatsapp") as string,
            address: formData.get("address") as string,
            mapsUrl: formData.get("mapsUrl") as string,
            mapsEmbedUrl: formData.get("mapsEmbedUrl") as string,
            openingTime: formData.get("openingTime") as string,
            closingTime: formData.get("closingTime") as string,
            weeklyOff: formData.get("weeklyOff") as string,
            email: formData.get("email") as string,
            instagram: formData.get("instagram") as string,
            youtube: formData.get("youtube") as string,
            facebook: formData.get("facebook") as string,
            instagramFollowers: formData.get("instagramFollowers") as string,
            logoUrl: formData.get("logoUrl") as string | null,
            openingHoursNote: formData.get("openingHoursNote") as string | null,

            hasEmi: true,
            hasPreOrder: true,
            hasOnlineOrdering: true,
            hasOnlineCheckout: true,
            hasWhatsappEnquiry: true,
            hasOldPhonePurchase: true,
            hasOldPhoneExchange: true,
            hasUsedPhones: true,
            hasGifts: true,
        };

        await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: data,
            create: {
                id: 1,
                ...data,
            }
        });

        // revalidate everything layout-level since settings are global
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error("Failed to update settings", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}

export async function uploadStoreLogo(formData: FormData) {
    try {
        const imageFile = formData.get("image") as File | null;

        if (!imageFile || imageFile.size === 0) {
            return { error: "No image file provided." };
        }

        const { url, error } = await storage.uploadFile(imageFile);

        if (error || !url) {
            return { error: "Failed to upload image." };
        }

        // We can optionally update the DB immediately or let the main form do it.
        // Let's just update it directly right now so it instantly saves.
        await prisma.storeSettings.update({
            where: { id: 1 },
            data: { logoUrl: url }
        });

        revalidatePath("/", "layout");

        return { success: true, url };
    } catch (err) {
        console.error("Failed to upload store logo", err);
        return { error: err instanceof Error ? err.message : "Failed to upload store logo" };
    }
}

export async function removeStoreLogo() {
    try {
        const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        if (settings?.logoUrl) {
            await storage.deleteFile(settings.logoUrl);
        }

        await prisma.storeSettings.update({
            where: { id: 1 },
            data: { logoUrl: null }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error("Failed to remove store logo", err);
        return { error: err instanceof Error ? err.message : "Failed to remove store logo" };
    }
}
