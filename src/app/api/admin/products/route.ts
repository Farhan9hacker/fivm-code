import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const products = await prisma.product.findMany({
        include: {
            _count: {
                select: { licenses: { where: { isUsed: false } } }
            }
        }
    });

    // We return the product but also include a "logicalStock" field for current status
    const productsWithLogicalStock = products.map(p => ({
        ...p,
        logicalStock: p._count.licenses
    }));

    return NextResponse.json(productsWithLogicalStock);
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { productId, action } = body;

        if (action === "sync_stock") {
            const count = await prisma.licenseKey.count({
                where: { productId: productId, isUsed: false }
            });

            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: { stock: count }
            });

            return NextResponse.json(updatedProduct);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const product = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                image: body.image || null,
                price: parseFloat(body.price),
                stock: parseInt(body.stock),
                status: body.status ?? true,
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Creation failed" }, { status: 500 });
    }
}
