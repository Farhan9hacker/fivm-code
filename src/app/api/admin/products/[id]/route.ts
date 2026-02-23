import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const product = await prisma.product.update({
            where: { id: parseInt(params.id) },
            data: {
                name: body.name,
                description: body.description,
                image: body.image || null,
                price: parseFloat(body.price),
                stock: parseInt(body.stock),
                status: body.status,
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = parseInt(params.id);

    try {
        // 1. Check if product has any successful orders
        const orderCount = await prisma.order.count({
            where: { productId: productId }
        });

        if (orderCount > 0) {
            return NextResponse.json({
                error: "Cannot delete product with existing orders. Please deactivate it instead."
            }, { status: 400 });
        }

        // 2. Delete all associated license keys first
        await prisma.licenseKey.deleteMany({
            where: { productId: productId }
        });

        // 3. Delete the product
        await prisma.product.delete({
            where: { id: productId },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Product Error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
    }
}
