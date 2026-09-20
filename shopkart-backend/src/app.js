const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

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

module.exports = app;
