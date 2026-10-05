
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);

      const response = await api.get("/cart");

      const cartData = response.data;
      const cartItems = cartData.items || [];

      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productResponse = await api.get(
              `/products/${item.product_id}`
            );

            return {
              ...item,
              product: productResponse.data,
            };
          } catch (error) {
            console.error(
              `Failed to load product ${item.product_id}:`,
              error
            );

            return {
              ...item,
              product: null,
            };
          }
        })
      );

      setCart({
        ...cartData,
        items: enrichedItems,
      });
    } catch (error) {
      console.error("Failed to load cart:", error);

      if (error.response?.status === 401) {
        toast.error("Please login to view your cart.");
        navigate("/login");
        return;
      }

      toast.error(
        error.response?.data?.detail ||
          "Unable to load cart. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingItem(item.id);

      await api.put(`/cart/items/${item.id}`, {
        quantity: newQuantity,
      });

      await fetchCart();

      toast.success("Cart updated.");
    } catch (error) {
      console.error("Failed to update cart:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to update cart. Please try again."
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdatingItem(itemId);

      await api.delete(`/cart/items/${itemId}`);

      await fetchCart();

      toast.success("Item removed from cart.");
    } catch (error) {
      console.error("Failed to remove item:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to remove item. Please try again."
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const clearCart = async () => {
    try {
      setClearing(true);

      await api.delete("/cart/clear");

      await fetchCart();

      toast.success("Cart cleared.");
    } catch (error) {
      console.error("Failed to clear cart:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to clear cart. Please try again."
      );
    } finally {
      setClearing(false);
    }
  };

  // =========================
  // Stripe Checkout
  // =========================

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      setCheckingOut(true);

      /*
       * Step 1:
       * Create an order from the current cart.
       */
      const orderResponse = await api.post("/orders/from-cart");

      const order = orderResponse.data;

      if (!order?.id) {
        throw new Error(
          "Order was created but no order ID was returned."
        );
      }

      /*
       * Step 2:
       * Create Stripe Checkout Session using the order ID.
       */
      const checkoutResponse = await api.post(
        "/payments/create-checkout-session",
        {
          order_id: order.id,
        }
      );

      const checkoutUrl =
        checkoutResponse.data.checkout_url;

      if (!checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned."
        );
      }

      /*
       * Step 3:
       * Redirect browser to Stripe Checkout.
       */
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout failed:", error);

      const message =
        error.response?.data?.detail ||
        error.message ||
        "Unable to start checkout. Please try again.";

      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  const items = cart?.items || [];

  const total = items.reduce((sum, item) => {
    const price = Number(item.product?.price || 0);

    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="text-slate-500">
            Loading cart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <span className="text-2xl">🛍️</span>
            Digital Product Store
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Products
            </Link>

            <Link
              to="/orders"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              📦 Orders
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            🛒 Your Cart
          </h1>

          <p className="mt-2 text-slate-500">
            Review your selected digital products before checkout.
          </p>
        </div>

        {/* Empty cart */}
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-6xl">🛒</div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-slate-500">
              Browse our products and add something to
              your cart.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const product = item.product;

                const price = Number(
                  product?.price || 0
                );

                const subtotal =
                  price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      {/* Product icon */}
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-slate-100">
                        <span className="text-4xl">
                          📚
                        </span>
                      </div>

                      {/* Product details */}
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900">
                          {product?.name ||
                            `Product #${item.product_id}`}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Unit price: ₹
                          {price.toFixed(2)}
                        </p>

                        <p className="mt-2 text-lg font-bold text-blue-600">
                          ₹{subtotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            updatingItem === item.id ||
                            item.quantity <= 1
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="flex h-9 min-w-10 items-center justify-center rounded-lg bg-slate-100 px-3 font-semibold text-slate-800">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            updatingItem === item.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        disabled={
                          updatingItem === item.id
                        }
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={clearing}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {clearing
                    ? "Clearing..."
                    : "Clear Cart"}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-3 border-b border-slate-200 pb-5">
                  <div className="flex justify-between text-slate-600">
                    <span>Items</span>

                    <span>
                      {items.reduce(
                        (sum, item) =>
                          sum + item.quantity,
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>

                    <span>
                      ₹{total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      Additional charges
                    </span>

                    <span>₹0.00</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={
                    checkingOut ||
                    items.length === 0
                  }
                  className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkingOut
                    ? "Creating Checkout..."
                    : "Proceed to Checkout"}
                </button>

                <Link
                  to="/products"
                  className="mt-3 block w-full rounded-lg border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
