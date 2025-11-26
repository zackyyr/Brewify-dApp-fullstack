'use client'
import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ----- Dummy Shipments -----
const initialShipments = [
  { id: 1, username: "FarmerA", product: "Batch Arabica Kintamani #A1", priceEth: 0.015, quantity: 10, status: "Awaiting Shipment" },
  { id: 2, username: "FarmerB", product: "Batch Robusta Temanggung #R7", priceEth: 0.010, quantity: 5, status: "Awaiting Shipment" },
  { id: 3, username: "FarmerC", product: "Batch Geisha Papua #G5", priceEth: 0.045, quantity: 2, status: "Packed" },
]

// ----- Status Styles -----
const statusStyles: Record<string, { color: string; glow?: string; blink?: boolean }> = {
  "Awaiting Shipment": { color: "bg-yellow-400", glow: "shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]", blink: true },
  "Packed": { color: "bg-green-500", glow: "shadow-[0_0_6px_2px_rgba(34,197,94,0.5)]" },
}

const FarmerShipment = () => {
  const router = useRouter()
  const [shipments, setShipments] = useState(initialShipments)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<any>(null)

  const handleOpenModal = (shipment: any) => {
    setSelectedShipment(shipment)
    setModalOpen(true)
  }

  const handleConfirmPacking = () => {
    if (!selectedShipment) return
    setShipments(prev =>
      prev.map(s => s.id === selectedShipment.id ? { ...s, status: "Packed" } : s)
    )
    setModalOpen(false)
    setSelectedShipment(null)
  }

  return (
    <div className="p-4 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span className="cursor-pointer text-sm font-medium">Kembali</span>
        </button>
        <h1 className="text-xl font-bold">Farmer Shipment Dashboard</h1>
      </div>

      {/* Shipments Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
          <thead className="bg-gray-100 text-left font-light text-sm">
            <tr>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Username</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Product</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Price (ETH)</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Quantity</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Status</th>
              <th className="p-3 border border-gray-300 font-medium text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(shipment => {
              const style = statusStyles[shipment.status] || { color: "bg-gray-400" }
              return (
                <tr key={shipment.id} className="text-sm border border-gray-300">
                  <td className="p-3 border border-gray-300 font-medium">{shipment.username}</td>
                  <td className="p-3 border border-gray-300">{shipment.product}</td>
                  <td className="p-3 border border-gray-300 font-semibold">{shipment.priceEth}</td>
                  <td className="p-3 border border-gray-300">{shipment.quantity}</td>
                  <td className="p-3 border border-gray-300">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${style.color} ${style.glow || ''} ${style.blink ? "animate-blink" : ""}`}></span>
                    <span className="align-middle">{shipment.status}</span>
                  </td>
                  <td className="p-3 border border-gray-300">
                    {shipment.status === "Packed" ? (
                      <span className="text-gray-400 text-xs italic">Packed</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(shipment)}
                        className={`flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer`}
                      >
                        Packing
                      </button>
                    )}
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
            {/* Backdrop blur + opacity 40% */}
            <div className="absolute inset-0 bg-opacity-40 backdrop-blur-sm"></div>

            {/* Modal content */}
            <motion.div
              className="border border-gray-300 bg-white p-6 rounded-xl w-80 flex flex-col gap-4 z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-lg font-bold">Confirm Packing</h2>
              <p>Are you sure you want to mark <span className="font-medium">{selectedShipment?.product}</span> as <span className="font-medium">Packed</span>?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button onClick={handleConfirmPacking} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">Confirm</button>
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

export default FarmerShipment
