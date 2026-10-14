const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');

router.post('/:productId', cartController.addToCart);

router.get('/', cartController.getCart);

router.patch('/:productId', cartController.updateQuantity);

router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
