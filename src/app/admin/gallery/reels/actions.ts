"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/storage";

// Attempts to extract the OG image directly from the Instagram page HTML
async function fetchInstagramThumbnail(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            return null;
        }

        const html = await res.text();
        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

        if (ogImageMatch && ogImageMatch[1]) {
            // some URLs might end with multiple HTML entities or are encoded
            const decodedUrl = ogImageMatch[1].replace(/&amp;/g, "&");
            return decodedUrl;
        }

        return null;
    } catch (e) {
        console.error("Failed to fetch instagram thumbnail: ", e);
        return null;
    }
}

export async function addReel(formData: FormData) {
    try {
        const reelUrl = formData.get("reelUrl") as string;
        const title = formData.get("title") as string;
        const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
        const isActive = formData.get("isActive") === "true";

        const thumbnailFile = formData.get("thumbnail") as File | null;
        let thumbnailUrl = null;
        let thumbnailSource = "FALLBACK";

        if (thumbnailFile && thumbnailFile.size > 0) {
            const { url, error } = await storage.uploadFile(thumbnailFile);
            if (!error && url) {
                thumbnailUrl = url;
                thumbnailSource = "CUSTOM";
            }
        } else {
            // Attempt to get Instagram thumbnail
            const fetchedThumb = await fetchInstagramThumbnail(reelUrl);
            if (fetchedThumb) {
                thumbnailUrl = fetchedThumb;
                thumbnailSource = "INSTAGRAM";
            }
        }

        await prisma.instagramReel.create({
            data: {
                reelUrl,
                title,
                displayOrder,
                isActive,
                thumbnailUrl,
                thumbnailSource
            }
        });

        revalidatePath("/admin/gallery/reels");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to add reel", error);
        return { error: error instanceof Error ? error.message : "Failed to add reel" };
    }
}

export async function updateReel(id: string, formData: FormData) {
    try {
        const reelUrl = formData.get("reelUrl") as string;
        const title = formData.get("title") as string;
        const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
        const isActive = formData.get("isActive") === "true";

        const thumbnailFile = formData.get("thumbnail") as File | null;
        const removeCustom = formData.get("removeCustomThumbnail") === "true";

        const existingReel = await prisma.instagramReel.findUnique({ where: { id } });
        if (!existingReel) throw new Error("Reel not found");

        let thumbnailUrl = existingReel.thumbnailUrl;
        let thumbnailSource = existingReel.thumbnailSource;

        if (thumbnailFile && thumbnailFile.size > 0) {
            // Delete old custom thumbnail if it exists
            if (existingReel.thumbnailSource === "CUSTOM" && existingReel.thumbnailUrl) {
                await storage.deleteFile(existingReel.thumbnailUrl);
            }

            const { url, error } = await storage.uploadFile(thumbnailFile);
            if (!error && url) {
                thumbnailUrl = url;
                thumbnailSource = "CUSTOM";
            }
        } else if (removeCustom) {
            // User chose to remove the custom thumbnail
            if (existingReel.thumbnailSource === "CUSTOM" && existingReel.thumbnailUrl) {
                await storage.deleteFile(existingReel.thumbnailUrl);
            }

            // Try fetching Instagram one again
            const fetchedThumb = await fetchInstagramThumbnail(reelUrl);
            if (fetchedThumb) {
                thumbnailUrl = fetchedThumb;
                thumbnailSource = "INSTAGRAM";
            } else {
                thumbnailUrl = null;
                thumbnailSource = "FALLBACK";
            }
        } else if (existingReel.reelUrl !== reelUrl && thumbnailSource !== "CUSTOM") {
            // Reel URL changed and doesn't rely on a custom thumbnail, retry fetch
            const fetchedThumb = await fetchInstagramThumbnail(reelUrl);
            if (fetchedThumb) {
                thumbnailUrl = fetchedThumb;
                thumbnailSource = "INSTAGRAM";
            } else {
                thumbnailUrl = null;
                thumbnailSource = "FALLBACK";
            }
        }

        await prisma.instagramReel.update({
            where: { id },
            data: {
                reelUrl,
                title,
                displayOrder,
                isActive,
                thumbnailUrl,
                thumbnailSource
            }
        });

        revalidatePath("/admin/gallery/reels");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to update reel", error);
        return { error: error instanceof Error ? error.message : "Failed to update reel" };
    }
}

export async function deleteReel(id: string) {
    try {
        const reel = await prisma.instagramReel.findUnique({ where: { id } });
        if (reel?.thumbnailSource === "CUSTOM" && reel.thumbnailUrl) {
            await storage.deleteFile(reel.thumbnailUrl);
        }

        await prisma.instagramReel.delete({
            where: { id },
        });

        revalidatePath("/admin/gallery/reels");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete reel", error);
        return { error: error instanceof Error ? error.message : "Failed to delete reel" };
    }
}

export async function toggleReelStatus(id: string, isActive: boolean) {
    try {
        await prisma.instagramReel.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/admin/gallery/reels");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status", error);
        return { error: error instanceof Error ? error.message : "Failed to toggle status" };
    }
}
