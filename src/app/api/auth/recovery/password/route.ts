import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOtpToken, verifyOtpToken } from "@/lib/auth/otp";
import { sendAdminPasswordResetOtp } from "@/lib/email/mail";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { action, username, email, otp, newPassword } = await request.json();

        if (action === "REQUEST_OTP") {
            if (!username) return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });

            try {
                const admin = await prisma.adminUser.findUnique({ where: { username } });

                if (admin && admin.securityEmail) {
                    const newOtp = await createOtpToken(username, "PASSWORD_RESET", 10);
                    const emailResult = await sendAdminPasswordResetOtp(admin.securityEmail, newOtp);

                    if (!emailResult.success) {
                        await prisma.otpToken.deleteMany({
                            where: { identifier: username, purpose: "PASSWORD_RESET" }
                        });
                        return NextResponse.json({
                            success: false,
                            code: emailResult.code,
                            error: emailResult.message
                        }, { status: 503 }); // 503 Service Unavailable for failed email config
                    }
                }
                return NextResponse.json({ success: true, message: "If the account exists, an OTP has been sent." });
            } catch (innerError: any) {
                console.error("[AUTH-RECOVERY] DATABASE/INTERNAL EXCEPTION:", innerError?.message || String(innerError));
                return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
            }
        }

        if (action === "VERIFY_AND_RESET") {
            if (!username || !otp || !newPassword) {
                return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });
            }

            try {
                const isValidOtp = await verifyOtpToken(username, "PASSWORD_RESET", otp);
                if (!isValidOtp) {
                    return NextResponse.json({ error: "The verification code is incorrect or expired." }, { status: 400 });
                }

                const admin = await prisma.adminUser.findUnique({ where: { username } });
                if (!admin) {
                    return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 400 });
                }

                const hashedPassword = await hashPassword(newPassword);
                await prisma.adminUser.update({
                    where: { id: admin.id },
                    data: { password: hashedPassword }
                });

                await prisma.adminDevice.updateMany({
                    where: { adminUserId: admin.id },
                    data: { revokedAt: new Date() }
                });

                return NextResponse.json({ success: true, message: "Password updated successfully." });
            } catch (innerError: any) {
                console.error("[AUTH-RECOVERY] VERIFICATION EXCEPTION:", innerError?.message || String(innerError));
                return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
            }
        }

        return NextResponse.json({ error: "Please provide the required information." }, { status: 400 });
    } catch (error: any) {
        console.error("Unhandled Forgot Password Route Error:", error?.message || String(error));
        return NextResponse.json({ error: "Something went wrong while processing your request." }, { status: 500 });
    }
}
