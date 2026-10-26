import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { createOtpToken, verifyOtpToken } from "@/lib/auth/otp";
import { sendAdminEmailChangeOtp } from "@/lib/email/mail";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.userId as string;
    const body = await request.json();

    try {
        if (body.action === "UPDATE_USERNAME") {
            const { username } = body;
            if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });

            const existing = await prisma.adminUser.findUnique({ where: { username } });
            if (existing && existing.id !== userId) {
                return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
            }

            await prisma.adminUser.update({
                where: { id: userId },
                data: { username }
            });
            return NextResponse.json({ success: true, message: "Username updated successfully." });
        }

        if (body.action === "UPDATE_PASSWORD") {
            const { currentPassword, newPassword } = body;

            const admin = await prisma.adminUser.findUnique({ where: { id: userId } });
            if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

            const isValid = await verifyPassword(currentPassword, admin.password);
            if (!isValid) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });

            const hashedPassword = await hashPassword(newPassword);

            await prisma.adminUser.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            // Optionally revoke all active devices on password change for security
            await prisma.adminDevice.updateMany({
                where: { adminUserId: userId },
                data: { revokedAt: new Date() }
            });

            return NextResponse.json({ success: true, message: "Password updated successfully." });
        }

        if (body.action === "REQUEST_EMAIL_OTP") {
            const { email } = body;
            if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

            // Generate an OTP and store it against this specific NEW email.
            const otp = await createOtpToken(email, "EMAIL_CHANGE", 10);
            await sendAdminEmailChangeOtp(email, otp);

            return NextResponse.json({ success: true, message: "Verification code sent to the new email." });
        }

        if (body.action === "VERIFY_EMAIL_CHANGE") {
            const { email, otp } = body;
            if (!email || !otp) return NextResponse.json({ error: "Incomplete request" }, { status: 400 });

            const isValid = await verifyOtpToken(email, "EMAIL_CHANGE", otp);
            if (!isValid) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });

            await prisma.adminUser.update({
                where: { id: userId },
                data: { securityEmail: email }
            });

            // When security email changes, it's a good practice to require new OTPs for un-revalidated devices, 
            // but the prompt says: "Invalidate/revoke existing trusted devices if appropriate. Require OTP again on next device login." 
            await prisma.adminDevice.updateMany({
                where: { adminUserId: userId },
                data: { revokedAt: new Date() }
            });
            return NextResponse.json({ success: true, message: "Security email updated successfully. You may need to verify your devices again on next login." });
        }

        if (body.action === "REVOKE_DEVICE") {
            const { deviceId } = body;
            await prisma.adminDevice.update({
                where: { id: deviceId },
                data: { revokedAt: new Date() }
            });
            return NextResponse.json({ success: true, message: "Device revoked." });
        }

        if (body.action === "REVOKE_OTHER_DEVICES") {
            const { currentDeviceId } = body;
            // Current device ID here is the database ID logic, but since it's hard to know which exact DB row is current session via cookie without passing cookie,
            // we either revoke ALL, or we need to pass the cookie up. Let's just revoke based on `admin_device_id` cookie.
            const cookieStore = await import("next/headers").then(m => m.cookies());
            const myDeviceCookie = cookieStore.get("admin_device_id")?.value;

            await prisma.adminDevice.updateMany({
                where: { adminUserId: userId, deviceId: { not: myDeviceCookie } },
                data: { revokedAt: new Date() }
            });
            return NextResponse.json({ success: true, message: "Other devices revoked." });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    } catch (error) {
        console.error("Auth settings Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
