"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    stock: number;
    logicalStock?: number; // Added to handle the API response
    status: boolean;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", image: "", price: "", stock: "0" });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

    const handleSyncStock = async (productId: number) => {
        setSyncing(productId);
        try {
            await axios.patch("/api/admin/products", { productId, action: "sync_stock" });
            fetchProducts();
        } catch (err) {
            console.error("Sync failed:", err);
            alert("Stock sync failed");
        } finally {
            setSyncing(null);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            await axios.put(`/api/admin/products/${editingProduct.id}`, formData);
            setEditingProduct(null);
        } else {
            await axios.post("/api/admin/products", formData);
        }

        setFormData({ name: "", description: "", image: "", price: "", stock: "0" });
        fetchProducts();
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || "",
            image: product.image || "",
            price: product.price.toString(),
            stock: product.stock.toString()
        });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData({ name: "", description: "", image: "", price: "", stock: "0" });
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
                    <h2 className="text-xl font-bold mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            type="text"
                            placeholder="Image URL (e.g., https://example.com/image.jpg)"
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price (INR)"
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-semibold uppercase">Current Stock</label>
                            <input
                                type="number"
                                placeholder="Stock count"
                                className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:border-violet-500"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className={`flex-1 py-2 rounded font-bold ${editingProduct ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
                                {editingProduct ? "Update Product" : "Create Product"}
                            </button>
                            {editingProduct && (
                                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded font-bold">
                                    Cancel
                                </button>
                            )}
                        </div>
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
                                        <div className="flex items-center gap-4">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500">No Img</div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg">{product.name}</h3>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <p className="text-slate-400">Price: <span className="text-emerald-400 font-medium">₹{product.price}</span></p>
                                                    <p className="text-slate-400">Stock (Stored): <span className={product.stock === product.logicalStock ? "text-slate-200" : "text-amber-400"}>{product.stock}</span></p>
                                                    {product.logicalStock !== undefined && (
                                                        <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                                                            <p className="text-slate-400">Keys Available: <span className="text-violet-400 font-bold">{product.logicalStock}</span></p>
                                                            {product.stock !== product.logicalStock && (
                                                                <button
                                                                    onClick={() => handleSyncStock(product.id)}
                                                                    disabled={syncing === product.id}
                                                                    className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded hover:bg-amber-500/40 disabled:opacity-50"
                                                                >
                                                                    {syncing === product.id ? "Syncing..." : "Sync DB"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="px-3 py-1 bg-blue-600/20 text-blue-500 rounded hover:bg-blue-600/40 transition-colors">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="px-3 py-1 bg-red-600/20 text-red-500 rounded hover:bg-red-600/40 transition-colors">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
