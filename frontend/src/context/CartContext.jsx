import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  getCart,
  addToCart as addToCartApi,
  updateCartQuantity as updateCartQuantityApi,
  removeFromCart as removeFromCartApi,
} from '../services/api.js';

const CartContext = createContext(null);

// Deliberately nested INSIDE AuthProvider (see main.jsx) — this context
// reads `customer` from AuthContext to decide WHEN to fetch the cart at
// all. There is no point calling GET /cart before we even know someone
// is logged in, and no cart to show once they log out.
export function CartProvider({ children }) {
  const { customer, checkingSession } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');

  // Per-item in-flight tracking, NOT one global "mutating" flag — this is
  // what lets one product's card show "Adding..." while every other
  // card and the cart page stay fully interactive at the same time.
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const setPending = useCallback((productId, isPending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const refreshCart = useCallback(async () => {
    setCartLoading(true);
    setCartError('');
    try {
      const res = await getCart();
      setCartItems(res.data.cart);
    } catch {
      setCartError('Unable to load your cart.');
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Fetch once we KNOW there's a logged-in customer — not before (no
  // session yet) and reset to empty the moment there isn't one anymore
  // (e.g. after logout), rather than leaving a stale previous cart visible.
  useEffect(() => {
    if (checkingSession) return;

    if (customer) {
      refreshCart();
    } else {
      setCartItems([]);
      setCartLoading(false);
    }
  }, [customer, checkingSession, refreshCart]);

  const addToCart = useCallback(async (productId) => {
    setPending(productId, true);
    try {
      const res = await addToCartApi(productId);
      setCartItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message ?? 'Unable to add to cart.' };
    } finally {
      setPending(productId, false);
    }
  }, [setPending]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setPending(productId, true);
    try {
      const res = await updateCartQuantityApi(productId, quantity);
      setCartItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message ?? 'Unable to update quantity.' };
    } finally {
      setPending(productId, false);
    }
  }, [setPending]);

  const removeFromCart = useCallback(async (productId) => {
    setPending(productId, true);
    try {
      const res = await removeFromCartApi(productId);
      setCartItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message ?? 'Unable to remove item.' };
    } finally {
      setPending(productId, false);
    }
  }, [setPending]);

  // Derived values — computed on every render from cartItems, never
  // stored anywhere. This is the one thing the lab is most explicit
  // about: subtotal/count going stale is exactly the bug this avoids.
  const { totalItems, subtotal } = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        if (!item.product) return acc; // defensive: product could've been deleted since
        acc.totalItems += item.quantity;
        acc.subtotal += item.product.price * item.quantity;
        return acc;
      },
      { totalItems: 0, subtotal: 0 }
    );
  }, [cartItems]);

  const isInCart = useCallback(
    (productId) => cartItems.some((item) => item.product?._id === productId),
    [cartItems]
  );

  const isPending = useCallback((productId) => pendingIds.has(productId), [pendingIds]);

  // Lab 6: after a verified payment the BACKEND has already emptied the cart.
  // This empties the copy held in React state too, so the navbar count and
  // the cart page update instantly, without waiting for a refresh.
  const clearCartState = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    cartLoading,
    cartError,
    totalItems,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCartState,
    isInCart,
    isPending,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
