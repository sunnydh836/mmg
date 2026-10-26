require("dotenv").config({ path: ".env" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

async function test() {
    try {
        console.log("Finding admin user...");
        const admin = await prisma.adminUser.findFirst();
        console.log("Admin:", admin);
        if (!admin) return console.log("No admin");

        console.log("Generating OTP...");
        const otp = crypto.randomInt(100000, 999999).toString();
        const tokenHash = await bcrypt.hash(otp, 10);
        console.log("OTP Hash:", tokenHash);

        console.log("Saving OTP to DB...");
        await prisma.otpToken.create({
            data: {
                identifier: admin.username,
                tokenHash,
                purpose: "PASSWORD_RESET",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        console.log("OTP saved to DB");

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
        });

        console.log("Sending email...");
        await transporter.sendMail({
            from: "test@example.com",
            to: admin.securityEmail || "test@example.com",
            subject: "test",
            html: "test"
        });
        console.log("Email sent!");
    } catch (e) {
        console.error("ERROR HAPPENED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
