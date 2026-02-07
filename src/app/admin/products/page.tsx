"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    status: boolean;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: "", description: "", price: "", stock: "0" });

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/admin/products");
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post("/api/admin/products", formData);
        setFormData({ name: "", description: "", price: "", stock: "0" });
        fetchProducts();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        await axios.delete(`/api/admin/products/${id}`);
        fetchProducts();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Product Manager</h1>
                <Link href="/admin/dashboard" className="text-violet-400 hover:text-violet-300">← Back</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-slate-800 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-bold mb-4">Add Product</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price (INR)"
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Initial Stock (0)" // Usually derived from licenses
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                        <button type="submit" className="w-full bg-emerald-600 py-2 rounded font-bold hover:bg-emerald-500">
                            Create Product
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Inventory</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="space-y-4">
                            {products.map((product) => (
                                <div key={product.id} className="bg-slate-800 p-4 rounded flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                        <p className="text-slate-400">Price: ₹{product.price} | Stock: {product.stock}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="px-3 py-1 bg-red-600/20 text-red-500 rounded hover:bg-red-600/40">
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
