import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { GalleryManager } from "./GalleryManager";

export const metadata: Metadata = {
    title: "Gallery | MMG Admin",
};

export const dynamic = 'force-dynamic';

export default async function GalleryAdminPage() {
    const galleryImages = await prisma.galleryImage.findMany({
        orderBy: { displayOrder: 'asc' },
        select: {
            id: true,
            imageUrl: true,
            title: true,
            category: true,
            displayOrder: true,
            isActive: true,
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Gallery</h1>
                <p className="text-sm text-neutral-400 mt-2">
                    Manage the public gallery photos. Add categories, update titles, and toggle visibility. Hero images and Instagram Reels are managed separately.
                </p>
            </div>

            <GalleryManager initialImages={galleryImages} />
        </div>
    );
}
