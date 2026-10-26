"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Helper for auth check
async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }
}

export async function getServices() {
    await requireAuth();
    return prisma.service.findMany({
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "asc" }
        ],
    });
}

export async function addService(data: { title: string; description: string; features?: string[]; icon?: string | null; sortOrder: number; isActive: boolean }) {
    try {
        await requireAuth();

        const title = data.title.trim();
        const description = data.description.trim();

        if (!title || !description) {
            return { success: false, error: "Service name and description cannot be empty" };
        }

        const result = await prisma.service.create({
            data: {
                title,
                description,
                // @ts-ignore
                features: (data as any).features || [],
                icon: data.icon || null,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
            },
        });

        revalidatePath("/");
        revalidatePath("/services");
        revalidatePath("/admin/services");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("Error creating Service:", err);
        return { success: false, error: "Something went wrong while saving the service. Please try again." };
    }
}

export async function updateService(id: string, data: { title: string; description: string; features?: string[]; icon?: string | null; sortOrder: number; isActive: boolean }) {
    try {
        await requireAuth();

        const title = data.title.trim();
        const description = data.description.trim();

        if (!title || !description) {
            return { success: false, error: "Service name and description cannot be empty" };
        }

        const result = await prisma.service.update({
            where: { id },
            data: {
                title,
                description,
                // @ts-ignore
                features: (data as any).features || [],
                icon: data.icon || null,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
            },
        });

        revalidatePath("/");
        revalidatePath("/services");
        revalidatePath("/admin/services");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("Error updating Service:", err);
        return { success: false, error: "Something went wrong while saving the service. Please try again." };
    }
}

export async function deleteService(id: string) {
    try {
        await requireAuth();

        const result = await prisma.service.delete({
            where: { id },
        });

        revalidatePath("/");
        revalidatePath("/services");
        revalidatePath("/admin/services");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("Error deleting Service:", err);
        return { success: false, error: "Something went wrong while deleting the service. Please try again." };
    }
}

export async function updateServiceStatus(id: string, isActive: boolean) {
    await requireAuth();

    const result = await prisma.service.update({
        where: { id },
        data: { isActive },
    });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return result;
}

export async function updateServiceOrder(updates: { id: string; sortOrder: number }[]) {
    await requireAuth();

    for (const update of updates) {
        await prisma.service.update({
            where: { id: update.id },
            data: { sortOrder: update.sortOrder },
        });
    }

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { success: true };
}
