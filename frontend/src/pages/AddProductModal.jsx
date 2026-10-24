import { useState, useEffect } from "react";

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  product,
}) {
  const [name, setName] = useState("");
  const [disc, setDisc] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [stock, setStock] = useState(product?.stock ?? 0);

  

  useEffect(() => {
    if (!isOpen) return;

    setName(product?.name || "");
    setDisc(product?.description || "");
    setPrice(product?.price ?? "");
    setStock(product?.stock ?? 0);
    setImage(null);
    setError("");

    setPreview(product?.image ? `data:image/jpeg;base64,${product.image}` : "");
  }, [product, isOpen]);

  useEffect(() => {
    if (!image) return;

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("description", disc.trim());
    formData.append("stock", stock);

    if (image) {
      formData.append("image", image);
    }

    try {
      setSaving(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <h2 className="text-lg font-semibold mb-4">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <label className="block mb-2 text-sm text-gray-500">
          Product Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files?.[0] || null);
          }}
          className="mb-3 w-full"
        />

        {preview && (
          <img
            src={preview}
            alt="Product preview"
            className="mb-4 w-full h-40 object-cover rounded-xl"
          />
        )}

        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-xl border"
          required
        />

        <textarea
          placeholder="Description"
          value={disc}
          onChange={(e) => setDisc(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-xl border"
          rows={3}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-xl border"
          required
        />

        <input
          type="number"
          min="0"
          step="1"
          placeholder="Available stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-xl border"
          required
        />

        {error && (
          <p role="alert" className="text-sm text-red-600 mb-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
