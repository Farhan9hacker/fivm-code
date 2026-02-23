import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPay0Order } from "@/lib/pay0";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createOrderSchema = z.union([
    z.object({
        amount: z.number().positive(),
        productId: z.number().optional(),
        customerMobile: z.string().min(10),
        remark: z.string().optional(),
    }),
    z.object({
        amount: z.number().positive().optional(),
        productId: z.number().positive(),
        customerMobile: z.string().min(10),
        remark: z.string().optional(),
    })
]);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Create Order Request Body:", body);

        const parsed = createOrderSchema.parse(body);
        const manualAmount = parsed.amount;
        const productId = parsed.productId;
        const customerMobile = parsed.customerMobile;
        const remark = parsed.remark;

        let finalAmount = manualAmount;

        // If productId is provided, fetch product and its price
        if (productId) {
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });
            if (!product) {
                return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }
            finalAmount = product.price;
        }

        if (!finalAmount) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Find or Create user based on mobile
        let user = await prisma.user.findFirst({ where: { mobile: customerMobile } });
        if (!user) {
            user = await prisma.user.create({
                data: { mobile: customerMobile, name: "Customer" }
            });
        }

        const orderId = `PAY${Date.now()}`;

        // 2. Creates a PENDING payment record in the Payment table
        const payment = await prisma.payment.create({
            data: {
                orderId: orderId,
                amount: finalAmount,
                userId: user.id,
                status: "PENDING",
                remark: remark || (productId ? `Purchase: ${productId}` : "Wallet Recharge"),
            },
        });

        console.log("Calling Pay0 API with:", { finalAmount, customerMobile, orderId });
        // 3. Initializes CreateOrderSDK and prepares payload. 
        // 4. Calls Pay0 API to get a payment_url.
        const paymentResponse = await createPay0Order({
            customer_mobile: customerMobile,
            amount: finalAmount,
            order_id: orderId,
            redirect_url: `${process.env.NEXTAUTH_URL}/order-success/${orderId}`,
            remark1: "Wallet Recharge",
            remark2: user.id.toString(),
        });

        // 5. Updates gatewayOrderId in the database
        if (paymentResponse?.status === true || paymentResponse?.payment_url) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    gatewayOrderId: paymentResponse.data?.order_id || paymentResponse.order_id || null
                }
            });

            console.log("Pay0 Success Response:", paymentResponse);
            // 6. Returns payment_url to the frontend
            return NextResponse.json({
                payment_url: paymentResponse.result?.payment_url || paymentResponse.payment_url || paymentResponse.data?.payment_url
            });
        } else {
            console.log("Pay0 Failure Response:", paymentResponse);
            return NextResponse.json({ error: "Payment gateway error" }, { status: 502 });
        }

    } catch (error: any) {
        console.error("Create Order API Error:", error?.message || error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}
