const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');

// Re-fetches the user with cart.product populated. Called after every
// mutation so each response hands the frontend a ready-to-render cart
// (with current name/price/image/stock) instead of just a bare ObjectId
// list that would need a second round-trip to display anything useful.
async function getPopulatedCart(userId) {
    const user = await userModel.findById(userId).populate({
        path: 'cart.product',
        select: 'name price category image stock',
    });
    return user.cart;
}

async function addToCart(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const user = req.user;
        const existingItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        // This is the one behaviour that must NOT match wishlist's:
        // wishlist rejects a duplicate add (409); cart embraces it by
        // incrementing the existing row's quantity instead.
        const requestedQuantity = existingItem ? existingItem.quantity + 1 : 1;

        if (requestedQuantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        if (existingItem) {
            existingItem.quantity = requestedQuantity;
        } else {
            user.cart.push({ product: productId, quantity: 1 });
        }

        await user.save();

        const cart = await getPopulatedCart(user._id);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function getCart(req, res) {
    try {
        const cart = await getPopulatedCart(req.user._id);

        return res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function updateQuantity(req, res) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
            return res.status(400).json({
                message: "Quantity must be a number"
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const user = req.user;
        const item = user.cart.find(
            (i) => i.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product not in cart"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        item.quantity = quantity;
        await user.save();

        const cart = await getPopulatedCart(user._id);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const user = req.user;
        const exists = user.cart.some(
            (i) => i.product.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                message: "Product not in cart"
            });
        }

        user.cart = user.cart.filter(
            (i) => i.product.toString() !== productId
        );
        await user.save();

        const cart = await getPopulatedCart(user._id);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
};
