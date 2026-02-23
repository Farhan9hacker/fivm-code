import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function updateProductStock(productId: number) {
    const count = await prisma.licenseKey.count({
        where: { productId: productId, isUsed: false }
    });
    await prisma.product.update({
        where: { id: productId },
        data: { stock: count }
    });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { key } = body;

        const updatedKey = await prisma.licenseKey.update({
            where: { id: parseInt(params.id) },
            data: { key: key.trim() }
        });

        return NextResponse.json(updatedKey);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const licenseId = parseInt(params.id);
        const license = await prisma.licenseKey.findUnique({ where: { id: licenseId } });

        if (!license) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await prisma.licenseKey.delete({
            where: { id: licenseId }
        });

        // Recalculate stock
        await updateProductStock(license.productId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
