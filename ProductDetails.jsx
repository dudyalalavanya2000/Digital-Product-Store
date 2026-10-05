
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/products/${id}`);

        setProduct(response.data);
      } catch (error) {
        console.error("Failed to load product:", error);

        toast.error(
          error.response?.data?.detail ||
            "Unable to load product. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      await api.post("/cart/items", {
        product_id: Number(id),
        quantity: 1,
      });

      toast.success("Product added to cart!");

      navigate("/cart");
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      if (error.response?.status === 401) {
        toast.error("Please login to add products to your cart.");
        navigate("/login");
        return;
      }

      toast.error(
        error.response?.data?.detail ||
          "Unable to add product to cart. Please try again."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="text-slate-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">📦</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Product not found
          </h1>

          <p className="mt-2 text-slate-500">
            The requested product could not be found.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Products
          </Link>
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
              to="/cart"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              🛒 Cart
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

      {/* Product details */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="mb-6 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Products
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* Product visual */}
            <div className="flex min-h-80 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
              <span className="text-8xl">📚</span>
            </div>

            {/* Product information */}
            <div className="p-8 md:p-10">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Digital Product
              </span>

              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                {product.name}
              </h1>

              <p className="mt-5 leading-7 text-slate-600">
                {product.description || "No description available."}
              </p>

              <div className="mt-8">
                <p className="text-sm font-medium text-slate-500">Price</p>

                <p className="mt-1 text-4xl font-bold text-blue-600">
                  ₹{Number(product.price).toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingToCart ? "Adding to Cart..." : "🛒 Add to Cart"}
              </button>

              <p className="mt-4 text-center text-sm text-slate-500">
                Secure digital purchase
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
