import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const DEVICE_COOKIE_NAME = "admin_device_id";

// Returns current request's device ID or generates a new one safely
export async function getClientDeviceId(): Promise<string> {
    const cookieStore = await cookies();
    let deviceId = cookieStore.get(DEVICE_COOKIE_NAME)?.value;

    if (!deviceId) {
        deviceId = uuidv4();
        // Give it a long lifespan on the client side (e.g. 1 year)
        // Trust is enforced on server-side expiration.
        cookieStore.set(DEVICE_COOKIE_NAME, deviceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            sameSite: "lax",
            path: "/",
        });
    }

    return deviceId;
}

// Checks if the device is currently trusted for the user
export async function isDeviceTrusted(adminUserId: string, deviceId: string): Promise<boolean> {
    const device = await prisma.adminDevice.findUnique({
        where: { deviceId },
    });

    if (!device) return false;
    if (device.adminUserId !== adminUserId) return false;

    // Check revocation / expiration
    if (device.revokedAt) return false;
    if (new Date() > device.expiresAt) return false;

    // Update last used at timestamp
    await prisma.adminDevice.update({
        where: { id: device.id },
        data: { lastUsedAt: new Date() }
    });

    return true;
}

// Trust a device for 30 days
export async function trustDevice(adminUserId: string, deviceId: string, deviceName: string = "Unknown Device", userAgent: string = "", ipAddress: string = "") {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Upsert the device trust record
    await prisma.adminDevice.upsert({
        where: { deviceId },
        update: {
            adminUserId,
            deviceName,
            userAgent,
            ipAddress,
            expiresAt,
            lastUsedAt: new Date(),
            revokedAt: null, // Clear revocation if any
        },
        create: {
            deviceId,
            adminUserId,
            deviceName,
            userAgent,
            ipAddress,
            expiresAt,
            lastUsedAt: new Date(),
        }
    });
}
