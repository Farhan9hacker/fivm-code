import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPay0Order } from "@/lib/pay0";
import { z } from "zod";

const createOrderSchema = z.object({
    productId: z.number(),
    customerName: z.string().min(1),
    customerMobile: z.string().min(10),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, customerName, customerMobile } = createOrderSchema.parse(body);

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product || !product.status || product.stock <= 0) {
            return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
        }

        // Create pending order
        const orderId = `OID${Date.now()}`; // Simple ID generation

        // Check if user exists or create (optional based on requirements)
        let user = await prisma.user.findFirst({ where: { mobile: customerMobile } });
        if (!user) {
            user = await prisma.user.create({
                data: { mobile: customerMobile, name: customerName }
            });
        }

        const order = await prisma.order.create({
            data: {
                orderId: orderId,
                amount: product.price,
                productId: product.id,
                userId: user.id,
                status: "PENDING",
            },
        });

        // Call Pay0
        const paymentResponse = await createPay0Order({
            customer_mobile: customerMobile,
            customer_name: customerName,
            amount: product.price,
            order_id: orderId,
            redirect_url: `${process.env.NEXTAUTH_URL}/order-success/${orderId}`, // NOTE: Pay0 might override this or use it
            remark1: product.id.toString(),
            remark2: order.id.toString(),
        });

        // Assuming paymentResponse contains the payment_url
        // Adjust based on actual Pay0 response structure.
        // Usually: { status: true, payment_url: "..." }

        if (paymentResponse?.status === true || paymentResponse?.payment_url) {
            return NextResponse.json({ paymentUrl: paymentResponse.payment_url || paymentResponse.data?.payment_url });
        } else {
            return NextResponse.json({ error: "Payment gateway error" }, { status: 502 });
        }

    } catch (error) {
        console.error("Create Order API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
