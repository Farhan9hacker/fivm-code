import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    try {
        const keys = await prisma.licenseKey.findMany({
            where: productId ? { productId: parseInt(productId) } : {},
            orderBy: { createdAt: "desc" },
            include: { product: { select: { name: true } } }
        });
        return NextResponse.json(keys);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { productId, keys } = body; // keys: string[] or string (newline separated)

        let keyList: string[] = [];
        if (Array.isArray(keys)) keyList = keys;
        else if (typeof keys === "string") keyList = keys.split(/\r?\n/).filter(k => k.trim());

        if (!keyList.length) return NextResponse.json({ error: "No keys provided" }, { status: 400 });

        const productIdInt = parseInt(productId);

        // Create many licenses
        // Note: createMany is not supported in SQLite, but this is MySQL so it works.
        // However, if one key is duplicate, it might fail.
        // Better to loop or use skipDuplicates if supported (Prisma createMany supports skipDuplicates in recent versions)

        const result = await prisma.licenseKey.createMany({
            data: keyList.map(k => ({
                key: k.trim(),
                productId: productIdInt,
                isUsed: false
            })),
            skipDuplicates: true,
        });

        // Update product stock count
        // Optional: Recalculate stock
        // await prisma.product.update({ where: { id: productIdInt }, data: { stock: { increment: result.count } }})
        // But better to just set stock to count of unused keys

        const count = await prisma.licenseKey.count({
            where: { productId: productIdInt, isUsed: false }
        });

        await prisma.product.update({
            where: { id: productIdInt },
            data: { stock: count }
        });

        return NextResponse.json({ added: result.count, newStock: count });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
