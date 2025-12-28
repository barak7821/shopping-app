import { useEffect, useState } from 'react'
import { fetchOrderById, fetchProductsByIdsOrders } from '../api/apiClient'
import Loading from '../components/Loading';
import NavBar from '../components/NavBar'
import { useParams } from 'react-router-dom'
import AboutCard from '../components/AboutInfoCard';
import Footer from '../components/Footer';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import type { Order, Product } from '../types/types';

export default function OrderDetails() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState<Order>({
    _id: "",
    orderNumber: "",
    createdAt: "",
    status: "",
    paymentMethod: "",
    shippingAddress: {
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      zip: "",
      country: ""
    },
    orderItems: []
  })
  const [loading, setLoading] = useState(true)
  const [productsList, setProductsList] = useState<Product[]>([])
  const { handleApiError } = useApiErrorHandler()

  // get orders from server
  const getOrders = async () => {
    if (!orderNumber) {
      return
    }

    setLoading(true)
    try {
      const data = await fetchOrderById(orderNumber) as Order
      setOrder(data)

      const products = await fetchProductsByIdsOrders(data.orderItems.map(item => item.itemId))
      setProductsList(products)
    } catch (error) {
      handleApiError(error, "getOrders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getOrders()
  }, [orderNumber])

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex flex-col font-montserrat">
      <NavBar />

      <div className="flex-1 flex flex-col items-center py-12 px-4">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] dark:text-neutral-100 mb-10 tracking-tight">
          Order Details
        </h1>

        {/* Order Card */}
        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-8 md:p-12 flex flex-col gap-8 max-w-5xl w-full">
          {/* Top Info */}
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#c1a875] font-semibold text-sm">Order Number</h3>
              <p className="text-sm dark:text-neutral-300">{order.orderNumber}</p>

              <h3 className="text-[#c1a875] font-semibold text-sm mt-4">Order Date</h3>
              <p className="text-sm dark:text-neutral-300">{new Date(order.createdAt).toLocaleString("en-GB")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[#c1a875]">Status</h3>
              <p className={`dark:text-neutral-300 ${order.status === "delivered" ? "text-green-600" : ""}`}>
                {order.status.replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <h3 className="text-sm font-semibold text-[#c1a875] mt-4">Payment Method</h3>
              <p className="text-sm dark:text-neutral-300">{order.paymentMethod.replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <h3 className="text-sm font-semibold text-[#c1a875] mb-3">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 text-sm dark:text-neutral-300">
                <p><span className="font-bold">Name:</span> {order.shippingAddress.name.replace(/\b\w/g, l => l.toUpperCase())}</p>
                <p><span className="font-bold">Email:</span> {order.shippingAddress.email}</p>
                <p><span className="font-bold">Phone:</span> {order.shippingAddress.phone}</p>
              </div>
              <div className="flex flex-col gap-1 text-sm dark:text-neutral-300">
                <p><span className="font-bold">Address:</span></p>
                <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zip}, {order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-[#c1a875] mb-3">Items</h3>
            <div className="flex flex-col gap-5">
              {productsList.map(item =>
                order.orderItems.map(orderItem => orderItem.itemId === item._id &&
                  <div key={`${item._id}-${orderItem.size}`} className="flex items-center gap-5 bg-white/70 dark:bg-neutral-700 rounded-2xl p-5 shadow-sm">
                    <img src={item?.image} alt={item?.title} className="w-24 h-24 object-cover rounded-xl border border-[#f0e6d8] dark:border-neutral-600" />
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-[#232323] dark:text-neutral-100">{item?.title}</p>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">Size: <b>{orderItem.selectedSize?.toUpperCase()}</b></p>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">Quantity: <b>{orderItem.selectedQuantity}</b></p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-500 dark:text-neutral-400">Total</p>
                      <p className="font-bold text-[#c1a875]">${(orderItem.itemPricePerUnit * orderItem.selectedQuantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              )
              }
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mt-6">
            <h3 className="text-lg font-bold dark:text-neutral-100">
              Total: <span className="text-[#c1a875]">${order.orderItems.reduce((acc, i) => acc + i.itemPricePerUnit * i.selectedQuantity, 0).toFixed(2)}</span>
            </h3>
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
