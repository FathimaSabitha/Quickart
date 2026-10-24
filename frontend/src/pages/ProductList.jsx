import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/api";
import { useState } from "react";
import AddProductModal from "./AddProductModal";

export default function ProductList() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/products/my-products", {});
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      console.log(localStorage.getItem("token"));
      return API.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem("token");

      return API.put(`/products/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <p className="text-gray-500">No products yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {products.map((p) => (
        <div
          key={p._id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
        >
          {p.image && (
            <div  className="bg-gray-100 aspect-square overflow-hidden">
           
              <img
                src={`data:image/jpeg;base64,${p.image}`}
                alt={p.name}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
          )}

          <div className="p-4">
            <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>

            <p className="text-lg font-bold text-black mt-1">₹{p.price}</p>
            <p className="text-lg font-bold text-emerald-600 ml-auto text-right">{p.stock}</p>
            <button
              onClick={() => {
                setSelectedProduct(p);
                setOpen(true);
              }}
              className="mt-4 w-full border border-black-200 text-black-500 py-2 rounded-lg hover:bg-red-50 transition text-sm font-medium"
            >
              Edit
            </button>

            <button
              onClick={() => deleteMutation.mutate(p._id)}
              className="mt-4 w-full border border-black-200 text-black-500 py-2 rounded-lg hover:bg-red-50 transition text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <AddProductModal
        isOpen={open}
        product={selectedProduct}
        onClose={() => setOpen(false)}
        onSubmit={(data) =>
          editMutation.mutate({
            id: selectedProduct._id,
            data,
          })
        }
      />
    </div>
  );
}
