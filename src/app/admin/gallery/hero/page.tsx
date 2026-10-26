import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { HeroGalleryManager } from "./HeroGalleryManager";

export const metadata: Metadata = {
    title: "Hero Images | MMG Admin",
};

export const dynamic = 'force-dynamic';

export default async function HeroImagesPage() {
    const heroImages = await prisma.heroImage.findMany({
        orderBy: { displayOrder: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Hero Images</h1>
                <p className="text-sm text-neutral-400 mt-2 hover:text-white transition-colors cursor-default">
                    Manage the hero image carousel for the homepage. You can upload up to 6 images.
                </p>
            </div>

            <HeroGalleryManager initialImages={heroImages} />
        </div>
    );
}
