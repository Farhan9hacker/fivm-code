import axios from "axios";

const PAY0_API_URL = "https://pay0.shop/api";
const PAY0_USER_TOKEN = "07425ebf8a7d5ce54914312dbc075c98";

interface CreateOrderParams {
    customer_mobile: string;
    amount: number;
    order_id: string; // Internal Order ID
    redirect_url: string;
    remark1: string; // Description
    remark2: string; // Metadata (e.g. User ID)
}

export async function createPay0Order(params: CreateOrderParams) {
    try {
        const formData = new URLSearchParams();
        formData.append("user_token", PAY0_USER_TOKEN);
        formData.append("customer_mobile", params.customer_mobile);
        formData.append("amount", params.amount.toString());
        formData.append("order_id", params.order_id);
        formData.append("redirect_url", params.redirect_url);
        formData.append("remark1", params.remark1);
        formData.append("remark2", params.remark2);

        const response = await axios.post(`${PAY0_API_URL}/create-order`, formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data;
    } catch (error: any) {
        console.error("Pay0 Create Order Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Payment initiation failed");
    }
}

export async function checkPay0Status(order_id: string) {
    try {
        const formData = new URLSearchParams();
        formData.append("user_token", PAY0_USER_TOKEN);
        formData.append("order_id", order_id);

        const response = await axios.post(`${PAY0_API_URL}/check-order-status`, formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Pay0 Check Status Error:", error.response?.data || error.message);
        throw new Error("Failed to check status");
    }
}
