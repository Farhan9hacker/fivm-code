import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Revalidate every minute or use dynamic
export const revalidate = 60;

async function getProducts() {
    return await prisma.product.findMany({
        where: { status: true },
        orderBy: { createdAt: "desc" },
    });
}

export default async function Home() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-slate-900 text-white pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative z-10 text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-emerald-400">
                        PRIMEX STORE
                    </h1>
                    <p className="text-xl text-slate-300">Premium Digital Keys & Activations</p>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 mt-16">
                <h2 className="text-3xl font-bold mb-8 border-l-4 border-violet-500 pl-4">Latest Arrivals</h2>

                {products.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">No products available at the moment.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Link href={`/product/${product.id}`} key={product.id} className="group">
                                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-violet-500 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 transform hover:-translate-y-1">
                                    <div className="h-48 bg-slate-700 relative overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-4xl text-slate-500">🎮</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <h3 className="text-xl font-bold group-hover:text-violet-400 transition">{product.name}</h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-2xl font-bold text-emerald-400">₹{product.price}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {product.stock > 0 ? 'INSTANT DELIVERY' : 'OUT OF STOCK'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
