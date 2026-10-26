import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createOtpToken, verifyOtpToken } from "@/lib/auth/otp";
import { sendAdminEmailChangeOtp } from "@/lib/email/mail";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.adminUser.findUnique({
        where: { id: session.userId as string },
        include: {
            devices: {
                where: { revokedAt: null },
                orderBy: { lastUsedAt: 'desc' }
            }
        }
    });

    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
        username: admin.username,
        securityEmail: admin.securityEmail,
        devices: admin.devices.map(d => ({
            id: d.id,
            deviceId: d.deviceId,
            deviceName: d.deviceName,
            userAgent: d.userAgent,
            ipAddress: d.ipAddress,
            lastUsedAt: d.lastUsedAt,
            expiresAt: d.expiresAt
        }))
    });
}
