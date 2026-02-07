import axios from "axios";

const PAY0_API_URL = process.env.PAY0_API_URL || "https://pay0.shop/api";
const PAY0_API_KEY = process.env.PAY0_API_KEY!; // API Key or User Token

interface CreateOrderParams {
    customer_mobile: string;
    customer_name: string;
    amount: number;
    order_id: string;
    redirect_url: string;
    remark1: string; // productId
    remark2: string; // internalOrderId (same as order_id usually)
}

export async function createPay0Order(params: CreateOrderParams) {
    try {
        const payload = {
            ...params,
            user_token: PAY0_API_KEY,
        };

        const response = await axios.post(`${PAY0_API_URL}/create-order`, payload);
        return response.data;
    } catch (error: any) {
        console.error("Pay0 Create Order Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Payment initiation failed");
    }
}

export async function checkPay0Status(order_id: string) {
    try {
        const response = await axios.post(`${PAY0_API_URL}/check-order-status`, {
            order_id,
            user_token: PAY0_API_KEY,
        });
        return response.data;
    } catch (error: any) {
        console.error("Pay0 Check Status Error:", error.response?.data || error.message);
        throw new Error("Failed to check status");
    }
}
