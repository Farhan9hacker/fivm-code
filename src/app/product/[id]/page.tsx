import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
        notFound();
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row">

                {/* Visual Side */}
                <div className="md:w-1/2 bg-slate-700 flex items-center justify-center p-10 min-h-[300px] overflow-hidden">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl shadow-2xl"
                        />
                    ) : (
                        <span className="text-9xl animate-pulse">🎁</span>
                    )}
                </div>

                {/* Content Side */}
                <div className="md:w-1/2 p-10 space-y-6 flex flex-col justify-center">
                    <Link href="/" className="text-slate-400 hover:text-white mb-4 block">← Back to Store</Link>

                    <h1 className="text-4xl font-extrabold">{product.name}</h1>

                    <p className="text-slate-300 text-lg leading-relaxed">
                        {product.description || "No description available for this product."}
                    </p>

                    <div className="py-6 border-t border-b border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">Price</span>
                            <span className="text-3xl font-bold text-emerald-400">₹{product.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Availability</span>
                            <span className={product.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                                {product.stock > 0 ? `${product.stock} In Stock` : "Sold Out"}
                            </span>
                        </div>
                    </div>

                    {product.stock > 0 ? (
                        <Link
                            href={`/checkout/${product.id}`}
                            className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-violet-600/30"
                        >
                            Buy Now Instant
                        </Link>
                    ) : (
                        <button disabled className="w-full bg-slate-600 text-slate-400 cursor-not-allowed font-bold py-4 rounded-xl">
                            Out of Stock
                        </button>
                    )}

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Automatic delivery via email and screen immediately after payment.
                    </p>
                </div>
            </div>
        </div>
    );
}
