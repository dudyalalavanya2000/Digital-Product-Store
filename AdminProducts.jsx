import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      toast.error("Admin access required.");
      navigate("/products");
      return;
    }

    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products/", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.items)) {
        setProducts(data.items);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load products:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
    });

    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
      };

      if (!payload.name) {
        toast.error("Product name is required.");
        return;
      }

      if (!payload.description) {
        toast.error("Product description is required.");
        return;
      }

      if (!payload.price || payload.price <= 0) {
        toast.error("Price must be greater than 0.");
        return;
      }

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          payload
        );

        toast.success("Product updated successfully.");
      } else {
        await api.post("/products/", payload);

        toast.success("Product created successfully.");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Product save failed:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to save product."
      );
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
    });

    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);

      toast.success("Product deleted successfully.");

      fetchProducts();
    } catch (error) {
      console.error("Product delete failed:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to delete product."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="text-slate-600">
            Loading products...
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
            {/* Dashboard */}
            <Link
              to="/admin/dashboard"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Dashboard
            </Link>

            {/* Orders */}
            <Link
              to="/admin/orders"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Orders
            </Link>

            {/* Store */}
            <Link
              to="/products"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Store
            </Link>

            {/* Admin */}
            <Link
              to="/admin/products"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Product Management
            </h1>

            <p className="mt-2 text-slate-500">
              Create, update and manage digital products.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              {editingProduct
                ? "Edit Product"
                : "Create Product"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="1"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Products */}
        <section className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Products
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {products.length} product
              {products.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">📦</div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                No products found
              </h3>

              <p className="mt-2 text-slate-500">
                Create your first digital product.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {product.name}
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      {product.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-600">
                        ₹
                        {Number(
                          product.price || 0
                        ).toFixed(2)}
                      </span>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(product.id)
                      }
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}