const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpay = require('../config/razorpay');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');

const ADDRESS_FIELDS = [
    ['fullName', 'Full name'],
    ['phone', 'Phone number'],
    ['addressLine1', 'Address'],
    ['city', 'City'],
    ['state', 'State'],
    ['pincode', 'Pincode'],
];

function validateShippingAddress(address) {
    if (!address || typeof address !== 'object') {
        return { error: 'Shipping address is required' };
    }

    const cleaned = {};

    for (const [field, label] of ADDRESS_FIELDS) {
        const raw = address[field];
        const value = typeof raw === 'number' ? String(raw) : raw;

        if (typeof value !== 'string' || value.trim().length === 0) {
            return { error: `${label} is required` };
        }
        cleaned[field] = value.trim();
    }

       if (!/^\d{6,15}$/.test(cleaned.phone)) {
        return { error: 'Enter a valid phone number (digits only)' };
    }
    if (!/^\d{6}$/.test(cleaned.pincode)) {
        return { error: 'Enter a valid 6-digit pincode' };
    }

    return { cleaned };
}

async function createPaymentOrder(req, res) {
    try {
        
        const { error, cleaned } = validateShippingAddress(req.body.shippingAddress);
        if (error) {
            return res.status(400).json({ message: error });
        }

      
        const user = req.user;
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

      
        const productIds = user.cart.map((item) => item.product);
        const products = await productModel.find({ _id: { $in: productIds } });
        const productById = new Map(products.map((p) => [p._id.toString(), p]));

        
        const items = [];
        let totalAmount = 0;

        for (const cartItem of user.cart) {
            const product = productById.get(cartItem.product.toString());

            if (!product) {
                return res.status(400).json({
                    message: 'A product in your cart is no longer available',
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}.`,
                });
            }

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image,
            });

            totalAmount += product.price * cartItem.quantity;
        }

        totalAmount = Math.round(totalAmount * 100) / 100; // tidy floating-point noise

        //  Save our order first, as unpaid
        const order = await orderModel.create({
            user: user._id,
            items,
            shippingAddress: cleaned,
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT',
        });

        // Ask Razorpay to create the matching payment order (amount in PAISE)
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                receipt: order._id.toString(),
            });
        } catch (gatewayError) {
            // Log the real reason
            console.error(
                'Razorpay order creation failed:',
                gatewayError?.error?.description ?? gatewayError.message
            );
            // Don't leave an order behind that can never be paid. Cart is untouched.
            await orderModel.findByIdAndDelete(order._id);
            return res.status(502).json({
                message: 'Unable to start payment right now. Please try again.',
            });
        }

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        
        // The Key ID is public. The Key Secret is never sent.
        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function verifyPayment(req, res) {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

    
        const order = await orderModel.findOne({
            _id: shopKartOrderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Already processed, Repeat the answer
        
        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                order,
            });
        }

        // The id the browser sent must be the id WE stored for this order.
        if (!order.razorpayOrderId || razorpay_order_id !== order.razorpayOrderId) {
            return res.status(400).json({ message: 'Payment does not match this order' });
        }

        // Recompute the signature. The order id comes from OUR database.
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(order.razorpayOrderId + '|' + razorpay_payment_id)
            .digest('hex');

        // Timing-safe comparison. timingSafeEqual needs Buffers of equal length.
        const expectedBuffer = Buffer.from(expectedSignature);
        const receivedBuffer = Buffer.from(String(razorpay_signature));

        const signatureIsValid =
            expectedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

        if (!signatureIsValid) {
            // Nothing changes: order stays unpaid, cart stays full.
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Signature is genuine. "Claim" the order atomically: this update only
        // matches if the order is not PAID yet, so if two verify requests
        // arrive at the same moment, only ONE of them gets to do the work below.
        const paidOrder = await orderModel.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $ne: 'PAID' } },
            {
                paymentStatus: 'PAID',
                status: 'PLACED',
                razorpayPaymentId: razorpay_payment_id,
            },
            { new: true }
        );

        if (!paidOrder) {
            const existing = await orderModel.findById(order._id);
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                order: existing,
            });
        }

        // Reduce stock. One atomic update per product: "only subtract if there
        // is enough". If it ever fails the customer has already paid, so we
        // log it loudly instead of failing the request.
        for (const item of paidOrder.items) {
            const result = await productModel.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );

            if (result.modifiedCount === 0) {
                console.warn(
                    `Stock could not be reduced for product ${item.product} on order ${paidOrder._id}`
                );
            }
        }

        // Clear the cart LAST, only now that the payment is proven.
        req.user.cart = [];
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: 'Payment verified',
            order: paidOrder,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function getMyOrders(req, res) {
    try {
        // Only PAID orders: abandoned payments (PENDING_PAYMENT) are not
        // real orders and would just clutter the list.
        const orders = await orderModel
            .find({ user: req.user._id, paymentStatus: 'PAID' })
            .sort({ createdAt: -1 }); // newest first

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function getOrderById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await orderModel.findOne({ _id: id, user: req.user._id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ success: true, order });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Allowed order of progression. A status can only move ONE step forward.
const STATUS_FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        if (!STATUS_FLOW.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${STATUS_FLOW.join(', ')}`,
            });
        }

        const order = await orderModel.findOne({ _id: id, user: req.user._id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus !== 'PAID') {
            return res.status(400).json({ message: 'This order has not been paid' });
        }

        const currentIndex = STATUS_FLOW.indexOf(order.status);
        const requestedIndex = STATUS_FLOW.indexOf(status);

        if (requestedIndex !== currentIndex + 1) {
            return res.status(400).json({
                message: `Cannot move an order from ${order.status} to ${status}`,
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({ success: true, order });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
};
