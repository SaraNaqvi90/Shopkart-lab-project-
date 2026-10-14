# ShopKart — Frontend

React + Vite frontend for ShopKart, Labs 2–6: auth, product discovery, wishlist, cart, and
checkout/orders with Razorpay (Test Mode).

## Stack

React · React Router DOM · Axios (`withCredentials: true`) · Tailwind CSS v4 · lucide-react

## Running it

1. Start the backend first (`http://localhost:3000`).
2. In this folder: `npm install`, then `npm run dev`, then open `http://localhost:5173`.

No Razorpay variable is needed here: the backend sends the (public) Key ID with each payment order.
If your backend is not on `localhost:3000`, set `VITE_API_URL` in a `.env` file (the API root, with
no path, e.g. `VITE_API_URL=http://localhost:4000`). Never put secrets in a `VITE_` variable: those
end up in the public browser bundle.

The backend must allow this origin with CORS (`origin: 'http://localhost:5173', credentials: true`).

## Structure

```
src/
├── pages/        Register, Login, Home, Products, ProductDetails, Wishlist, Cart,
│                 Checkout (Lab 6), Orders (Lab 6), OrderDetails (Lab 6)
├── components/   Navbar, AuthShell, ProtectedRoute, ProductCard, SearchBar, WishlistCard,
│                 CartItem, CheckoutForm, OrderSummary, OrderCard, StatusBadge
├── context/      AuthContext, CartContext
├── services/     api.js — axios instance + one function per endpoint
└── utils/        loadRazorpay.js, validateShipping.js, formatters.js
```

## Routes (all except register/login are protected)

`/register` `/login` `/home` `/products` `/products/:id` `/wishlist` `/cart`
`/checkout` `/orders` `/orders/:id`

## Lab 6 flow

1. **Cart → Proceed to Checkout.** `/checkout` redirects to `/cart` if the cart is empty
   (after the cart has finished loading).
2. **Shipping form** with client-side validation (blank/whitespace, 10-digit phone, 6-digit
   pincode). If invalid, no request is sent.
3. **Place Order** sends **only the address** to the server, which rebuilds the order and returns
   a Razorpay order id, the amount in paise and the public key.
4. **Razorpay popup** opens. Three outcomes are handled: paid (`handler`), failed
   (`payment.failed`) and closed (`modal.ondismiss`). The button recovers in every failure path.
5. **On "paid", the browser only *claims* success.** It sends the three Razorpay values to
   `/orders/verify-payment`; the server checks the signature.
6. **Only after verification:** the cart state is cleared (`CartContext.clearCartState`, so the
   navbar count updates instantly) and you land on `/orders/:id` with an
   "Order placed successfully" banner (passed via router state, so it disappears on refresh).
7. **My Orders** lists paid orders, newest first; **Order Details** shows the frozen snapshot of
   items and prices, the shipping address and payment status.

## Testing payments (Razorpay Test Mode)

No real money moves. Razorpay's "Test Card Details" page lists test cards and UPI ids (commonly
`success@razorpay` / `failure@razorpay`). Try one success, one failure, and closing the popup.
