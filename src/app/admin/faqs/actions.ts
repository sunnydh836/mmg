"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { defaultSettings, formatOpeningHours } from "@/lib/settings";

// Helper for auth check
async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }
}

export async function getFaqs() {
    await requireAuth();
    return prisma.fAQ.findMany({
        orderBy: { sortOrder: "asc" },
    });
}

export async function addFaq(data: { question: string; answer: string; sortOrder: number; isActive: boolean }) {
    try {
        await requireAuth();

        const question = data.question.trim();
        const answer = data.answer.trim();

        if (!question || !answer) {
            return { success: false, error: "Question and answer cannot be empty" };
        }

        // Prevent duplicates
        const existing = await prisma.fAQ.findFirst({
            where: { question: { equals: question, mode: "insensitive" } },
        });
        if (existing) {
            return { success: false, error: "An FAQ with this question already exists." };
        }

        const result = await prisma.fAQ.create({
            data: {
                question,
                answer,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
            },
        });

        revalidatePath("/");
        revalidatePath("/admin/faqs");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("Error creating FAQ:", err);
        if (err.code === "P2002") {
            return { success: false, error: "An FAQ with this question already exists." };
        }
        return { success: false, error: "Something went wrong while saving the FAQ. Please try again." };
    }
}

export async function updateFaq(id: string, data: { question: string; answer: string; sortOrder: number; isActive: boolean }) {
    try {
        await requireAuth();

        const question = data.question.trim();
        const answer = data.answer.trim();

        if (!question || !answer) {
            return { success: false, error: "Question and answer cannot be empty" };
        }

        // Check unique but exclude self
        const existing = await prisma.fAQ.findFirst({
            where: {
                question: { equals: question, mode: "insensitive" },
                id: { not: id }
            },
        });
        if (existing) {
            return { success: false, error: "An FAQ with this question already exists." };
        }

        const result = await prisma.fAQ.update({
            where: { id },
            data: {
                question,
                answer,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
            },
        });

        revalidatePath("/");
        revalidatePath("/admin/faqs");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("Error updating FAQ:", err);
        if (err.code === "P2002") {
            return { success: false, error: "An FAQ with this question already exists." };
        }
        return { success: false, error: "Something went wrong while saving the FAQ. Please try again." };
    }
}

export async function deleteFaq(id: string) {
    try {
        await requireAuth();

        const result = await prisma.fAQ.delete({
            where: { id },
        });

        revalidatePath("/");
        revalidatePath("/admin/faqs");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("Error deleting FAQ:", err);
        return { success: false, error: "Something went wrong while deleting the FAQ. Please try again." };
    }
}

export async function updateFaqStatus(id: string, isActive: boolean) {
    await requireAuth();

    const result = await prisma.fAQ.update({
        where: { id },
        data: { isActive },
    });

    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return result;
}

export async function updateFaqOrder(updates: { id: string; sortOrder: number }[]) {
    await requireAuth();

    for (const update of updates) {
        await prisma.fAQ.update({
            where: { id: update.id },
            data: { sortOrder: update.sortOrder },
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true };
}

export async function seedFaqs() {
    await requireAuth();

    const count = await prisma.fAQ.count();
    if (count > 0) {
        return { success: true, message: "Database already has FAQs." };
    }

    const defaultFaqs = [
        {
            question: "What mobile repairing services do you provide?",
            answer: "We provide mobile repairing services in-store. Please contact us or visit the shop for details about your device.",
            sortOrder: 1,
            isActive: true,
        },
        {
            question: "Can I sell my old mobile phone?",
            answer: "Yes, we purchase eligible old mobile phones. Contact the shop for details and evaluation.",
            sortOrder: 2,
            isActive: true,
        },
        {
            question: "Can I pre-order a mobile phone?",
            answer: "Currently, mobile pre-orders are not available.",
            sortOrder: 3,
            isActive: true,
        },
        {
            question: "Do you sell mobile accessories?",
            answer: "Yes, mobile accessories are available in-store. Contact us or visit the shop for current availability.",
            sortOrder: 4,
            isActive: true,
        },
        {
            question: "What are your opening hours?",
            answer: `The shop is available ${formatOpeningHours(defaultSettings.openingTime, defaultSettings.closingTime)}.`,
            sortOrder: 5,
            isActive: true,
        },
        {
            question: `How can I contact ${defaultSettings.displayName}?`,
            answer: `You can contact us at +91 ${defaultSettings.phone} or visit us at ${defaultSettings.address}.`,
            sortOrder: 6,
            isActive: true,
        },
        {
            question: "Do you give gifts with mobile purchases?",
            answer: "Gift benefits may be available with eligible mobile purchases. Gift offers can vary depending on the phone and current store offer, so please contact the shop or ask in-store for the latest gift offer.",
            sortOrder: 7,
            isActive: true,
        },
    ];

    await prisma.fAQ.createMany({
        data: defaultFaqs,
    });

    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true, message: "Initial FAQs seeded successfully." };
}
