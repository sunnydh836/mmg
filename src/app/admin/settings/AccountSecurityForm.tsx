"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Mail, User, Smartphone, Shield, X, Check, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountSecurityForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [admin, setAdmin] = useState<{ username: string; securityEmail: string; devices: any[] } | null>(null);

    // Edit states
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [emailOtpSent, setEmailOtpSent] = useState(false);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setAdmin(data);
                setUsername(data.username);
                setEmail(data.securityEmail || "");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "UPDATE_USERNAME", username })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                fetchAdminData();
                setActiveSection(null);
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server Error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestEmailOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REQUEST_EMAIL_OTP", email })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                setEmailOtpSent(true);
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server Error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "VERIFY_EMAIL_CHANGE", email, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                fetchAdminData();
                setActiveSection(null);
                setEmailOtpSent(false);
                setOtp("");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server Error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }
        setActionLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "UPDATE_PASSWORD", currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                setActiveSection(null);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Server Error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeDevice = async (deviceId: string) => {
        setActionLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REVOKE_DEVICE", deviceId })
            });
            if (res.ok) {
                setSuccess("Device revoked.");
                fetchAdminData();
            }
        } catch {
            setError("Server Error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeOtherDevices = async () => {
        setActionLoading(true);
        clearMessages();
        try {
            const res = await fetch("/api/auth/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REVOKE_OTHER_DEVICES" })
            });
            if (res.ok) {
                setSuccess("Other devices revoked successfully.");
                fetchAdminData();
            }
        } catch {
            setError("Server Error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!admin) return null;

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Security Settings
                </h3>
            </div>

            <AnimatePresence mode="wait">
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pt-6 -mb-2"
                    >
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-emerald-400">
                                <Check className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{success}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List of Settings */}
            <div className="p-2 space-y-2">

                {/* Username */}
                <div className="p-4 rounded-xl hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => { setActiveSection(activeSection === 'username' ? null : 'username'); clearMessages(); }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Username</p>
                                <p className="text-sm text-neutral-400">{admin.username}</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-blue-400 hover:text-blue-300 px-3 py-1 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                            {activeSection === 'username' ? 'Cancel' : 'Change'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {activeSection === 'username' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleUpdateUsername} className="pt-6 pb-2 px-2 flex gap-4">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="New username"
                                        required
                                    />
                                    <button disabled={actionLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Security Email */}
                <div className="p-4 rounded-xl hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => { setActiveSection(activeSection === 'email' ? null : 'email'); clearMessages(); setEmailOtpSent(false); setOtp(""); }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Security Email</p>
                                <p className="text-sm text-neutral-400">{admin.securityEmail || "Not configured"}</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 px-3 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors">
                            {activeSection === 'email' ? 'Cancel' : (admin.securityEmail ? 'Change' : 'Configure')}
                        </button>
                    </div>

                    <AnimatePresence>
                        {activeSection === 'email' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                {!emailOtpSent ? (
                                    <form onSubmit={handleRequestEmailOtp} className="pt-6 pb-2 px-2 flex gap-4">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                            placeholder="Enter new email address"
                                            required
                                        />
                                        <button disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center min-w-[140px]">
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyEmail} className="pt-6 pb-2 px-2">
                                        <p className="text-sm text-neutral-400 mb-4">We sent a verification code to <strong>{email}</strong>. Enter it below to confirm.</p>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                                maxLength={6}
                                                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-white text-xl tracking-[0.2em] font-mono text-center focus:outline-none focus:border-emerald-500"
                                                placeholder="------"
                                                required
                                            />
                                            <button disabled={actionLoading || otp.length < 6} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center min-w-[140px]">
                                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Save"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Password */}
                <div className="p-4 rounded-xl hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => { setActiveSection(activeSection === 'password' ? null : 'password'); clearMessages(); }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <Key className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Password</p>
                                <p className="text-sm text-neutral-400">••••••••</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-purple-400 hover:text-purple-300 px-3 py-1 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                            {activeSection === 'password' ? 'Cancel' : 'Change'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {activeSection === 'password' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleUpdatePassword} className="pt-6 pb-2 px-2 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button disabled={actionLoading} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center min-w-[140px]">
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Trusted Devices Section */}
                <div className="mt-8 px-4 pb-2 border-t border-neutral-800 pt-6 flex items-center justify-between">
                    <h4 className="text-lg font-medium text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-neutral-400" />
                        Trusted Devices
                    </h4>
                    {admin.devices.length > 1 && (
                        <button onClick={handleRevokeOtherDevices} disabled={actionLoading} className="text-sm font-medium text-red-400 hover:text-red-300 px-3 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2">
                            <X className="w-4 h-4" /> Revoke Others
                        </button>
                    )}
                </div>

                <div className="px-4 space-y-3 pb-6">
                    {admin.devices.map(device => (
                        <div key={device.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 p-4 rounded-xl">
                            <div>
                                <p className="text-white font-medium">{device.deviceName}</p>
                                <div className="flex gap-4 text-xs text-neutral-500 mt-1 mt-1">
                                    <span>OS: {device.userAgent?.substring(0, 30) || 'Unknown'}...</span>
                                    <span>IP: {device.ipAddress || 'Unknown'}</span>
                                    <span>Last: {new Date(device.lastUsedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRevokeDevice(device.id)}
                                disabled={actionLoading}
                                title="Revoke Trust"
                                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {admin.devices.length === 0 && (
                        <div className="text-center p-6 text-sm text-neutral-500">
                            No trusted devices found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
