const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authMiddleware = require('./middlewares/auth.middleware');
const customerRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173', // the Vite dev server's origin, not a wildcard
        credentials: true,               // required so the browser will send/accept cookies
    })
);
app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);

// authMiddleware applied HERE, once, for the whole router — every route
// inside wishlist.routes.js and cart.routes.js is protected without
// needing to repeat the middleware on each individual route.
app.use('/wishlist', authMiddleware, wishlistRoutes);
app.use('/cart', authMiddleware, cartRoutes);
app.use('/orders', authMiddleware, orderRoutes);

module.exports = app;
