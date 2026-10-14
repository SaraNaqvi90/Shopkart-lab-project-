# ShopKart

A full-stack shopping app built over six labs. You can sign up, browse products, save a wishlist, fill a cart and pay for the order through Razorpay (Test Mode, so no real money moves). Express and MongoDB on the back, React on the front.

## Features

- **Accounts:** register, log in, log out. The session survives a refresh, and every page except Register and Login needs a login.
- **Catalogue:** product grid with name search (case-insensitive) and a category filter. Each product has its own page. Every list has loading, empty and error states.
- **Wishlist:** a heart on every product; saved items live on a wishlist page.
- **Cart:** adding a product twice raises its quantity. Quantity controls stop at the product's stock. The navbar shows a live item count.
- **Checkout:** a validated shipping form, then Razorpay's payment popup.
- **Orders:** history of paid orders, newest first. Each order keeps a frozen copy of the items and prices, plus the shipping address, payment ID and status.

**Stack:** Node.js, Express, MongoDB (Mongoose), JWT in an HttpOnly cookie, bcrypt, Razorpay · React 18, Vite, React Router, Axios, Tailwind CSS v4, Context API.

## Progress lab by lab

1. **Lab 1, backend auth.** Express in a routes → controllers → models layout. Register, login, `me` and logout, with bcrypt passwords and a JWT in an HttpOnly cookie, read by an auth middleware.
2. **Lab 2, frontend auth.** React pages for Register, Login and a protected Home. The cookie can't be read by JavaScript, so `AuthContext` asks the server (`/customers/me`) who is logged in. CORS is set up with credentials.
3. **Lab 3, catalogue.** Product model and endpoints. One `GET /products` builds its query from `search`, `category` and `sort`. The frontend has a debounced search, a category filter and a product page driven by the URL. I also added update and delete endpoints so I could change stock without touching the database by hand.
4. **Lab 4, wishlist.** Stores product IDs, not copies, and fills in live data with `populate()`. Each card keeps its own saved state locally, with no global state.
5. **Lab 5, cart.** The first lab that needed global state, so `CartContext` holds it. Live stock checks on every change, and totals recalculated from the cart each render instead of being stored.
6. **Lab 6, checkout and orders.** Order model with item snapshots, the Razorpay flow, server-side signature verification, and the Checkout, My Orders and Order Details pages. Where the sheet was silent, I chose to: reduce stock on paid orders, list only paid orders, and use one page for both order details and confirmation. I also built the optional order-status endpoint.

## Safety and reliability 

**Money and payments**
- **The server sets the price.** Checkout sends only a shipping address. Items, prices and total are rebuilt from the database, so a faked `totalAmount` is ignored.
- **Payment is proven by an HMAC-SHA256 signature,** not by the browser saying "success". It's checked with `crypto.timingSafeEqual`, not `===`.
- **The order ID used for the signature comes from our database.** This stops the trick of paying for a cheap order and claiming it was an expensive one.
- **A rejected payment changes nothing:** the order stays unpaid, the cart stays full, stock is untouched.
- **The Key Secret never leaves the server.** The browser only receives the public Key ID.
- **If Razorpay can't be reached,** the pending order is deleted and the cart is left alone. The real error goes to the server terminal only.
- **The cart is cleared last,** and only after payment is verified.
- **Amounts go to Razorpay in paise,** rounded to a whole number so floating-point noise can't reach the gateway.

**Repeats and simultaneous requests**
- **Atomic stock reduction:** subtract only if enough stock remains, in one step, so two buyers can't both take the last unit.
- **`verify-payment` is safe to call twice.** The repeat returns the same answer without reducing stock again.
- **Atomic order claim:** the switch to `PAID` is one conditional update, so two simultaneous verify requests can't both run the follow-up work.
- **A repeat call won't wipe a cart you've since refilled.**

**Identity and input**
- Passwords are hashed; the login token is in an HttpOnly cookie.
- Login errors are vague on purpose (`Invalid credentials` for both a wrong email and a wrong password).
- User identity comes only from the token, never from the request body or URL.
- Someone else's order returns `404`, not `403`, so it doesn't even confirm the order exists.
- Validation runs in the browser and again on the server. Only known fields are saved, so extra fields like `paymentStatus: "PAID"` can't be slipped in.
- IDs are validated before they reach the database, and CORS is pinned to one exact origin.

