import React, { useEffect, useState } from 'react'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import { fetchOrdersById, fetchProducts } from '../utils/api'
import { errorLog, log } from '../utils/log'
import Loading from '../components/Loading';
import NavBar from '../components/NavBar'
import { useParams } from 'react-router-dom'
import AboutCard from '../components/AboutCard';
import Footer from '../components/Footer';

export default function OrderDetails() {
  const { orderId } = useParams()
  const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
  const [order, setOrder] = useState({})
  const [loading, setLoading] = useState(true)
  const [productsList, setProductsList] = useState([])

  // get orders from server
  const getOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchOrdersById()

      // find the order by id in the url
      const findOrder = data.find(order => order._id === orderId)

      setOrder(findOrder)
    } catch (error) {
      errorLog("Error in getOrders", error)
      notyf.error("Something went wrong. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const getProducts = async () => {
    try {
      const data = await fetchProducts()
      setProductsList(data)
    } catch (error) {
      errorLog("Error in getProducts", error)
      notyf.error("Something went wrong. Please try again later.")
    }
  }

  useEffect(() => {
    const run = async () => {
      await getOrders()
      await getProducts()
    }
    run()
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex flex-col font-montserrat">
      <NavBar />

      <div className="flex-1 flex flex-col items-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] dark:text-neutral-100 mb-10 tracking-tight">
          Order Details
        </h1>

        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7 max-w-3xl w-full">
          {/* Order Info */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="text-xs font-semibold text-[#c1a875] mb-2">Order ID</div>
              <div className="text-sm font-mono break-all mb-2 dark:text-neutral-300">{order._id}</div>
              <div className="text-xs font-semibold text-[#c1a875]">Order Date</div>
              <div className="text-sm mb-2 dark:text-neutral-300">{new Date(order.createdAt).toLocaleString("en-GB")}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#c1a875]">Status</div>
              <div className="font-bold text-base mb-2">
                <span className={`capitalize ${order.status === "pending" ? "text-yellow-500" : order.status === "completed" ? "text-green-500" : "text-gray-800 dark:text-neutral-100"}`}>
                  {order.status.replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#c1a875]">Payment Method</div>
              <div className="text-sm capitalize dark:text-neutral-300">{order.paymentMethod.replace(/\b\w/g, l => l.toUpperCase())}</div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <div className="text-xs font-semibold text-[#c1a875] mb-2">Shipping Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div>
                <div className="text-sm dark:text-neutral-300"><span className="font-bold">Name:</span> {order.shippingAddress.name.replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div className="text-sm dark:text-neutral-300"><span className="font-bold">Email:</span> {order.shippingAddress.email}</div>
                <div className="text-sm dark:text-neutral-300"><span className="font-bold">Phone:</span> {order.shippingAddress.phone}</div>
              </div>
              <div>
                <div className="text-sm dark:text-neutral-300"><span className="font-bold">Address:</span></div>
                <div className="text-sm dark:text-neutral-300">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zip}, {order.shippingAddress.country}</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="text-xs font-semibold text-[#c1a875] mb-2">Items</div>
            <div className="flex flex-col gap-5">
              {order.orderItems.map((item) => {
                const product = productsList.find(product => product._id === item.itemId)
                return (
                  <div key={`${item._id}-${item.size}`} className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-3">
                    <img src={product ? product.image : ""} alt={product ? product.title : "Unknown"} className="w-20 h-20 object-cover rounded-lg border dark:border-neutral-600" />
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-[#1a1a1a] dark:text-neutral-100">{product ? product.title.replace(/\b\w/g, l => l.toUpperCase()) : "Unknown"}</div>
                      <div className="text-sm text-gray-600 dark:text-neutral-300">Size: <span className="font-bold">{item.selectedSize?.toUpperCase()}</span></div>
                      <div className="text-sm text-gray-600 dark:text-neutral-300">Quantity: <span className="font-bold">{item.selectedQuantity}</span></div>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <div className="text-xs text-gray-400 dark:text-neutral-400">Unit Price</div>
                      <div className="font-bold text-[#1a1a1a] dark:text-neutral-100">${item.itemPricePerUnit.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 dark:text-neutral-400">Total</div>
                      <div className="font-bold text-[#c1a875]">${(item.itemPricePerUnit * item.selectedQuantity).toFixed(2)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Total Price */}
          <div className="flex justify-end mt-4">
            <div className="text-lg font-bold dark:text-neutral-100">
              Total: <span className="text-[#c1a875]">${order.orderItems.reduce((acc, item) => acc + item.itemPricePerUnit * item.selectedQuantity, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <AboutCard />

      {/* Footer */}
      <Footer />
    </div>
  )
}