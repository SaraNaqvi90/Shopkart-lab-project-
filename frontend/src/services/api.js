import axios from 'axios';

// Absolute URL, pointed at the API's ROOT (not /customers) because the
// backend now has two resource types under it: /customers/* and
// /products/*. Every function below spells out its own full path.
// Override with VITE_API_URL in a .env file if your backend runs
// somewhere else — e.g. VITE_API_URL=http://localhost:4000
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // required so the HttpOnly "token" cookie is sent/received cross-origin
});

// --- Customers -------------------------------------------------------

export const registerCustomer = (payload) => api.post('/customers/register', payload);

export const loginCustomer = (payload) => api.post('/customers/login', payload);

export const getCurrentCustomer = () => api.get('/customers/me');

export const logoutCustomer = () => api.post('/customers/logout');

// --- Products ----------------------------------------------------------

// params can include { search, category, sort }; axios drops any key
// that's undefined/empty, so callers can pass a partial object freely.
export const getProducts = (params) => api.get('/products', { params });

export const getProductById = (id) => api.get(`/products/${id}`);

// --- Wishlist (Lab 4) --------------------------------------------------

export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export const getWishlist = () => api.get('/wishlist');

export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

// --- Cart (Lab 5) --------------------------------------------------------

export const addToCart = (productId) => api.post(`/cart/${productId}`);

export const getCart = () => api.get('/cart');

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// --- Orders (Lab 6) --------------------------------------------------------

// We send ONLY the shipping address. The server rebuilds the items, prices
// and total from its own database, so we never send (or trust) them here.
export const createPaymentOrder = (shippingAddress) =>
  api.post('/orders/create-payment-order', { shippingAddress });

export const verifyPayment = (payload) => api.post('/orders/verify-payment', payload);

export const getOrders = () => api.get('/orders');

export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;
