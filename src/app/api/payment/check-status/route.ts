import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPay0Status } from "@/lib/pay0";
// Re-use logic. In a real app, refactor logic to service layer.
// For now, duplicate or keep simple.

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        const order = await prisma.order.findUnique({
            where: { orderId: orderId },
        });

        if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (order.status === "SUCCESS") {
            return NextResponse.json({ status: "SUCCESS", licenseKey: order.licenseKey });
        }

        // Call upstream to check
        const pay0Data = await checkPay0Status(orderId);

        // Check if upstream says success but we haven't processed it
        if (pay0Data.status === "TXN_SUCCESS" || pay0Data.status === "success") {
            // Trigger verification logic using internal API or direct call
            // Here we just return the status to frontend so frontend can trigger a refresh or user waits
            // Ideally, this endpoint would also update the DB like the webhook does.

            return NextResponse.json({ status: "PAID_WAITING_WEBHOOK" });
        }

        return NextResponse.json({ status: order.status });
    } catch (error) {
        return NextResponse.json({ error: "Error checking status" }, { status: 500 });
    }
}
