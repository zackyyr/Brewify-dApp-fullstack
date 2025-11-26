'use client'

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrowserProvider, Contract, parseEther } from "ethers"
import Toast from "./Toast"
import BatchNFTAbi from "@/build/contracts/BatchNFT.json"

interface Timeline {
  harvested?: string
  roasted?: string
  packed?: string
}

interface Product {
  tokenId: number
  name: string
  origin?: string
  process?: string
  description?: string
  priceEth?: number | string
  imageCid?: string
  timeline?: Timeline
  recipientAddress?: string
}

interface ProductModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

const BATCHNFT_ADDRESS = process.env.NEXT_PUBLIC_BATCHNFT_ADDRESS!
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "gateway.pinata.cloud"

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, product }) => {
  const [fullProduct, setFullProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (!product) return

    const fetchData = async () => {
      try {
        const provider = (window.ethereum)
          ? new BrowserProvider(window.ethereum as any)
          : new BrowserProvider(RPC_URL)

        const contract = new Contract(BATCHNFT_ADDRESS, BatchNFTAbi.abi, provider)

        // Ambil owner
        const owner = await contract.ownerOf(product.tokenId)

        // Ambil IPFS hash metadata
        let ipfsHash: string = await contract.batchMetadata(product.tokenId)
        ipfsHash = ipfsHash.replace(/^ipfs:\/\//, "") // remove ipfs:// prefix

        const res = await fetch(`https://${GATEWAY_URL}/ipfs/${ipfsHash}`)
        const text = await res.text()

        let metadata: any
        try {
          metadata = JSON.parse(text)
          console.log("Metadata:", metadata)
        } catch (err) {
          console.error("Invalid JSON from IPFS:", text)
          throw err
        }

        // Parse timeline dari attributes
        const timeline: Timeline = {}
        metadata.attributes?.forEach((attr: any) => {
          if (attr.trait_type === "Harvested") timeline.harvested = attr.value
          if (attr.trait_type === "Roasted")  timeline.roasted  = attr.value
          if (attr.trait_type === "Packed")   timeline.packed   = attr.value
        })

        const origin = metadata.attributes?.find((a:any)=>a.trait_type==="Origin")?.value
        const process = metadata.attributes?.find((a:any)=>a.trait_type==="Process")?.value

        const imageCid = metadata.image?.replace("ipfs://","")

        setFullProduct({
          ...product,
          recipientAddress: owner,
          name: metadata.name ?? product.name,
          origin,
          process,
          description: metadata.description ?? product.description,
          imageCid,
          timeline
        })
      } catch (err) {
        console.error("Failed to fetch product data:", err)
        setFullProduct(product)
      }
    }

    fetchData()
  }, [product])

  if (!open || !fullProduct) return null

  const handleBuy = async () => {
    if (!window.ethereum) {
      setToast({ message: "Wallet not detected.", type: "error" })
      return
    }

    const price = Number(fullProduct.priceEth)
    if (!price || price <= 0) {
      setToast({ message: "Invalid product price.", type: "error" })
      return
    }

    try {
      setLoading(true)
      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()

      const recipient = fullProduct.recipientAddress ?? "0x0000000000000000000000000000000000000000"
      if (!recipient.startsWith("0x") || recipient.length !== 42) {
        setToast({ message: "Invalid recipient address.", type: "error" })
        setLoading(false)
        return
      }

      const tx = await signer.sendTransaction({
        to: recipient,
        value: parseEther(String(price))
      })

      await tx.wait()
      setToast({ message: "Transaction completed successfully.", type: "success" })
    } catch (err: any) {
      console.error("TX ERROR:", err)
      if (err?.code === 4001) setToast({ message: "Transaction was cancelled.", type: "error" })
      else if (err?.message?.toLowerCase().includes("insufficient")) setToast({ message: "Insufficient balance.", type: "error" })
      else if (err?.message?.toLowerCase().includes("network")) setToast({ message: "Network error. Try again.", type: "error" })
      else setToast({ message: "Transaction failed.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const imageUrl = fullProduct.imageCid
    ? `https://${GATEWAY_URL}/ipfs/${fullProduct.imageCid}`
    : `https://source.unsplash.com/400x400/?coffee`

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl text-black"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{fullProduct.name}</h2>
              <button onClick={onClose} className="text-black hover:text-black/60 text-lg">✕</button>
            </div>

            <img
              src={imageUrl}
              className="w-full h-48 object-cover rounded-lg mb-4"
              alt={fullProduct.name}
            />

            <div className="space-y-1 text-black">
              <p><span className="font-semibold">Origin:</span> {fullProduct.origin ?? "-"}</p>
              <p><span className="font-semibold">Process:</span> {fullProduct.process ?? "-"}</p>
              <p><span className="font-semibold">Description:</span> {fullProduct.description ?? "-"}</p>
              <p className="font-semibold mt-3 text-lg">{fullProduct.priceEth ?? "-"} ETH</p>
            </div>

            <div className="mt-4 bg-gray-100 p-3 rounded-lg text-sm text-black">
              <p><span className="font-semibold">Harvested:</span> {fullProduct.timeline?.harvested ?? "-"}</p>
              <p><span className="font-semibold">Roasted:</span> {fullProduct.timeline?.roasted ?? "-"}</p>
              <p><span className="font-semibold">Packed:</span> {fullProduct.timeline?.packed ?? "-"}</p>
            </div>

            <button
              onClick={handleBuy}
              disabled={loading}
              className={`w-full mt-5 py-3 rounded-xl text-white font-semibold transition 
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Processing..." : "Buy Now"}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export default ProductModal
