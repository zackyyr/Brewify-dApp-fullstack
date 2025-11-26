'use client'
import React, { useState, useEffect } from 'react'
import { MoreVertical, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductModal from './components/ProductModal'
import useWallet from '@/hooks/useWallet'
import { ethers } from 'ethers'
import UserProfile from "@/build/contracts/UserProfile.json"
import { useRouter } from 'next/navigation'

const productTypes = ["Arabica", "Robusta", "Liberica", "Excelsa", "Geisha", "Blend"]
const processTypes = ["Natural", "Washed", "Honey Process", "Mixed Process"]
const priceRanges = ["0.010 - 0.015 ETH", "0.016 - 0.025 ETH", "0.026 - 0.050 ETH"]

const Home = () => {
  const router = useRouter()
  const { connect, address, signer, isConnecting, disconnect } = useWallet()

  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)

  const showToast = (msg: string) => alert(msg)

  // ================= CONNECT + FETCH USER PROFILE =================
  useEffect(() => {
    const init = async () => {
      if (!address) await connect()

      if (address && signer) {
        try {
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERPROFILE_ADDRESS!,
            UserProfile.abi,
            signer
          )
          const { 0: roleNumber, 1: usernameFromChain, 2: isRegistered } = await contract.getUser(address)
          if (isRegistered) {
            const roleMap: Record<number, string> = { 1: "Buyer", 2: "Farmer", 3: "Logistics" }
            setRole(roleMap[Number(roleNumber)] || "Unknown")
            setUsername(usernameFromChain)
            setIsLoggedIn(true)
          } else {
            router.push("/")
          }
        } catch (err) {
          console.error(err)
          alert("Gagal fetch user profile")
        }
      }
    }
    init()
  }, [address, signer])

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product")
        const data = await res.json()
        setProducts(data || [])
      } catch (err) {
        console.error(err)
        showToast("Gagal fetch products")
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  const openModal = (product: any) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  if (loadingProducts) return <div className="text-center py-10">Loading products...</div>

  return (
    <motion.div
      className="flex flex-col min-h-screen p-4 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >

      {/* ================= NAV ================= */}
      <nav className="flex justify-between items-center mb-4 relative">
        <h1 className="text-2xl font-bold tracking-tight">Brewify.co</h1>

        {!isLoggedIn && (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:opacity-80 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : address ? "Connected" : "Connect Wallet"}
          </button>
        )}

        {isLoggedIn && role && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const roleRouteMap: Record<string, string> = { Buyer: "/buyer", Farmer: "/farmer", Logistics: "/logistic" }
                router.push(roleRouteMap[role])
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-700 cursor-pointer"
            >
              Dashboard {role}
            </button>

            <button
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-12 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
                >
                  <div className="px-4 py-3 border-b">
                    <p className="text-md">{username || "User"}</p>
                    <p className="text-xs text-gray-500">Role: {role}</p>
                  </div>

                  <button
                    onClick={() => {
                      disconnect()
                      setIsLoggedIn(false)
                      setRole(null)
                      setUsername(null)
                      setMenuOpen(false)
                      router.push("/")
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search coffee..."
          className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* ============== MAIN LAYOUT ============== */}
      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {/* ----------- SIDEBAR FILTER ----------- */}
        <div className="w-full md:w-1/4 space-y-6 sticky top-4 self-start">
          <div>
            <p className="uppercase text-gray-500 text-xs font-semibold mb-2">Filter by Type</p>
            <div className="flex flex-col gap-2">
              {productTypes.map(type => (
                <label key={type} className="flex items-center rounded-md p-2 cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="mr-2 w-4 h-4 accent-indigo-500" />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="uppercase text-gray-500 text-xs font-semibold mb-2">Process</p>
            <div className="flex flex-col gap-2">
              {processTypes.map(process => (
                <label key={process} className="flex items-center rounded-md p-2 cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="mr-2 w-4 h-4 accent-indigo-500" />
                  <span className="text-sm">{process}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ----------- PRODUCT LIST ----------- */}
        <motion.div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <motion.div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition h-fit overflow-hidden"
              onClick={() => openModal(product)}
            >
              <img src={`https://gateway.pinata.cloud/ipfs/${product.imageCid}`} className="w-full h-40 object-cover rounded-md mb-3" alt={product.name} />
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500">{product.origin}</p>
              <p className="mt-2 font-bold">{product.priceEth} ETH</p>
            </motion.div>

          ))}
        </motion.div>
      </div>

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} product={selectedProduct} />
    </motion.div>
  )
}

export default Home
