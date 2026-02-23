import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPay0Status } from "@/lib/pay0";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // 1. Validates session and order_id
        const session = await getServerSession(authOptions);
        const { orderId } = await req.json();

        const payment = await prisma.payment.findUnique({
            where: { orderId: orderId },
            include: { user: true },
        });

        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        if (payment.status === "APPROVED") {
            return NextResponse.json({ status: "APPROVED", balance: payment.user.walletBalance });
        }

        // 2. Calls Pay0 /api/check-order-status to verify payment success
        const pay0Data = await checkPay0Status(orderId);

        // 3. If status is SUCCESS (or TXN_SUCCESS)
        if (pay0Data.status === "success" || pay0Data.status === "TXN_SUCCESS") {
            // Check if already approved (race condition with webhook)
            const updatedPayment = await prisma.$transaction(async (tx) => {
                const currentPayment = await tx.payment.findUnique({
                    where: { id: payment.id }
                });

                if (currentPayment?.status === "APPROVED") return currentPayment;

                // - Updates payment status to APPROVED
                const up = await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: "APPROVED",
                        utr: pay0Data.utr || pay0Data.data?.utr || null
                    },
                });

                // - Increments user's wallet balance
                await tx.user.update({
                    where: { id: payment.userId },
                    data: { walletBalance: { increment: payment.amount } }
                });

                // - Creates a WalletTransaction log (DEPOSIT)
                await tx.walletTransaction.create({
                    data: {
                        userId: payment.userId,
                        amount: payment.amount,
                        type: "DEPOSIT",
                        remark: `Wallet recharge via Pay0 (${orderId})`
                    }
                });

                return up;
            });

            return NextResponse.json({ status: "APPROVED" });
        }

        return NextResponse.json({ status: payment.status });
    } catch (error: any) {
        console.error("Check Status API Error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Error checking status" }, { status: 500 });
    }
}
