"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CheckoutPage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        mobile: "",
    });

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/payment/create-order", {
                productId: parseInt(params.id),
                customerName: form.name,
                customerMobile: form.mobile,
            });

            if (response.data.paymentUrl) {
                // Redirect to Pay0
                window.location.href = response.data.paymentUrl;
            } else {
                setError("Failed to get payment URL. Please try again.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Payment initialisation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl">
                <h1 className="text-2xl font-bold mb-6 text-center">Secure Checkout</h1>

                <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Your Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Mobile Number</label>
                        <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition"
                            placeholder="10-digit mobile number"
                            value={form.mobile}
                            onChange={e => setForm({ ...form, mobile: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Order details will be sent to this number.</p>
                    </div>

                    {error && <div className="p-3 bg-red-500/20 text-red-300 rounded text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : "Pay Securely"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-500 mt-6">
                    🔒 Secured by Pay0.shop Gateway
                </p>
            </div>
        </div>
    );
}
