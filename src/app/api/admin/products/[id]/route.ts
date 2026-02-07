import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    try {
        await prisma.product.delete({
            where: { id: parseInt(params.id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
