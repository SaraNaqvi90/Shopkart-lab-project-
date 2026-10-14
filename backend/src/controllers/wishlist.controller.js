const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');

// req.user is set by authMiddleware to the FULL Mongoose user document
// (not a plain object) — so calling .save() on it directly, after
// mutating an array field, persists the change. We never take the user
// id from the request body/params; it only ever comes from the
// authenticated session (the JWT cookie), exactly as the lab requires.

async function addToWishlist(req, res) {
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

        const alreadySaved = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadySaved) {
            return res.status(409).json({
                message: "Product already in wishlist"
            });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function getWishlist(req, res) {
    try {
        // Re-fetch (rather than reuse req.user) so populate() has a fresh
        // query to attach to — req.user was already hydrated without it.
        const user = await userModel.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price category image stock',
        });

        return res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const user = req.user;

        const exists = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                message: "Product not in wishlist"
            });
        }

        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};
