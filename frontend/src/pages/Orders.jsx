import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { errorLog, log } from '../utils/log'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import { fetchOrdersById } from '../utils/api'
import { fetchProducts } from '../utils/api';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import AboutCard from '../components/AboutCard';
import Footer from '../components/Footer';

export default function Orders() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
    const [ordersList, setOrdersList] = useState([])
    const [loading, setLoading] = useState(true)
    const [productsList, setProductsList] = useState([])

    // get orders from server
    const getOrders = async () => {
        setLoading(true)
        try {
            const data = await fetchOrdersById()
            setOrdersList(data)
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
                    My Orders
                </h1>

                {/* Orders List */}
                <div className="w-full max-w-5xl flex flex-col gap-7">
                    {ordersList.length === 0 ?
                        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow p-7 flex flex-col items-center">
                            <p className="text-gray-600 dark:text-neutral-300 text-lg">No orders found.</p>
                        </div>
                        : ordersList.map((order, index) => (
                            <div key={index} className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 flex flex-col gap-5">
                                {/* Header - ID & Status */}
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-500 dark:text-neutral-400 font-medium">Order ID</span>
                                        <span className="font-bold text-[#232323] dark:text-neutral-100 tracking-wider text-base">{order._id}</span>
                                    </div>
                                    <div className="flex gap-7 flex-wrap">
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-neutral-400">Date</span>
                                            <div className="font-medium text-[#232323] dark:text-neutral-100">{new Date(order.createdAt).toLocaleString("en-GB")}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-neutral-400">Status</span>
                                            <div className={`font-medium ${order.status === "delivered" ? "text-green-600" : "text-[#c1a875]"}`}>
                                                {order.status.replace(/\b\w/g, l => l.toUpperCase())}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-neutral-400">Total</span>
                                            <div className="font-bold text-[#1a1a1a] dark:text-neutral-200">
                                                ${order.orderItems.reduce((acc, item) => acc + item.itemPricePerUnit * item.selectedQuantity, 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex flex-col gap-3 divide-y divide-gray-100 dark:divide-neutral-700">
                                    {order.orderItems.map((item) => {
                                        const product = productsList.find(product => product._id === item.itemId)
                                        return (
                                            <div key={`${item._id}-${item.selectedSize}`} className="flex gap-4 py-3 items-center">
                                                <img src={product ? product.image : "Unknown"} alt={product ? product.title : "Unknown"} className="w-28 h-28 object-cover rounded-xl border border-[#f2e8db] dark:border-neutral-600 shadow-sm" />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-base dark:text-neutral-100">
                                                        {product ? product.title.replace(/\b\w/g, l => l.toUpperCase()) : "Unknown"}
                                                    </span>
                                                    <span className="text-xs text-gray-600 dark:text-neutral-400">Size: <b>{item.selectedSize?.toUpperCase()}</b></span>
                                                    <span className="text-xs text-gray-600 dark:text-neutral-400">Quantity: <b>{item.selectedQuantity}</b></span>
                                                    <span className="text-xs text-gray-600 dark:text-neutral-400">Price: <b>${(item.itemPricePerUnit * item.selectedQuantity).toFixed(2)}</b></span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* More Details Button */}
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={() => nav(`/orders/${order._id}`)}
                                        className="px-6 py-2 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-base shadow-md transition hover:bg-white hover:text-black active:scale-95"
                                    >
                                        More Details
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}