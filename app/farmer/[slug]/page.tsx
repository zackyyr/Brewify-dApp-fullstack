'use client';

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ethers } from "ethers";
import { ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Toast from "@/app/components/Toast";
import { textarea } from "framer-motion/client";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BATCHNFT_ADDRESS;
if (!CONTRACT_ADDRESS) console.warn("Missing NEXT_PUBLIC_BATCHNFT_ADDRESS");
const HOST = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

interface Product {
  name: string;
  origin: string;
  process: string;
  description: string;
  priceEth: string;
  quantity: number;
  harvested: string;
  roasted: string;
  packed: string;
  imageCid: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const slug = pathname?.split("/").pop() || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const downloadQR = () => {
    const canvas = document.getElementById("qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-${product?.slug}.png`;
    a.click();
  };

  const showToast = (message: string, type: "success" | "error" = "error") => setToast({ message, type });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product?slug=${slug}`);
        const data = await res.json();
        if (data) {
          setProduct(data);
          setQuantity(data.quantity);
        }
      } catch (err) {
        console.error(err);
        showToast("Gagal fetch product", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleUpdateQuantity = async () => {
    try {
      const res = await fetch("/api/product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, quantity }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast("Quantity berhasil diupdate", "success");
    } catch (err) {
      showToast("Update gagal: " + (err as Error).message, "error");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product tidak ditemukan</div>;

  const imageUrl = `https://gateway.pinata.cloud/ipfs/${product.imageCid}`;

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4">
      {/* BACK */}
      <div className="w-full max-w-6xl mb-6">
        <button
          onClick={() => router.push("/farmer")}
          className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Kembali</span>
        </button>
      </div>

      <div className="w-full max-w-6xl flex gap-8">
        {/* LEFT FORM */}
        <div className="border border-gray-300 rounded-xl p-6 flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-center">Edit Product</h1>

          {["name","origin","process"].map(f => (
            <input
              key={f}
              name={f}
              value={product[f as keyof Product] as string}
              readOnly
              className="p-3 rounded-xl border border-gray-300 w-full bg-gray-100 text-gray-600"
            />
          ))}
          <textarea
            name="description"
            value={product.description}
            readOnly
            className="p-3 rounded-xl border border-gray-300 w-full bg-gray-100 text-gray-600"
          />
          <input
            type="number"
            name="priceEth"
            value={product.priceEth}
            readOnly
            className="p-3 rounded-xl border border-gray-300 w-full bg-gray-100 text-gray-600"
          />

          <input
            type="number"
            name="quantity"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="p-3 rounded-xl border border-gray-300 w-full"
          />

          {/* Timeline */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Timeline</label>
            <div className="flex gap-2">
              <div className="flex flex-col flex-1">
                <label className="text-sm text-gray-500">Harvested</label>
                <input
                  type="date"
                  value={product.harvested}
                  readOnly
                  className="p-3 rounded-xl border border-gray-300 w-full bg-gray-100 text-gray-600"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm text-gray-500">Roasted</label>
                <input
                  type="date"
                  value={product.roasted}
                  readOnly
                  className="p-3 rounded-xl border border-gray-300 w-full bg-gray-100 text-gray-600"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm text-gray-500">Packed</label>
                <input
                  type="date"
                  value={product.packed}
                  readOnly
                  className="p-3 rounded-xl border border-gray-300 w-full bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>


          <button
            onClick={handleUpdateQuantity}
            className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700"
          >
            Update Quantity
          </button>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <img src={imageUrl} className="w-full h-96 object-cover rounded-lg shadow" />

          <div className="w-full h-64 border border-gray-200 rounded-lg flex flex-col items-center justify-center p-2 gap-2">
  <QRCodeCanvas id="qr" value={`${HOST}/product/${product.slug}`} size={150} />
  <button
    onClick={downloadQR}
    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer transition"
  >
    Download QR
  </button>
  <span className="text-sm text-gray-600 break-all mt-2">
    IPFS: {product.imageCid}
  </span>
</div>

        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
