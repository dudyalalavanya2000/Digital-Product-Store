import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders/");

      console.log("Admin orders response:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data.items)) {
        setOrders(data.items);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to load admin orders:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load orders."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const paidOrders = orders.filter(
    (order) => order.status === "paid"
  );

  const totalRevenue = paidOrders.reduce(
    (total, order) =>
      total + Number(order.amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="text-slate-600">
            Loading admin orders...
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
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <span className="text-2xl">🛍️</span>
            Digital Product Store
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Products
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Store
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Order Management
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage all customer orders.
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          {/* Total Orders */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>

          {/* Paid Orders */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Paid Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {paidOrders.length}
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              ₹{totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders table */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              All Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customer order and payment information.
            </p>
          </div>

          {/* No orders */}
          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">📦</div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                No orders found
              </h3>

              <p className="mt-2 text-slate-500">
                There are currently no customer orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Order ID */}
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          #{order.id}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5">
                        <p className="text-slate-700">
                          User #{order.user_id}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          ₹
                          {Number(
                            order.amount || 0
                          ).toFixed(2)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status || "unknown"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/orders/${order.id}`
                            )
                          }
                          className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}