import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { getClientDeviceId, isDeviceTrusted, trustDevice } from "@/lib/auth/device";
import { createOtpToken, verifyOtpToken } from "@/lib/auth/otp";
import { sendAdminLoginOtp } from "@/lib/email/mail";

export async function POST(request: Request) {
    try {
        const { username, password, otp } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const admin = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (!admin) {
            return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
        }

        const isValidPassword = await verifyPassword(password, admin.password);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
        }

        const deviceId = await getClientDeviceId();
        const trusted = await isDeviceTrusted(admin.id, deviceId);

        // If they submitted an OTP, let's verify it
        if (otp) {
            const isOtpValid = await verifyOtpToken(username, "LOGIN_OTP", otp);
            if (!isOtpValid) {
                return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 });
            }

            // OTP verified. Trust the device. Parse basic user agent / IP ideally, but we'll use defaults for now if not available
            const ua = request.headers.get("user-agent") || "Unknown Browser";
            const ip = request.headers.get("x-forwarded-for") || "Unknown IP";
            await trustDevice(admin.id, deviceId, "Admin Device", ua, ip);

            await createSession(admin.id, admin.username);
            return NextResponse.json({ success: true, redirect: "/admin" });
        }

        // Without OTP
        if (trusted || !admin.securityEmail) {
            // Log in normally
            await createSession(admin.id, admin.username);

            // If they didn't have a security email, maybe we can implicitly trust device anyway to start tracking.
            if (!trusted) {
                const ua = request.headers.get("user-agent") || "Unknown Browser";
                const ip = request.headers.get("x-forwarded-for") || "Unknown IP";
                await trustDevice(admin.id, deviceId, "Admin Device (Legacy)", ua, ip);
            }

            return NextResponse.json({ success: true, redirect: "/admin" });
        } else {
            // Generate and send OTP
            const newOtp = await createOtpToken(username, "LOGIN_OTP", 10);
            const sent = await sendAdminLoginOtp(admin.securityEmail, newOtp);

            if (!sent) {
                return NextResponse.json({ error: "Failed to send verification email. Please try again later." }, { status: 500 });
            }

            // Return that OTP is required, conceal the actual email somewhat
            const obscuredEmail = admin.securityEmail.replace(/(.{2})(.*)(?=@)/,
                (gp1, gp2, gp3) => {
                    return gp2 + '*'.repeat(gp3.length)
                }
            );

            return NextResponse.json({
                requireOtp: true,
                message: `Verification code sent to your registered security email (${obscuredEmail}).`
            });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
