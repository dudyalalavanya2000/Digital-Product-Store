import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    paid_orders: 0,
    total_revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/stats");

      console.log("Admin stats:", response.data);

      setStats({
        total_products: response.data.total_products || 0,
        total_orders: response.data.total_orders || 0,
        paid_orders: response.data.paid_orders || 0,
        total_revenue: response.data.total_revenue || 0,
      });
    } catch (error) {
      console.error("Failed to load admin stats:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load admin statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="text-slate-600">
            Loading admin dashboard...
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
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <span className="text-2xl">🛍️</span>
            Digital Product Store
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Products
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Orders
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Store
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Sales Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Overview of your digital product store.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Products */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Products
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total_products}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                📦
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total_orders}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                🛒
              </div>
            </div>
          </div>

          {/* Paid Orders */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Paid Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {stats.paid_orders}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                ✅
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Revenue
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  ₹{Number(stats.total_revenue).toFixed(2)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                💰
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your store from the admin panel.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-2xl">📦</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Manage Products
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create, update and manage digital products.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-2xl">🧾</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Manage Orders
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View customer orders and payment status.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-2xl">🛍️</div>

              <h3 className="mt-3 font-bold text-slate-900">
                Visit Store
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View the customer-facing product store.
              </p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}