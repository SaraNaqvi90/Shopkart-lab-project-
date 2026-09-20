const mongoose = require('mongoose');
const productModel = require('../models/product.model');

async function createProduct(req, res) {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (price === undefined || price === null || Number(price) <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        if (stock === undefined || stock === null || Number(stock) < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative"
            });
        }

        const product = await productModel.create({
            name,
            description,
            price,
            category,
            image,
            stock,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function getAllProducts(req, res) {
    try {
        const { search, category, sort } = req.query;

        // Built dynamically so any combination of search/category can be
        // applied without needing a separate endpoint for each case.
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // case-insensitive
        }

        if (category) {
            filter.category = category;
        }

        let query = productModel.find(filter);

        if (sort === 'price_asc') {
            query = query.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            query = query.sort({ price: -1 });
        }

        const products = await query;

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function getProductById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
};
