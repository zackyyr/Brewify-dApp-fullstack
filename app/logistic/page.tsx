'use client'
import React, { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ----- Dummy Orders Data -----
const initialOrders = [
  { id: 1, name: "Batch Arabica Kintamani #A1", origin: "Kintamani, Bali", process: "Natural", priceEth: 0.015, quantity: 10, status: "Awaiting Shipment" },
  { id: 2, name: "Batch Robusta Temanggung #R7", origin: "Temanggung, Central Java", process: "Washed", priceEth: 0.010, quantity: 5, status: "On The Way" },
  { id: 3, name: "Batch Geisha Papua #G5", origin: "Wamena, Papua", process: "Washed", priceEth: 0.045, quantity: 2, status: "Arrived" },
]

// ----- Status Style Mapping -----
const statusStyles: Record<string, { color: string; blink?: boolean }> = {
  "Awaiting Shipment": { color: "bg-yellow-400", blink: true },
  "On The Way": { color: "bg-blue-400" },
  "Arrived": { color: "bg-green-500" },
}

const LogisticsPage = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState(initialOrders)

  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const handleOpenDropdown = (id: number) => setDropdownOpenId(prev => (prev === id ? null : id))

  const handleSelectStatus = (order: any, status: string) => {
    setSelectedOrder(order)
    setSelectedStatus(status)
    setModalOpen(true)
    setDropdownOpenId(null)
  }

  const handleConfirmUpdate = () => {
    if (!selectedOrder || !selectedStatus) return
    setOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, status: selectedStatus } : order))
    setModalOpen(false)
    setSelectedOrder(null)
    setSelectedStatus(null)
  }

  const filteredOrders = orders.filter(order => order.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={16} />
          <span className="cursor-pointer text-sm font-medium">Kembali</span>
        </button>
        <h1 className="text-xl font-bold">Logistics Dashboard</h1>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search orders..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
          <thead className="bg-gray-100 text-left font-light text-sm">
            <tr>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Nama Batch</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Origin</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Process</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Harga (ETH)</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Qty</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && <tr><td colSpan={7} className="text-center p-4 text-gray-500">No orders found.</td></tr>}
            {filteredOrders.map(order => {
              const style = statusStyles[order.status] || { color: "bg-gray-400" }
              return (
                <tr key={order.id} className="text-sm border border-gray-300">
                  <td className="p-3 border border-gray-300 font-medium">{order.name}</td>
                  <td className="p-3 border border-gray-300">{order.origin}</td>
                  <td className="p-3 border border-gray-300">{order.process}</td>
                  <td className="p-3 border border-gray-300 font-semibold">{order.priceEth} ETH</td>
                  <td className="p-3 border border-gray-300">{order.quantity}</td>
                  <td className="p-3  border-gray-300 relative flex items-center gap-2">
                    {/* Dropdown Button with inline status indicator */}
                    <button 
                      onClick={() => handleOpenDropdown(order.id)} 
                      className="flex items-center justify-between w-40 px-3 py-2 text-sm border border-gray-300 rounded-full cursor-pointer bg-white hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${style.color} ${style.blink ? "animate-blink" : ""}`}></span>
                        {order.status}
                      </span>
                      <ChevronDown size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {dropdownOpenId === order.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-12 left-0 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-10"
                        >
                          {Object.keys(statusStyles)
                            .filter(s => s !== order.status)
                            .map(statusOption => (
                              <div key={statusOption} className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectStatus(order, statusOption)}>
                                {statusOption}
                              </div>
                            ))
                          }
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 - bg-opacity-40 backdrop-blur-sm"></div>
            <motion.div
              className="border border-gray-300 bg-white p-6 rounded-xl w-80 flex flex-col gap-4 z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-lg font-bold">Confirm Status Update</h2>
              <p>Are you sure you want to update <span className="font-medium">{selectedOrder?.name}</span> to <span className="font-medium">{selectedStatus}</span>?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button onClick={handleConfirmUpdate} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes blink { 0%,50%,100% {opacity:1;} 25%,75%{opacity:0.2;} }
        .animate-blink { animation: blink 3s infinite; }
      `}</style>
    </div>
  )
}

export default LogisticsPage
