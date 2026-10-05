import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          from: `/orders/${id}`,
        },
      });
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);

        const message =
          error.response?.data?.detail ||
          "Unable to load order details.";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [authLoading, user, id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClasses = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (normalizedStatus === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    if (normalizedStatus === "completed") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-600">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">📦</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Order not found
          </h1>

          <p className="mt-2 text-slate-500">
            We couldn't find the requested order.
          </p>

          <Link
            to="/orders"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/products"
            className="text-2xl font-bold text-blue-600"
          >
            Digital Product Store
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/products"
              className="font-medium text-slate-600 hover:text-blue-600"
            >
              Products
            </Link>

            <Link
              to="/cart"
              className="font-medium text-slate-600 hover:text-blue-600"
            >
              Cart
            </Link>

            <Link
              to="/orders"
              className="font-semibold text-blue-600"
            >
              Orders
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <Link
            to="/orders"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Order #{order.id}
          </h1>

          <p className="mt-2 text-slate-500">
            Order placed on {formatDate(order.created_at)}
          </p>
        </div>

        {/* Order Summary */}
        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₹{Number(order.amount || 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Order Status
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                order.status
              )}`}
            >
              {order.status || "Pending"}
            </span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Payment Status
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                order.payment?.status || order.status
              )}`}
            >
              {order.payment?.status || order.status || "Pending"}
            </span>
          </div>
        </div>

        {/* Products */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Products
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {item.product_name ||
                        item.product?.name ||
                        `Product #${item.product_id}`}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ₹
                      {Number(
                        item.price || item.unit_price || 0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-slate-500">
                No product details available.
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-5">
            <span className="text-lg font-semibold text-slate-700">
              Total
            </span>

            <span className="text-2xl font-bold text-slate-900">
              ₹{Number(order.amount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}