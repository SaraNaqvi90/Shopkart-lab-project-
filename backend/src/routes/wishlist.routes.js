const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlist.controller');

router.post('/:productId', wishlistController.addToWishlist);

router.get('/', wishlistController.getWishlist);

router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
