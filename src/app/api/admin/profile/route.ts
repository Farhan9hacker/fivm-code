import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // @ts-ignore
    const adminId = parseInt(session.user.id);

    try {
        const body = await req.json();
        const { username, password } = body;

        const updateData: any = {};
        if (username) updateData.username = username;
        if (password) {
            updateData.passwordHash = await hash(password, 10);
        }

        const admin = await prisma.admin.update({
            where: { id: adminId },
            data: updateData,
        });

        return NextResponse.json({ success: true, username: admin.username });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
