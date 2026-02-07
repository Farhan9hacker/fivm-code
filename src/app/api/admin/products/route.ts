import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    // Transform to include stock count based on licenses if needed, 
    // currently `stock` field is separate in Product model (manual control or sync?)
    // The schema says `stock Int`. But logical stock is count of unused licenses. 
    // Let's assume we sync them or just return both.

    return NextResponse.json(products);
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
