"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
}

export default function AdminLicenses() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [keys, setKeys] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("/api/admin/products").then((res) => setProducts(res.data));
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
        } catch (err) {
            setMessage("Error uploading keys");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">License Manager</h1>
                <Link href="/admin/dashboard" className="text-violet-400 hover:text-violet-300">← Back</Link>
            </div>

            <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-6">Bulk Upload Keys</h2>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Select Product</label>
                        <select
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
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
                        <label className="block mb-2 text-sm font-medium">License Keys (One per line)</label>
                        <textarea
                            className="w-full h-48 p-3 bg-slate-700 rounded border border-slate-600 font-mono text-sm"
                            placeholder="XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY"
                            value={keys}
                            onChange={(e) => setKeys(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-violet-600 rounded font-bold hover:bg-violet-500 transition"
                    >
                        Upload Keys
                    </button>

                    {message && <p className="text-center mt-4 text-emerald-400 font-medium">{message}</p>}
                </form>
            </div>
        </div>
    );
}
