import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOtpToken } from "@/lib/auth/otp";
import { sendAdminLoginOtp } from "@/lib/email/mail";

export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });
        }

        const admin = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (!admin || !admin.securityEmail) {
            // For security, do not reveal if the username exists or if it lacks an email.
            return NextResponse.json({ success: true, message: "If the account exists, an OTP will be sent." });
        }

        const newOtp = await createOtpToken(username, "LOGIN_OTP", 10);
        const emailResult = await sendAdminLoginOtp(admin.securityEmail, newOtp);

        if (!emailResult.success) {
            await prisma.otpToken.deleteMany({
                where: { identifier: username, purpose: "LOGIN_OTP" }
            });
            return NextResponse.json({
                success: false,
                code: emailResult.code,
                error: emailResult.message
            }, { status: 503 }); // Same behavior as forgot routes
        }

        return NextResponse.json({ success: true, message: "If the account exists, an OTP will be sent." });

    } catch (error) {
        console.error("Resend OTP Error."); // hide trace
        return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
    }
}
