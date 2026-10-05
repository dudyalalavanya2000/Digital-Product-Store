import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders/my-orders");

      const data = response.data;

      setOrders(data.items || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      const message =
        error.response?.data?.detail ||
        "Unable to load your orders.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          from: "/orders",
        },
      });
      return;
    }

    fetchOrders();
  }, [authLoading, user, navigate]);

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
          Loading orders...
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

            <span className="font-semibold text-blue-600">
              Orders
            </span>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Orders
          </h1>

          <p className="mt-2 text-slate-500">
            View your previous digital product orders and payment status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">📦</div>

            <h2 className="mt-4 text-2xl font-semibold text-slate-800">
              No orders yet
            </h2>

            <p className="mt-2 text-slate-500">
              You haven't placed any orders yet.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Order ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-5 font-semibold text-slate-900">
                        #{order.id}
                      </td>

                      <td className="px-6 py-5 font-medium text-slate-800">
                        ₹{Number(order.amount || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}