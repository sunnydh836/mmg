"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, LogIn, AlertCircle, ArrowLeft, Mail, Key } from "lucide-react";

type ViewState = "LOGIN" | "LOGIN_OTP" | "FORGOT_PASSWORD" | "FORGOT_PASS_OTP" | "FORGOT_USERNAME" | "FORGOT_USER_OTP";

export default function AdminLogin() {
    const [view, setView] = useState<ViewState>("LOGIN");

    // Form fields
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState(""); // For forgot username
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // OTP message back from API (e.g. obscured email hint)
    const [otpHint, setOtpHint] = useState("");

    const router = useRouter();

    const clearMessages = () => {
        setError("");
        setSuccessMsg("");
    };

    const changeView = (newView: ViewState) => {
        clearMessages();
        setOtp("");
        setView(newView);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.requireOtp) {
                    setOtpHint(data.message);
                    changeView("LOGIN_OTP");
                } else if (data.success) {
                    router.push(data.redirect || "/admin");
                    router.refresh();
                }
            } else {
                setError(data.error || "An error occurred during login");
            }
        } catch (err) {
            setError("Failed to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLoginOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, otp }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push(data.redirect || "/admin");
                router.refresh();
            } else {
                setError(data.error || "Invalid OTP code.");
            }
        } catch (err) {
            setError("Failed to connect verify OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendLoginOtp = async () => {
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/otp/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("A new verification code has been sent.");
            } else {
                setError(data.error || "Failed to resend OTP");
            }
        } catch {
            setError("Server error.");
        } finally {
            setLoading(false);
        }
    }

    const handleResendForgotPattern = async (type: "PASSWORD" | "USERNAME") => {
        setLoading(true);
        clearMessages();
        try {
            const url = type === "PASSWORD" ? "/api/auth/recovery/password" : "/api/auth/recovery/username";
            const body = type === "PASSWORD"
                ? { action: "REQUEST_OTP", username }
                : { action: "REQUEST_OTP", email };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("Verification code sent to your registered email. Please check your inbox and spam folder.");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server error.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/recovery/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REQUEST_OTP", username }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("Verification code sent to your registered email. Please check your inbox and spam folder.");
                changeView("FORGOT_PASS_OTP");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server error.");
        } finally { setLoading(false); }
    };

    const handleForgotPasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/recovery/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "VERIFY_AND_RESET", username, otp, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setPassword(newPassword); // For auto login convenience if logic allows, or just reset
                setSuccessMsg("Password successfully reset! You can now log in.");
                setTimeout(() => changeView("LOGIN"), 2000);
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server error.");
        } finally { setLoading(false); }
    };

    const handleForgotUsernameRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/recovery/username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REQUEST_OTP", email }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("Verification code sent to your registered email. Please check your inbox and spam folder.");
                changeView("FORGOT_USER_OTP");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server error.");
        } finally { setLoading(false); }
    };

    const handleForgotUsernameVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/recovery/username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "VERIFY_AND_REVEAL", email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg(`Your username is: ${data.username}`);
                setUsername(data.username);
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server error.");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />

                    <div className="text-center mb-8 pt-2">
                        <div className="w-14 h-14 bg-neutral-800 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-inner border border-neutral-700/50">
                            <Lock className="w-6 h-6 text-neutral-300" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Admin Security</h1>
                        <p className="text-sm text-neutral-400">Restricted access portal</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 flex items-start gap-3 text-red-400 overflow-hidden"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-5 flex items-start gap-3 text-emerald-400 overflow-hidden"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{successMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* LOGIN VIEW */}
                    {view === "LOGIN" && (
                        <motion.form
                            key="form-login"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Key className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white hover:bg-neutral-200 text-neutral-900 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-sm"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                                ) : (
                                    <><span>Sign In</span><LogIn className="w-4 h-4" /></>
                                )}
                            </button>

                            <div className="flex items-center justify-between mt-4 text-xs">
                                <button type="button" onClick={() => changeView("FORGOT_PASSWORD")} className="text-neutral-400 hover:text-white transition-colors">
                                    Forgot Password?
                                </button>
                                <button type="button" onClick={() => changeView("FORGOT_USERNAME")} className="text-neutral-400 hover:text-white transition-colors">
                                    Forgot Username?
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* LOGIN OTP VIEW */}
                    {view === "LOGIN_OTP" && (
                        <motion.form
                            key="form-login-otp"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleVerifyLoginOtp}
                            className="space-y-4 text-center"
                        >
                            <p className="text-sm text-neutral-300 mb-4">{otpHint}</p>
                            <div>
                                <div className="relative max-w-[200px] mx-auto">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 px-4 text-white text-2xl tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                        placeholder="------"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify & Login"}
                            </button>

                            <div className="pt-2">
                                <button type="button" onClick={handleResendLoginOtp} disabled={loading} className="text-xs text-neutral-400 hover:text-white transition-colors underline-offset-4 hover:underline">
                                    Didn&apos;t receive it? Resend Code
                                </button>
                            </div>

                            <button type="button" onClick={() => changeView("LOGIN")} className="mt-4 text-sm text-neutral-500 flex items-center justify-center gap-2 w-full hover:text-neutral-300 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to login
                            </button>
                        </motion.form>
                    )}

                    {/* FORGOT PASSWORD REQUEST */}
                    {view === "FORGOT_PASSWORD" && (
                        <motion.form
                            key="form-forgot-pass"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleForgotPasswordRequest}
                            className="space-y-4"
                        >
                            <p className="text-sm text-neutral-400 mb-4">Enter your username to recover your password. We&apos;ll send a code to your registered security email.</p>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white hover:bg-neutral-200 text-neutral-900 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                                        <span>Sending verification code...</span>
                                    </>
                                ) : "Send Reset Code"}
                            </button>
                            <button type="button" onClick={() => changeView("LOGIN")} className="mt-4 text-sm text-neutral-500 flex items-center justify-center gap-2 w-full hover:text-neutral-300">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </button>
                        </motion.form>
                    )}

                    {/* FORGOT PASSWORD OTP & NEW PASS */}
                    {view === "FORGOT_PASS_OTP" && (
                        <motion.form
                            key="form-forgot-pass-otp"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleForgotPasswordVerify}
                            className="space-y-4"
                        >
                            <p className="text-sm text-neutral-400 mb-4">Please check your email and enter the verification code below to reset your password.</p>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 px-4 text-white text-center text-xl tracking-[0.2em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    placeholder="------"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            <div className="pt-2 text-center">
                                <button type="button" onClick={() => handleResendForgotPattern("PASSWORD")} disabled={loading} className="text-xs text-neutral-400 hover:text-white transition-colors underline-offset-4 hover:underline">
                                    Didn&apos;t receive it? Resend Code
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reset Password"}
                            </button>
                            <button type="button" onClick={() => changeView("LOGIN")} className="mt-4 text-sm text-neutral-500 flex items-center justify-center gap-2 w-full hover:text-neutral-300">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </button>
                        </motion.form>
                    )}

                    {/* FORGOT USERNAME REQUEST */}
                    {view === "FORGOT_USERNAME" && (
                        <motion.form
                            key="form-forgot-user"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleForgotUsernameRequest}
                            className="space-y-4"
                        >
                            <p className="text-sm text-neutral-400 mb-4">Enter your registered security email. We&apos;ll send a code to verify it&apos;s you.</p>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Security Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white hover:bg-neutral-200 text-neutral-900 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                                        <span>Sending verification code...</span>
                                    </>
                                ) : "Send Code"}
                            </button>
                            <button type="button" onClick={() => changeView("LOGIN")} className="mt-4 text-sm text-neutral-500 flex items-center justify-center gap-2 w-full hover:text-neutral-300">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </button>
                        </motion.form>
                    )}

                    {/* FORGOT USERNAME OTP */}
                    {view === "FORGOT_USER_OTP" && (
                        <motion.form
                            key="form-forgot-user-otp"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleForgotUsernameVerify}
                            className="space-y-4 text-center"
                        >
                            <p className="text-sm text-neutral-300 mb-4">Enter the code sent to your email to recover your username.</p>
                            <div>
                                <div className="relative max-w-[200px] mx-auto">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl py-3 px-4 text-white text-2xl tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                        placeholder="------"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2 text-center">
                                <button type="button" onClick={() => handleResendForgotPattern("USERNAME")} disabled={loading} className="text-xs text-neutral-400 hover:text-white transition-colors underline-offset-4 hover:underline">
                                    Didn&apos;t receive it? Resend Code
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify & Reveal Username"}
                            </button>

                            <button type="button" onClick={() => changeView("LOGIN")} className="mt-4 text-sm text-neutral-500 flex items-center justify-center gap-2 w-full hover:text-neutral-300 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to login
                            </button>
                        </motion.form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
