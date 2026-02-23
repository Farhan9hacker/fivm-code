"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
}

interface LicenseKey {
    id: number;
    key: string;
    productId: number;
    isUsed: boolean;
    createdAt: string;
    product: { name: string };
}

export default function AdminLicenses() {
    const [products, setProducts] = useState<Product[]>([]);
    const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [keys, setKeys] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Editing State
    const [editingKeyId, setEditingKeyId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const fetchProducts = () => {
        axios.get("/api/admin/products").then((res) => setProducts(res.data));
    };

    const fetchKeys = (productId?: string) => {
        setLoading(true);
        const url = productId ? `/api/admin/licenses?productId=${productId}` : "/api/admin/licenses";
        axios.get(url)
            .then((res) => setLicenseKeys(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
        fetchKeys();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("Uploading...");
        try {
            const res = await axios.post("/api/admin/licenses", {
                productId: selectedProduct,
                keys: keys,
            });
            setMessage(`Success! Added ${res.data.added} keys. New Stock: ${res.data.newStock}`);
            setKeys("");
            fetchKeys(selectedProduct);
        } catch (err) {
            setMessage("Error uploading keys");
        }
    };

    const handleDeleteKey = async (id: number) => {
        if (!confirm("Are you sure you want to delete this key? This will update product stock.")) return;
        try {
            await axios.delete(`/api/admin/licenses/${id}`);
            setLicenseKeys(keys => keys.filter(k => k.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const startEditing = (license: LicenseKey) => {
        setEditingKeyId(license.id);
        setEditValue(license.key);
    };

    const handleUpdateKey = async (id: number) => {
        try {
            await axios.put(`/api/admin/licenses/${id}`, { key: editValue });
            setLicenseKeys(prev => prev.map(k => k.id === id ? { ...k, key: editValue } : k));
            setEditingKeyId(null);
        } catch (err) {
            alert("Update failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">License Manager</h1>
                <Link href="/admin/dashboard" className="text-violet-400 hover:text-violet-300">← Back</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-4">Bulk Upload</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-xs font-bold text-slate-400 uppercase">Product</label>
                            <select
                                className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none focus:border-violet-500"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                required
                            >
                                <option value="">-- Select Product --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 text-xs font-bold text-slate-400 uppercase">Keys (One per line)</label>
                            <textarea
                                className="w-full h-32 p-3 bg-slate-700 rounded border border-slate-600 font-mono text-sm focus:outline-none focus:border-violet-500"
                                placeholder="XXXXX-XXXXX&#10;YYYYY-YYYYY"
                                value={keys}
                                onChange={(e) => setKeys(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-violet-600 rounded font-bold hover:bg-violet-500 transition shadow-lg shadow-violet-900/20"
                        >
                            Upload Keys
                        </button>

                        {message && <p className="text-center mt-2 text-emerald-400 text-sm font-medium">{message}</p>}
                    </form>
                </div>

                {/* Keys List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-bold">Active Licenses</h2>
                        <select
                            className="bg-slate-700 p-1.5 rounded text-xs border border-slate-600"
                            onChange={(e) => fetchKeys(e.target.value)}
                        >
                            <option value="">All Products</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-700 text-slate-300 uppercase text-[10px] font-black tracking-wider">
                                    <tr>
                                        <th className="p-3">Product</th>
                                        <th className="p-3">License Code</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 italic">Finding keys...</td></tr>
                                    ) : licenseKeys.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 italic">No keys found.</td></tr>
                                    ) : (
                                        licenseKeys.map(lk => (
                                            <tr key={lk.id} className="hover:bg-slate-750 transition-colors">
                                                <td className="p-3">
                                                    <span className="font-semibold text-slate-300">{lk.product?.name}</span>
                                                    <div className="text-[10px] text-slate-500">{new Date(lk.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-3">
                                                    {editingKeyId === lk.id ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="bg-slate-900 border border-violet-500 rounded px-2 py-1 text-xs w-full focus:outline-none"
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleUpdateKey(lk.id)} className="text-emerald-400 font-bold text-xs uppercase">Save</button>
                                                            <button onClick={() => setEditingKeyId(null)} className="text-slate-400 font-bold text-xs uppercase">X</button>
                                                        </div>
                                                    ) : (
                                                        <code className="text-violet-400 font-mono bg-violet-400/5 px-2 py-1 rounded select-all">{lk.key}</code>
                                                    )}
                                                </td>
                                                <td className="p-3 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold ${lk.isUsed ? 'bg-amber-400/10 text-amber-500' : 'bg-emerald-400/10 text-emerald-500'}`}>
                                                        {lk.isUsed ? "SOLD" : "AVAILABLE"}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => startEditing(lk)}
                                                            className="text-blue-400 hover:text-blue-300 disabled:opacity-30"
                                                            disabled={lk.isUsed || editingKeyId !== null}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteKey(lk.id)}
                                                            className="text-red-400 hover:text-red-300 disabled:opacity-30"
                                                            disabled={lk.isUsed}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
