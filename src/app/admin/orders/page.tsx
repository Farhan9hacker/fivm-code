"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns"; // Assume date-fns calls, or use native Intl

// Note: Requires API endpoint for GET /api/admin/orders
// I haven't created that backend API yet explicitly in the plan, but I'll assume I can or I should quickly create it.
// I'll assume I missed it in backend step and create the file next.
// But first, let's write the UI.

interface Order {
    id: number;
    orderId: string;
    amount: number;
    status: string;
    paymentStatus: string | null;
    createdAt: string;
    user: { mobile: string; name: string | null } | null;
    product: { name: string };
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // I need to implement this API endpoint
        axios.get("/api/admin/orders")
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Order History</h1>
                <Link href="/admin/dashboard" className="text-violet-400 hover:text-violet-300">← Back to Dashboard</Link>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-750 transition">
                                        <td className="p-4 font-mono text-sm">{order.orderId}</td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-sm">{order.user?.name || "Guest"}</div>
                                            <div className="text-xs text-slate-500">{order.user?.mobile}</div>
                                        </td>
                                        <td className="p-4 text-sm">{order.product.name}</td>
                                        <td className="p-4 font-bold text-emerald-400">₹{order.amount}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs">
                                            {order.paymentStatus || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
