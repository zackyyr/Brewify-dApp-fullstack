'use client'
import React, { useState, useEffect } from 'react'
import { ArrowLeft, MoreVertical, LayoutDashboard, Coffee } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  origin: string
  process: string
  notes?: string
  priceEth: number
  quantity: number
  timeline: { harvested: string; roasted: string; packed: string }
  imageCid: string
  slug: string
}

const DashboardFarmer = () => {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ambil wallet address dari backend atau localStorage (sesuai integrasi wallet)
        const owner = localStorage.getItem('walletAddress') || ''
        const res = await fetch(`/api/product?owner=${owner}`)
        const data = await res.json()
        setProducts(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="p-4 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center gap-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span className="cursor-pointer text-sm font-medium">Kembali</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/farmer/minting')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Coffee size={16} />
            Mint New Coffee
          </button>

          <button
            onClick={() => router.push('/farmer/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-300 cursor-pointer"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search your coffee..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const imageUrl = `https://gateway.pinata.cloud/ipfs/${product.imageCid}`
          return (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 relative">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500">{product.origin}</p>
              <p className="mt-2 font-bold">{product.priceEth} ETH</p>

              <div className="absolute top-3 right-3">
                <button
                  onClick={() =>
                    setOpenDropdownId(openDropdownId === product.id ? null : product.id)
                  }
                  className="bg-white p-1 cursor-pointer border border-gray-300 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={18} />
                </button>

                <AnimatePresence>
                  {openDropdownId === product.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                        <button
                          onClick={() => router.push(`/farmer/${product.slug}`)}
                          className="w-full text-black cursor-pointer text-left px-3 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardFarmer
