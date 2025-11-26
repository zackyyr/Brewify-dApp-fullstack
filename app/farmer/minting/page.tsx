"use client";

import { useState } from "react";
import { ethers } from "ethers";
import BatchNFTAbi from "@/build/contracts/BatchNFT.json";
import { QRCodeCanvas } from "qrcode.react";
import Toast from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BATCHNFT_ADDRESS;
if (!CONTRACT_ADDRESS) console.warn("Missing NEXT_PUBLIC_BATCHNFT_ADDRESS");
const HOST = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

export default function MintingNFT() {
  const router = useRouter();

  // UI state
  const [file, setFile] = useState<File>();
  const [minting, setMinting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Mint result state
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);

  const [form, setForm] = useState({
    name: "",
    origin: "",
    process: "",
    description: "",
    priceEth: "",
    quantity: "",
    harvested: "",
    roasted: "",
    packed: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const showToast = (message: string, type: "success" | "error" = "error") =>
    setToast({ message, type });

  const downloadQR = () => {
    const canvas = document.getElementById("qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `brewify-${productSlug}.png`;
    a.click();
  };

  const handleMint = async () => {
    // Validasi required fields
    const required = ["name","origin","process","description","priceEth","quantity","harvested","roasted","packed"];
    for (const f of required) {
      if (!form[f as keyof typeof form]) return showToast(`Field "${f}" wajib diisi!`);
    }
    if (!file) return showToast("Select a file first!");
    if (!CONTRACT_ADDRESS) return showToast("Contract address missing");

    setMinting(true);

    try {
      // 1) Upload gambar ke API (Pinata/IPFS)
      const fd = new FormData();
      fd.append("file", file);
      const imgRes = await fetch("/api/upload", { method: "POST", body: fd });
      const imgData = await imgRes.json();
      if (!imgData?.cid) throw new Error("Image upload failed");
      const imageCid = imgData.cid;

      // 2) Upload metadata ke API (Pinata/IPFS)
      const metaRes = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageCid }),
      });
      const metaData = await metaRes.json();
      if (!metaData?.cid) throw new Error("Metadata upload failed");
      const metadataCid = metaData.cid;
      const metadataUri = `ipfs://${metadataCid}`;

      // 3) Mint NFT ke blockchain
      if (!window.ethereum) throw new Error("Install MetaMask");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BatchNFTAbi.abi, signer);

      const tx = await contract.mintBatch(addr, metadataUri);
      const receipt = await tx.wait();

      // Parse event BatchMinted
      let extractedTokenId: number | null = null;
      for (const log of receipt.logs) {
        let parsed;
        try { parsed = contract.interface.parseLog(log); } catch { continue; }
        if (parsed?.name === "BatchMinted") {
          const tokenIdArg = parsed.args.tokenId ?? parsed.args[0];
          extractedTokenId = Number(tokenIdArg.toString());
          break;
        }
      }
      if (extractedTokenId === null) throw new Error("BatchMinted event not found");
      setTokenId(extractedTokenId);

      // 4) Simpan ke DB via API
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const resProduct = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: extractedTokenId,
          owner: addr,
          name: form.name,
          slug,
          metadataCid,               // HARUS ini, jangan ipfsHash
          image: `ipfs://${imageCid}`,
          quantity: Number(form.quantity),
          priceEth: form.priceEth,
          origin: form.origin,
          process: form.process,
          harvested: form.harvested,
          roasted: form.roasted,
          packed: form.packed,
        }),
      }).then((r) => r.json());

      // SAFE access supaya nggak crash
      setProductSlug(resProduct?.product?.slug ?? slug);
      setReadonly(true);

      showToast("Mint sukses!", "success");
    } catch (err) {
      showToast("Minting gagal: " + (err as Error).message, "error");
      console.error(err);
    } finally {
      setMinting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-center">Mint New Batch NFT</h1>

          {/* Regular Inputs */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Batch Name"
            className="p-3 rounded-xl border border-gray-300 w-full"
          />
          <input
            name="origin"
            value={form.origin}
            onChange={handleChange}
            placeholder="Origin"
            className="p-3 rounded-xl border border-gray-300 w-full"
          />
          <input
            name="process"
            value={form.process}
            onChange={handleChange}
            placeholder="Process"
            className="p-3 rounded-xl border border-gray-300 w-full"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="p-3 rounded-xl border border-gray-300 w-full"
          />
          <input
            type="number"
            name="priceEth"
            value={form.priceEth}
            onChange={handleChange}
            placeholder="Price (ETH)"
            className="p-3 rounded-xl border border-gray-300 w-full"
          />
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="p-3 rounded-xl border border-gray-300 w-full"
          />

          {/* Timeline */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Timeline</label>
            <div className="flex gap-2">
              <input
                type="date"
                name="harvested"
                value={form.harvested}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 flex-1"
              />
              <input
                type="date"
                name="roasted"
                value={form.roasted}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 flex-1"
              />
              <input
                type="date"
                name="packed"
                value={form.packed}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 flex-1"
              />
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={minting}
            className={`w-full py-3 rounded-xl font-semibold text-white ${minting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {minting ? "Minting..." : "Mint Batch NFT"}
          </button>
        </div>
        {/* RIGHT PREVIEW */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {file ? (
            <img src={URL.createObjectURL(file)} className="w-full h-96 object-cover rounded-lg shadow" />
          ) : (
            <div className="w-full h-96 border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              Image Preview
            </div>
          )}

          <label className="w-full cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-gray-400">
            <Upload size={24} />
            <span>{file ? file.name : "Choose file"}</span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          {/* QR */}
          <div className="w-full h-64 border border-gray-200 rounded-lg flex items-center justify-center">
            {productSlug ? (
              <div className="flex flex-col items-center">
                <QRCodeCanvas id="qr" value={`${HOST}/product/${productSlug}`} size={150} />
                <button
                  onClick={downloadQR}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer transition"
                >
                  Download QR
                </button>
              </div>
            ) : (
              <span className="text-gray-400">QR akan muncul setelah mint</span>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
