import nodemailer from "nodemailer";
import { getEmailTemplates } from "./email-templates";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT || "587") === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // Fixed variable name to match .env
    },
});

const defaultFrom = process.env.SMTP_FROM || `"Mahadev Mobile Gallery" <${process.env.SMTP_USER}>`;

// Diagnostic check during development
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        console.log("[EMAIL] SMTP configuration detected.");
        transporter.verify(function (error, success) {
            if (error) {
                console.error("[EMAIL] SMTP connection verification: FAILED");
                console.error("[EMAIL] Reason: authentication/configuration failure");
            }
        });
    } else {
        console.warn("[EMAIL] SMTP variables missing. Email feature will not function correctly.");
    }
}

export type EmailSendResult =
    | { success: true }
    | { success: false; code: string; message: string };

async function sendMailSafely(to: string, subject: string, html: string): Promise<EmailSendResult> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error("SMTP credentials not configured.");
        return {
            success: false,
            code: "MISSING_SMTP_CONFIG",
            message: "Email verification is temporarily unavailable."
        };
    }

    try {
        await transporter.sendMail({
            from: defaultFrom,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        // Detailed error not logged so password/auth credentials are safe
        console.error("Email sending failed due to transporter/configuration issue.");

        // Handle specific connection/auth failures if necessary, but returning generic
        return {
            success: false,
            code: "EMAIL_SEND_FAILED",
            message: "We couldn't send the verification code right now. Please try again later."
        };
    }
}

export async function sendAdminLoginOtp(email: string, otp: string) {
    const html = getEmailTemplates().loginOtp(otp);
    return sendMailSafely(email, "MMG Admin Login Verification Code", html);
}

export async function sendAdminPasswordResetOtp(email: string, otp: string) {
    const html = getEmailTemplates().passwordReset(otp);
    return sendMailSafely(email, "MMG Admin Password Reset Verification", html);
}

export async function sendAdminUsernameRecoveryOtp(email: string, otp: string) {
    const html = getEmailTemplates().usernameRecovery(otp);
    return sendMailSafely(email, "MMG Admin Username Recovery", html);
}

export async function sendAdminEmailChangeOtp(email: string, otp: string) {
    const html = getEmailTemplates().emailChange(otp);
    return sendMailSafely(email, "MMG Admin Security Email Verification", html);
}
