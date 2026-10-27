import { cache } from "react";
import prisma from "./prisma";
import { defaultSettings } from "./settings-shared";

export * from "./settings-shared";

export const getStoreSettings = cache(async function getStoreSettings() {
    try {
        const settings = await prisma.storeSettings.findFirst();
        if (settings) return settings;
    } catch (error) {
        console.error("Failed to fetch store settings:", error);
    }

    // Return defaults when the record is missing or the database is unavailable.
    return { id: 1, ...defaultSettings, updatedAt: new Date() };
});
