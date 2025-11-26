"use client"
import React, { useState } from "react"
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

// Dummy Data
const orders = [
  { id: 1, name: "Batch Arabica Kintamani #A1", origin: "Kintamani, Bali", process: "Natural", priceEth: 0.015, quantity: 10, status: "Arrived" },
  { id: 2, name: "Batch Robusta Temanggung #R7", origin: "Temanggung, Central Java", process: "Washed", priceEth: 0.01, quantity: 5, status: "Arrived" },
  { id: 3, name: "Batch Geisha Papua #G5", origin: "Wamena, Papua", process: "Washed", priceEth: 0.045, quantity: 2, status: "On The Way" },
]

// Status Styles
const statusStyles: Record<string, { color: string; glow?: string; blink?: boolean }> = {
  "Awaiting Shipment": { color: "bg-yellow-400", glow: "shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]", blink: true },
  "On The Way": { color: "bg-blue-400", glow: "shadow-[0_0_6px_2px_rgba(59,130,246,0.5)]" },
  Arrived: { color: "bg-green-500", glow: "shadow-[0_0_6px_2px_rgba(34,197,94,0.5)]" },
}

const BuyerPage = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null)

  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleConfirmClick = (order: any) => {
    setSelectedOrder(order)
    setModalOpen(true)
    setPaymentSuccess(null)
    setProcessing(false)
  }

  const handlePayment = async () => {
    setProcessing(true)
    // Simulate payment delay
    setTimeout(() => {
      setProcessing(false)
      setPaymentSuccess(true) // bisa diganti random true/false
    }, 2000)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedOrder(null)
    setPaymentSuccess(null)
  }

  return (
    <div className="p-4 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span className="cursor-pointer text-sm font-medium">Kembali</span>
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search your purchased coffee..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
          <thead className="bg-gray-100 text-left font-light text-sm">
            <tr>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Nama Batch</th>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Origin</th>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Process</th>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Harga (ETH)</th>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Qty</th>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Status</th>
              <th className="text-gray-400 p-3 border font-medium border-gray-300">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">No orders found.</td>
              </tr>
            )}

            {filteredOrders.map(order => {
              const style = statusStyles[order.status] || { color: "bg-gray-400" }
              return (
                <tr key={order.id} className={`text-sm border border-gray-300`}>
                  <td className="p-3 border border-gray-300 font-medium">{order.name}</td>
                  <td className="p-3 border border-gray-300">{order.origin}</td>
                  <td className="p-3 border border-gray-300">{order.process}</td>
                  <td className="p-3 border border-gray-300 font-semibold">{order.priceEth} ETH</td>
                  <td className="p-3 border border-gray-300">{order.quantity}</td>

                  <td className="p-3 border border-gray-300">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${style.color} ${style.glow} ${style.blink ? "animate-blink" : ""}`}></span>
                    <span className="align-middle">{order.status}</span>
                  </td>

                  <td className="p-3 border border-gray-300">
                    {order.status === "Arrived" ? (
                      <button
                        onClick={() => handleConfirmClick(order)}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer"
                      >
                        Confirm
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No action</span>
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
        {modalOpen && selectedOrder && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-opacity-40 backdrop-blur-sm"></div>

            <motion.div
              className="bg-white border border-gray-300 p-6 rounded-xl w-80 flex flex-col gap-4 z-10"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {!processing && paymentSuccess === null && (
                <>
                  <h2 className="text-lg font-bold">Confirm Payment</h2>
                  <p>Are you sure you want to release ETH for <span className="font-medium">{selectedOrder.name}</span>?</p>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Cancel</button>
                    <button onClick={handlePayment} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Confirm</button>
                  </div>
                </>
              )}

              {processing && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="animate-spin text-gray-700" size={32} />
                  <span>Processing payment...</span>
                </div>
              )}

              {!processing && paymentSuccess !== null && (
                <div className="flex flex-col items-center gap-2 py-4">
                  {paymentSuccess ? <CheckCircle className="text-green-600" size={32} /> : <XCircle className="text-red-600" size={32} />}
                  <span>{paymentSuccess ? "Payment successful!" : "Payment failed."}</span>
                  <button onClick={closeModal} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Close</button>
                </div>
              )}
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

export default BuyerPage
