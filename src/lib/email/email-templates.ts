export function getEmailTemplates() {
    const baseTemplate = (content: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0ea5e9; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Mahadev Mobile Gallery</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                ${content}
                <br />
                <p style="color: #666; font-size: 13px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
                    If you did not request this action, please secure your account immediately or ignore this email.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 10px; text-align: center;">
                    &copy; ${new Date().getFullYear()} Mahadev Mobile Gallery & Repairing. All rights reserved.
                </p>
            </div>
        </div>
    `;

    return {
        loginOtp: (otp: string) => baseTemplate(`
            <h2 style="color: #333; margin-top: 0;">Admin Login Verification</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
                We detected a login attempt from a new or unrecognized device. Please use the following verification code to complete your login. This code will expire in 10 minutes.
            </p>
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h3>
            </div>
        `),
        passwordReset: (otp: string) => baseTemplate(`
            <h2 style="color: #333; margin-top: 0;">Password Reset Verification</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
                You recently requested to reset your admin password. Provide the following code to continue the process. This code will expire in 10 minutes.
            </p>
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h3>
            </div>
        `),
        usernameRecovery: (otp: string) => baseTemplate(`
            <h2 style="color: #333; margin-top: 0;">Username Recovery Verification</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
                You requested to recover your admin username. Use this verification code to securely access it. This code will expire in 10 minutes.
            </p>
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h3>
            </div>
        `),
        emailChange: (otp: string) => baseTemplate(`
            <h2 style="color: #333; margin-top: 0;">Security Email Verification</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
                You are attempting to set this address as the new security email for the Admin account. Please verify this email using the code below. This code will expire in 10 minutes.
            </p>
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h3>
            </div>
        `),
    };
}
