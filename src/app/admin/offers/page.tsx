import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { OfferClient } from "./OfferClient";

export const metadata: Metadata = {
    title: "Offers | MMG Admin",
};

export const dynamic = 'force-dynamic';

export default async function OffersAdminPage() {
    const offers = await prisma.offer.findMany({
        orderBy: [
            { displayOrder: 'asc' },
            { createdAt: 'desc' }
        ],
        select: {
            id: true,
            title: true,
            description: true,
            shortDescription: true,
            imageUrl: true,
            badge: true,
            ctaText: true,
            ctaLink: true,
            displayOrder: true,
            startDate: true,
            endDate: true,
            isActive: true,
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Offers</h1>
                <p className="text-sm text-neutral-400 mt-2">
                    Manage promotional offers shown directly below the Hero section on the homepage.
                </p>
            </div>

            <OfferClient initialOffers={offers} />
        </div>
    );
}
