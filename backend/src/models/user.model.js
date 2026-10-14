const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    phone: {
        type: String,
        required: true,
    },

    // Lab 4 — stores Product REFERENCES only, never duplicated product data.
    // 'product' (lowercase) matches the name product.model.js actually
    // registers with mongoose.model('product', ...) — ref must match that
    // exact string for populate() to resolve correctly.
    wishlist: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
            },
        ],
        default: [],
    },

    // Lab 5 — same reference idea, but each entry also carries a quantity.
    // Existing users (created before this field existed) still work: Mongoose
    // applies the `default: []` the moment the document is loaded, so
    // user.cart is never undefined even for old documents.
    cart: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            },
        ],
        default: [],
    },
}, {
    timestamps: true
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;