import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to assign license safely
async function assignLicense(orderId: number, productId: number) {
    // Use a transaction/interactive lookup to ensure we don't double assign or overbook
    // Note: Prisma interactive transactions would be ideal here ($transaction)

    return await prisma.$transaction(async (tx) => {
        // 1. Find unused key
        const license = await tx.licenseKey.findFirst({
            where: {
                productId: productId,
                isUsed: false,
            },
        });

        if (!license) {
            throw new Error("OUT_OF_STOCK");
        }

        // 2. Mark as used and link to order
        await tx.licenseKey.update({
            where: { id: license.id },
            data: {
                isUsed: true,
                orderId: orderId,
            },
        });

        // 3. Update order with the key string for easy access
        await tx.order.update({
            where: { id: orderId },
            data: {
                licenseKey: license.key,
                status: "SUCCESS",
            },
        });

        return license.key;
    });
}

export async function POST(req: Request) {
    try {
        // Parse Pay0 Webhook Payload
        // Note: Verify the signature if Pay0 provides one (security).
        // For now, assuming standard payload.
        const body = await req.json();

        /* 
          Pay0 Webhook Format (Example - adjust to actual docs):
          {
            order_id: "OID123...",
            status: "success", // or "TXN_SUCCESS"
            utr: "1234567890",
            amount: 100,
            ...
          }
        */

        // Log the webhook (important for debugging)
        console.log("Pay0 Webhook Received:", body);

        const { order_id, status, utr } = body;

        // Check actual status string from Pay0
        const isSuccess = status === "success" || status === "TXN_SUCCESS"; // Adjust based on Pay0 docs!

        const order = await prisma.order.findUnique({
            where: { orderId: order_id },
            include: { product: true },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status === "SUCCESS") {
            // Already processed
            return NextResponse.json({ message: "Already processed" });
        }

        if (isSuccess) {
            // Update Payment Status
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "PAID",
                    utr: utr,
                },
            });

            // Deliver License
            try {
                await assignLicense(order.id, order.productId);
                // Reduce stock count
                await prisma.product.update({
                    where: { id: order.productId },
                    data: { stock: { decrement: 1 } }
                });

                return NextResponse.json({ message: "Order processed, license assigned" });
            } catch (err: any) {
                if (err.message === "OUT_OF_STOCK") {
                    // Admin alert needed here
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "FAILED_NO_STOCK" }
                    });
                    return NextResponse.json({ error: "Paid but out of stock" }, { status: 200 }); // Return 200 to acknowledge webhook
                }
                throw err;
            }
        } else {
            // Handle failure
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "FAILED", paymentStatus: "FAILED" }
            });
            return NextResponse.json({ message: "Order marked as failed" });
        }

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
