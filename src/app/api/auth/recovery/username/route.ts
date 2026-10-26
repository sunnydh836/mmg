import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOtpToken, verifyOtpToken } from "@/lib/auth/otp";
import { sendAdminUsernameRecoveryOtp } from "@/lib/email/mail";

export async function POST(request: Request) {
    try {
        const { action, email, otp } = await request.json();

        if (action === "REQUEST_OTP") {
            if (!email) return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });

            try {
                const admin = await prisma.adminUser.findFirst({ where: { securityEmail: email } });

                if (admin && admin.securityEmail) {
                    const newOtp = await createOtpToken(email, "USERNAME_RECOVERY", 10);
                    const emailResult = await sendAdminUsernameRecoveryOtp(admin.securityEmail, newOtp);

                    if (!emailResult.success) {
                        await prisma.otpToken.deleteMany({
                            where: { identifier: email, purpose: "USERNAME_RECOVERY" }
                        });
                        return NextResponse.json({
                            success: false,
                            code: emailResult.code,
                            error: emailResult.message
                        }, { status: 503 });
                    }
                }
                return NextResponse.json({ success: true, message: "If the email is registered, an OTP has been sent." });
            } catch (innerError) {
                console.error("Database or OTP Error in username recovery request.");
                return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
            }
        }

        if (action === "VERIFY_AND_REVEAL") {
            if (!email || !otp) {
                return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });
            }

            try {
                const isValidOtp = await verifyOtpToken(email, "USERNAME_RECOVERY", otp);
                if (!isValidOtp) {
                    return NextResponse.json({ error: "The verification code is incorrect or expired." }, { status: 400 });
                }

                const admin = await prisma.adminUser.findFirst({ where: { securityEmail: email } });
                if (!admin) {
                    return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 400 });
                }

                return NextResponse.json({ success: true, username: admin.username });
            } catch (innerError) {
                console.error("Database or verification error in username reveal.");
                return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
            }
        }

        return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });
    } catch (error) {
        console.error("Unhandled Forgot Username Route Error.");
        return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
    }
}
