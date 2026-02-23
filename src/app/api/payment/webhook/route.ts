import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // 1. Receives asynchronous notification from Pay0 server (FormData)
        const formData = await req.formData();

        const order_id = formData.get("order_id")?.toString();
        const status = formData.get("status")?.toString(); // "success", "failure", etc.
        const utr = formData.get("utr")?.toString();
        const amount_str = formData.get("amount")?.toString();

        console.log("Pay0 Webhook Received:", { order_id, status, utr, amount: amount_str });

        if (!order_id) {
            return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
        }

        // 2. Validates order_id and existing payment status
        const payment = await prisma.payment.findUnique({
            where: { orderId: order_id },
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        if (payment.status !== "PENDING") {
            return NextResponse.json({ message: "Already processed" });
        }

        // 3. If status is success
        if (status === "success" || status === "TXN_SUCCESS") {
            await prisma.$transaction(async (tx) => {
                // - Marks payment as APPROVED
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: "APPROVED",
                        utr: utr || null
                    },
                });

                // - Updates user wallet balance
                await tx.user.update({
                    where: { id: payment.userId },
                    data: { walletBalance: { increment: payment.amount } }
                });

                // - Logs the transaction
                await tx.walletTransaction.create({
                    data: {
                        userId: payment.userId,
                        amount: payment.amount,
                        type: "DEPOSIT",
                        remark: `Wallet recharge via Pay0 Webhook (${order_id})`
                    }
                });
            });

            return NextResponse.json({ message: "Success" });
        } else if (status === "failure" || status === "failed") {
            // 4. If status is failure/failed
            // - Marks payment as REJECTED
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "REJECTED" }
            });
            return NextResponse.json({ message: "Rejected" });
        }

        return NextResponse.json({ message: "Status ignored" });

    } catch (error: any) {
        console.error("Webhook Error:", error?.message || error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
