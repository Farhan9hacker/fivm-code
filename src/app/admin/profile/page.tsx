"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminProfile() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await axios.put("/api/admin/profile", formData);
            setStatus({ message: "Profile updated successfully! redirecting...", type: "success" });

            setTimeout(() => {
                signOut({ callbackUrl: "/admin/login" });
            }, 2000);
        } catch (err) {
            setStatus({ message: "Failed to update profile.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-emerald-400">
                        Edit Profile
                    </h1>
                    <Link href="/admin/dashboard" className="text-violet-400 hover:text-violet-300 text-sm">← Back</Link>
                </div>

                {status && (
                    <div className={`p-4 mb-6 rounded ${status.type === "success" ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 mb-2 text-sm uppercase font-bold tracking-wider">New Username</label>
                        <input
                            type="text"
                            placeholder="Leave blank to keep current"
                            className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-violet-500 outline-none transition"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2 text-sm uppercase font-bold tracking-wider">New Password</label>
                        <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-violet-500 outline-none transition"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-lg font-bold transition disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                        Updating your profile will log you out.
                    </p>
                </form>
            </div>
        </div>
    );
}
