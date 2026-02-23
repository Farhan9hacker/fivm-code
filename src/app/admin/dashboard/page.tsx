"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminDashboard() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-emerald-400">
                    Admin Dashboard
                </h1>
                <div className="flex gap-4 items-center">
                    <span>Welcome, {session?.user?.name}</span>
                    <Link href="/admin/profile" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition">
                        Profile
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/products" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-750 transition border border-slate-700">
                    <h2 className="text-xl font-bold mb-2">🎁 Products</h2>
                    <p className="text-slate-400">Manage products, prices, and stock.</p>
                </Link>

                <Link href="/admin/licenses" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-750 transition border border-slate-700">
                    <h2 className="text-xl font-bold mb-2">🔑 Licenses</h2>
                    <p className="text-slate-400">Upload bulk license keys.</p>
                </Link>

                <Link href="/admin/orders" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-750 transition border border-slate-700">
                    <h2 className="text-xl font-bold mb-2">🛒 Orders</h2>
                    <p className="text-slate-400">View transaction history.</p>
                </Link>

                <Link href="/admin/users" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-750 transition border border-slate-700">
                    <h2 className="text-xl font-bold mb-2">👥 Users</h2>
                    <p className="text-slate-400">View registered users.</p>
                </Link>
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">Quick Stats</h3>
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <p className="text-slate-400">Revenue stats would go here...</p>
                </div>
            </div>
        </div>
    );
}
