# ShopKart — Frontend

React + Vite frontend for ShopKart: customer auth (Lab 02) plus product discovery (Lab 03).
Built against the backend's `/customers/*` and `/products/*` APIs.

## Stack

- React + React Router DOM
- Axios (`withCredentials: true`, so the HttpOnly cookie is sent on every request)
- Tailwind CSS v4
- lucide-react (icons)

## Running it

1. Make sure your backend is running on **`http://localhost:3000`**.
2. In this folder:
   ```
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`.

### Connecting to the backend via CORS

The frontend (`localhost:5173`) and backend (`localhost:3000`) are different origins, so the
backend needs `cors` configured to allow the frontend's origin **and** allow credentials —
otherwise the browser will refuse to send or accept the HttpOnly `token` cookie.

```js
// src/app.js
const cors = require('cors');

app.use(
  cors({
    origin: 'http://localhost:5173', // must be the exact origin, not '*'
    credentials: true,
  })
);
```

If your backend runs somewhere other than `localhost:3000`, set `VITE_API_URL` in a `.env` file
in this project — **as of Lab 03, this should be the API's root, with no path on the end**
(e.g. `VITE_API_URL=http://localhost:4000`), since the axios instance now builds full paths like
`/customers/login` and `/products` itself. If you had an old `.env` with
`VITE_API_URL=http://localhost:3000/customers` from Lab 02, update or remove it — otherwise
every request doubles up the `/customers` segment.

## Structure

```
src/
├── pages/          Register.jsx, Login.jsx, Home.jsx, Products.jsx, ProductDetails.jsx
├── components/     Navbar.jsx, AuthShell.jsx, ProtectedRoute.jsx, ProductCard.jsx, SearchBar.jsx
├── context/         AuthContext.jsx  — holds the logged-in customer, resolved via GET /customers/me
├── services/api.js  — axios instance (root baseURL) + one function per endpoint
├── App.jsx           — routes
└── main.jsx
```

## Flow

- **`/register`** — collects full name, email, password, phone; on success, redirects to `/login`.
- **`/login`** — on success, stores the returned customer in context and navigates to `/home`.
- **`/home`** (protected) — storefront-style landing page; also shows the customer's account
  details, pulled from `GET /customers/me`.
- **`/products`** (protected) — fetches `GET /products`, with a search box and category dropdown
  that re-fetch with `?search=` and `?category=` query params (debounced 300ms). Handles loading,
  error, and empty states.
- **`/products/:id`** (protected) — fetches `GET /products/:id`; shows a "Product not found"
  message on a 404, an "Add to Cart" button with no backend wiring yet (per the lab spec — cart
  lands in Lab 04).
- **Logout** (navbar) — calls `POST /customers/logout`, clears local state, redirects to `/login`.

### A design decision worth knowing about

The lab spec doesn't explicitly say whether `/products` and `/products/:id` need to be logged in
to view — I made them protected routes (same `ProtectedRoute` wrapper as `/home`), on the
assumption that browsing the catalog is part of the logged-in shopping journey the lab describes
(Login → Home → Products → Cart). If your TA expects product browsing to work *without* logging
in, just remove the `<ProtectedRoute>` wrapper around those two routes in `App.jsx`.
