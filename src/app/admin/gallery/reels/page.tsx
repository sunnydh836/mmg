import prisma from "@/lib/prisma";
import ReelsManager from "./ReelsManager";

export const dynamic = 'force-dynamic';

export default async function AdminReelsPage() {
    const reels = await prisma.instagramReel.findMany({
        orderBy: [
            { displayOrder: 'asc' },
            { createdAt: 'desc' }
        ]
    });

    return <ReelsManager reels={reels} />;
}
