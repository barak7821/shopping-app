import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { errorLog, log } from '../utils/log'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import { fetchOrdersByQuery, fetchProductsByIds } from '../utils/api'
import Loading from '../components/Loading';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AboutCard from '../components/AboutCard';
import Footer from '../components/Footer';
import { useApiErrorHandler } from '../utils/useApiErrorHandler'

function getPageNumbers(totalPages, currentPage) {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let last = null

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i)
        }
    }

    for (let i of range) {
        if (last) {
            if (i - last === 2) {
                rangeWithDots.push(last + 1)
            } else if (i - last > 2) {
                rangeWithDots.push("...")
            }
        }
        rangeWithDots.push(i)
        last = i
    }

    return rangeWithDots
}

export default function Orders() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
    const [searchParams, setSearchParams] = useSearchParams()
    const [ordersList, setOrdersList] = useState([])
    const [productsList, setProductsList] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(1)
    const { handleApiError } = useApiErrorHandler()

    const currentPage = Math.max(1, +(searchParams.get("page") || 1))

    // get orders from server
    const getOrders = async (signal) => {
        const query = { page: currentPage }

        setLoading(true)
        try {
            const data = await fetchOrdersByQuery(query, { signal })
            if (signal.aborted) return
            setOrdersList(data.items)
            setTotalPages(Math.max(1, +data.totalPages || 1))

            const ids = data.items.map(item => item.orderItems.map(item => item.itemId)).flat()

            const products = await fetchProductsByIds(ids)
            setProductsList(products)
        } catch (error) {
            if (error?.response?.data?.code === "page_not_found") {
                nav("/collection", { replace: true })
                return
            }
            handleApiError(error, "getOrders")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        getOrders(controller.signal)
        return () => controller.abort()
    }, [searchParams])

    // Function to handle page changes in pagination
    const handlePageChange = (nextPage) => {
        const safe = Math.min(Math.max(1, nextPage), totalPages)
        setSearchParams(prev => {
            const params = new URLSearchParams(prev)
            params.set("page", String(safe))
            return params
        })
        window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top of page
    }


    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex flex-col font-montserrat">
            <NavBar />

            <div className="flex-1 flex flex-col items-center py-12 px-4">
                <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] dark:text-neutral-100 mb-2 tracking-tight">
                    My Orders
                </h1>
                <p className="text-sm md:text-lg text-[#555] font-montserrat text-center mb-10 max-w-xs md:max-w-md">
                    Track and manage your recent orders easily.
                </p>


                {/* Orders List */}
                <div className="w-full max-w-5xl flex flex-col gap-10 md:gap-12">
                    {ordersList.length === 0 ?
                        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow p-7 flex flex-col items-center">
                            <p className="text-gray-600 dark:text-neutral-300 text-lg">No orders found.</p>
                        </div>
                        : ordersList.map(item => (
                            <div key={item._id} className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 flex flex-col gap-5">
                                {/* Header - ID & Status */}
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-500 dark:text-neutral-400 font-medium">Order ID</span>
                                        <span className="font-bold text-[#232323] dark:text-neutral-100 tracking-wider text-base">{item._id}</span>
                                    </div>
                                    <div className="flex gap-7 flex-wrap">
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-neutral-400">Date</span>
                                            <div className="font-medium text-[#232323] dark:text-neutral-100">{new Date(item.createdAt).toLocaleString("en-GB")}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-neutral-400">Status</span>
                                            <div className={`font-medium ${item.status === "delivered" ? "text-green-600" : "text-[#c1a875]"}`}>
                                                {item.status.replace(/\b\w/g, l => l.toUpperCase())}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-neutral-400">Total</span>
                                            <div className="font-bold text-[#1a1a1a] dark:text-neutral-200">
                                                ${item.orderItems.reduce((acc, item) => acc + item.itemPricePerUnit * item.selectedQuantity, 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex flex-col gap-3 divide-y divide-gray-100 dark:divide-neutral-700">
                                    {item.orderItems.map(item => {
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
                                    <button onClick={() => nav(`/orders/${item._id}`)} className="px-6 py-2 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-base shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer">
                                        More Details
                                    </button>
                                </div>
                            </div>
                        ))
                    }

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">

                            {/* Prev */}
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 rounded-lg bg-[#eee] dark:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers(totalPages, currentPage).map((page, i) =>
                                page === "..."
                                    ? <span key={`dots-${i}`} className="px-3 text-[#999] dark:text-neutral-400">
                                        ...
                                    </span>
                                    : <button key={`page-${page}`} onClick={() => handlePageChange(page)} className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${currentPage === page
                                        ? "bg-[#c1a875] text-white"
                                        : "bg-[#eee] dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-200 hover:bg-[#c1a875]/30"
                                        }`}>
                                        {page}
                                    </button>
                            )}


                            {/* Next */}
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg bg-[#eee] dark:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}