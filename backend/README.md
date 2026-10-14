# ShopKart — Backend

Node.js + Express + MongoDB (Mongoose). Covers Labs 1–6: customer auth, products, wishlist,
cart, and checkout/orders with Razorpay (Test Mode).

## Setup

1. Copy `.env.example` to `.env` (same folder as `server.js`) and fill in your values:

   | Variable | What it is |
   |---|---|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Any long random string (signs login tokens) |
   | `RAZORPAY_KEY_ID` | Razorpay **Test** Key ID (starts with `rzp_test_`) |
   | `RAZORPAY_KEY_SECRET` | Razorpay **Test** Key Secret. Backend only, never share it. |

2. Install packages (this project needs `express mongoose cors cookie-parser jsonwebtoken bcrypt dotenv razorpay`):
   ```
   npm install razorpay
   ```
   `razorpay` is the only new package since Lab 5.
3. Start it: `node server.js` (port 3000). You should see "database connected".

`.env` is read only at startup, so restart after changing it.

## Structure

```
server.js
src/
├── app.js                 middleware + route mounting
├── config/razorpay.js     Razorpay client (Lab 6)
├── db/db.js
├── middlewares/auth.middleware.js
├── models/                user, product, order
├── controllers/           customer, product, wishlist, cart, order
└── routes/                auth, product, wishlist, cart, order
```

## Endpoints

| Method | URL | Auth | Purpose |
|---|---|---|---|
| POST | `/customers/register` | no | Register |
| POST | `/customers/login` | no | Log in (sets HttpOnly cookie) |
| GET | `/customers/me` | yes | Current customer |
| POST | `/customers/logout` | yes | Log out |
| POST / GET | `/products` | no | Create / list (`?search=&category=&sort=price_asc\|price_desc`) |
| GET / PUT / DELETE | `/products/:id` | no | One product / update / delete |
| POST / GET | `/wishlist/:productId`, `/wishlist` | yes | Add / list |
| DELETE | `/wishlist/:productId` | yes | Remove |
| POST / GET | `/cart/:productId`, `/cart` | yes | Add (increments if present) / list |
| PATCH / DELETE | `/cart/:productId` | yes | Set quantity / remove |
| **POST** | **`/orders/create-payment-order`** | yes | Validate address + cart, create order and Razorpay order |
| **POST** | **`/orders/verify-payment`** | yes | Verify Razorpay signature, mark paid, reduce stock, clear cart |
| **GET** | **`/orders`** | yes | My paid orders, newest first |
| **GET** | **`/orders/:id`** | yes | One of my orders |
| **PATCH** | **`/orders/:id/status`** | yes | Bonus: move a paid order one step forward (development use) |

## Lab 6 design notes

- **The server never trusts the browser for money.** The request carries only a shipping address.
  Items, prices and the total are rebuilt from the database.
- **Payment is proven by an HMAC-SHA256 signature** over `razorpayOrderId|paymentId`, keyed with the
  Key Secret, compared with `crypto.timingSafeEqual`. The order id comes from the database.
- **A bad signature changes nothing:** order stays unpaid, cart stays full, stock unchanged.
- **`verify-payment` is idempotent:** repeating it for a paid order returns the same answer and does
  not reduce stock twice.
- **Orders store snapshots** (name, price, image) of what was bought; the cart stores live references.
- **Stock is reduced after verified payment** with an atomic conditional update. Known limitation: two
  customers paying for the last unit at the same instant can still oversell it (real shops reserve
  stock before payment).