**The payment window and checkout page**
- **Closing the popup is handled:** the button recovers instead of sticking on "Processing...", and the cart is untouched.
- **A failed payment** shows Razorpay's reason and leaves the cart alone.
- **If payment seems to succeed but verification fails,** the message says "we could not confirm your payment, please do not pay again", not "payment failed", because the money may already have been taken.
- **No double submits:** the button and inputs lock while paying.
- **A blocked or offline payment script** gives a readable message instead of crashing.
- **The empty-cart redirect waits for the cart to finish loading,** so "still loading" isn't mistaken for "empty".

**Smaller touches**
- Orders store snapshots, so an old order keeps its old price.
- The cart tracks loading per product, so only the button you clicked disables.
- Search is debounced (one request per pause in typing).
- Saving a product that's already saved just fills the heart instead of showing an error.

## API endpoints

Base URL: `http://localhost:3000`. "Auth" means you must be logged in.

**Customers**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/customers/register` | no | Create an account (`fullName`, `email`, `password`, `phone`) |
| POST | `/customers/login` | no | Log in; sets the `token` cookie |
| GET | `/customers/me` | yes | The logged-in customer |
| POST | `/customers/logout` | yes | Clear the cookie |

**Products**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/products` | no | Create a product |
| GET | `/products` | no | List products; optional `?search=`, `?category=`, `?sort=price_asc\|price_desc` |
| GET | `/products/:id` | no | One product |
| PUT | `/products/:id` | no | Partial update, e.g. `{ "stock": 25 }` to restock |
| DELETE | `/products/:id` | no | Delete a product |

**Wishlist**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/wishlist/:productId` | yes | Save a product (`409` if already saved) |
| GET | `/wishlist` | yes | Your saved products |
| DELETE | `/wishlist/:productId` | yes | Remove a product |

**Cart**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/cart/:productId` | yes | Add one unit; raises the quantity if already in the cart (`400` past stock) |
| GET | `/cart` | yes | Your cart with live product data |
| PATCH | `/cart/:productId` | yes | Set an exact quantity: `{ "quantity": 3 }` |
| DELETE | `/cart/:productId` | yes | Remove a row |

**Orders**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders/create-payment-order` | yes | Validate the address and cart, save an unpaid order, create the Razorpay order |
| POST | `/orders/verify-payment` | yes | Verify the signature; mark paid, reduce stock, clear the cart |
| GET | `/orders` | yes | Your paid orders, newest first |
| GET | `/orders/:id` | yes | One of your orders |
| PATCH | `/orders/:id/status` | yes | Bonus: move a paid order one step forward (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`) |

Errors come back as `{ "message": "..." }`: `400` bad input, `401` not logged in, `404` missing or not yours, `409` conflict, `502` payment gateway unreachable.

## Setup

**You need:** Node.js 18+, a MongoDB Atlas account (or local MongoDB), a free Razorpay account (Test Mode only), and Postman (optional).


**Backend**

```bash
cd shopkart-backend
npm install express mongoose cors cookie-parser jsonwebtoken bcrypt dotenv razorpay
```
Then run `node server.js`. You should see `database connected` and `Server is running on port 3000`. `.env` is only read at startup, so restart after changing it.

**Frontend** 

```bash
cd shopkart-frontend
npm install
npm run dev
```

**Add products.** The database starts empty and there's no admin screen, so we use Postman:

```
POST http://localhost:3000/products
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://picsum.photos/seed/keyboard/500/600",
  "stock": 10
}
```

**5. Try a payment.** Register, add something to the cart, then Checkout. In the Razorpay popup use the test card `5267 3181 8797 5449` with any future expiry and any CVV, or UPI `success@razorpay` / `failure@razorpay`. (A made-up card number is rejected even in Test Mode. Razorpay's "Test Card Details" page has the current list.) After a successful payment you land on the order page, and its Payment ID should match the one in the Razorpay dashboard.
