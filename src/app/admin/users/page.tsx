"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns";

interface User {
    id: number;
    name: string;
    mobile: string;
    totalOrders: number;
    joinedAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/admin/users")
            .then((res) => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch users", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-white p-8">Loading users...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-emerald-400">
                    User Management
                </h1>
                <Link href="/admin/dashboard" className="text-violet-400 hover:text-violet-300">← Back to Dashboard</Link>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Mobile</th>
                            <th className="p-4">Orders</th>
                            <th className="p-4">Joined At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-750 transition">
                                <td className="p-4 text-slate-400">#{user.id}</td>
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 font-mono text-slate-400">{user.mobile}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs font-bold">
                                        {user.totalOrders}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">
                                    {format(new Date(user.joinedAt), "PP p")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}
