"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function OrderSuccess({ params }: { params: { orderId: string } }) {
    const [status, setStatus] = useState("CHECKING");
    const [licenseKey, setLicenseKey] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Poll for status
        const checkStatus = async () => {
            try {
                const res = await axios.post("/api/payment/check-status", { orderId: params.orderId });
                const data = res.data;

                if (data.status === "SUCCESS") {
                    setStatus("SUCCESS");
                    setLicenseKey(data.licenseKey);
                } else if (data.status === "FAILED") {
                    setStatus("FAILED");
                    setError("Payment invalid or cancelled.");
                } else if (data.status === "FAILED_NO_STOCK") {
                    setStatus("FAILED_NO_STOCK");
                    setError("Payment received but product out of stock. Contact admin.");
                } else {
                    // Keep waiting or show pending
                    setStatus("PENDING");
                }
            } catch (err) {
                console.error(err);
            }
        };

        // Initial check
        checkStatus();

        // Polling interval
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [params.orderId]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">

                {status === "SUCCESS" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h1 className="text-3xl font-bold text-emerald-400">Order Successful!</h1>
                        <p className="text-slate-400">Thank you for your purchase. Here is your activation key:</p>

                        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 relative group">
                            <code className="text-2xl font-mono text-violet-400 break-all">{licenseKey}</code>
                            <button
                                onClick={() => navigator.clipboard.writeText(licenseKey)}
                                className="absolute top-2 right-2 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                            >
                                Copy
                            </button>
                        </div>

                        <p className="text-sm text-slate-500">Please save this key securely.</p>

                        <Link href="/" className="inline-block mt-4 text-violet-400 hover:text-white">Buy More</Link>
                    </div>
                )}

                {status === "FAILED" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h1 className="text-3xl font-bold text-red-400">Order Failed</h1>
                        <p className="text-slate-400">{error}</p>
                        <Link href="/" className="inline-block mt-4 bg-slate-700 px-4 py-2 rounded">Return Home</Link>
                    </div>
                )}

                {(status === "PENDING" || status === "CHECKING" || status === "PAID_WAITING_WEBHOOK") && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <span className="text-4xl">⏳</span>
                        </div>
                        <h1 className="text-2xl font-bold text-blue-400">Verifying Payment...</h1>
                        <p className="text-slate-400">Please wait while we confirm your transaction. Do not close this window.</p>
                    </div>
                )}

                {status === "FAILED_NO_STOCK" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-yellow-400">Order Pending (Out of Stock)</h1>
                        <p className="text-slate-400">{error}</p>
                        <p className="text-sm">Please start a ticket with your Order ID: <span className="font-mono">{params.orderId}</span></p>
                    </div>
                )}

            </div>
        </div>
    );
}
