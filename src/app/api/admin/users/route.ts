import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { orders: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name || "N/A",
            mobile: user.mobile || "N/A",
            totalOrders: user._count.orders,
            joinedAt: user.createdAt,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
