"use client"
import { useEffect, useState } from "react"
import SideBar from "@/app/components/SideBar"
import { useApiErrorHandler, type ApiError } from "@/app/hooks/useApiErrorHandler";
import Loading from "@/app/components/Loading";
import { getOrderByOrderNumber, getProductsByIds, resendOrderReceipt, updateOrderStatusById } from "@/app/services/apiClient";
import { log } from "@/app/lib/logger";
import { type Order } from "@/app/types/types";
import { useNotyf } from "@/app/hooks/useNotyf";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function OrderDetails() {
    const notyf = useNotyf()
    const [loading, setLoading] = useState(true)
    const { handleApiError } = useApiErrorHandler()
    const params = useParams()
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id
    const [order, setOrder] = useState<Order | null>(null)
    const [productsList, setProductsList] = useState<any[]>([])
    const [newStatus, setNewStatus] = useState("")
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [statusPendingConfirmation, setStatusPendingConfirmation] = useState<string | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [resendEmail, setResendEmail] = useState("")
    const [isSendingReceipt, setIsSendingReceipt] = useState(false)

    const fetchOrderAndProducts = async () => {
        if (!id) return
        setLoading(true)

        try {
            const orderData = await getOrderByOrderNumber(id)
            setOrder(orderData)

            const productIds = orderData.orderItems.map((item: { itemId: any; }) => item.itemId)
            if (productIds.length > 0) {
                const productData = await getProductsByIds(productIds)
                setProductsList(productData)
            }
        } catch (error) {
            handleApiError(error as ApiError, "fetchOrderAndProducts")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrderAndProducts()
    }, [id])

    const handleUpdateStatus = () => {
        if (!order) return
        if (!newStatus || newStatus === order.status) {
            notyf?.error("Please select a new status!")
            return
        }
        if (newStatus === "delivered" || newStatus === "cancelled") {
            setStatusPendingConfirmation(newStatus)
            setShowConfirmModal(true)
            return
        }

        updateOrderStatus(newStatus)
    }

    const updateOrderStatus = async (statusToUpdate: string) => {
        if (!order) return

        setIsUpdatingStatus(true)
        try {
            const data = await updateOrderStatusById(order._id, statusToUpdate)
            log(data)

            setOrder(prev => prev ? { ...prev, status: statusToUpdate } : prev)
            setNewStatus("")
            notyf?.success("Status updated successfully!")
        } catch (error) {
            handleApiError(error as ApiError, "handleUpdateStatus")
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleConfirmStatusUpdate = () => {
        if (!statusPendingConfirmation) return
        setShowConfirmModal(false)
        setStatusPendingConfirmation(null)
        updateOrderStatus(statusPendingConfirmation)
    }

    const handleCancelConfirmation = () => {
        setShowConfirmModal(false)
        setStatusPendingConfirmation(null)
    }

    const handleResendReceipt = async () => {
        if (!order) return
        const trimmedEmail = resendEmail.trim()
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            notyf?.error("Please enter a valid email address")
            return
        }

        setIsSendingReceipt(true)
        try {
            await resendOrderReceipt(order._id, trimmedEmail || undefined)
            notyf?.success("Receipt sent successfully!")
            setResendEmail("")
        } catch (error) {
            handleApiError(error as ApiError, "handleResendReceipt")
        } finally {
            setIsSendingReceipt(false)
        }
    }

    if (loading || !order) {
        return (
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                {/* Sidebar + Main */}
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

                    {/* Sidebar */}
                    <SideBar />

                    {/* Main Content */}
                    <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10">

                        <Loading />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                {/* Sidebar + Main */}
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                    {/* Sidebar */}
                    <SideBar />

                    {/* Main Content */}
                    <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10 flex flex-col gap-10">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-[#eee] dark:border-neutral-700 pb-6">
                            <div>
                                <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
                                    Order Details
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                                    Order Number: <span className="font-mono">{order.orderNumber}</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                                    User ID: <span className="font-mono">{order.userId}</span>
                                    <Link href={`/customers/edit/${order.userId}`} className="text-[#c1a875] ml-2 hover:underline">View User</Link>
                                </p>
                            </div>
                            {order.status !== "delivered" && order.status !== "cancelled" &&
                                <div className="flex items-center gap-4">
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="rounded-xl border border-gray-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-sm font-semibold text-[#1a1a1a] dark:text-neutral-100 px-4 py-2 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-pointer">
                                        <option value="" disabled>Select Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <button onClick={handleUpdateStatus} disabled={isUpdatingStatus} className="px-6 py-2 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                                        Update Status
                                    </button>
                                </div>}
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Shipping Info */}
                            <div className="bg-[#faf8f6] dark:bg-neutral-700/60 rounded-xl p-6 border border-[#eee] dark:border-neutral-700 shadow-sm">
                                <h2 className="text-xl font-semibold text-[#c1a875] mb-4">
                                    Shipping Information
                                </h2>
                                <div className="space-y-2 text-sm text-[#1a1a1a] dark:text-neutral-100">
                                    <p><span className="font-semibold">Name:</span> {order.shippingAddress.name}</p>
                                    <p><span className="font-semibold">Email:</span> {order.shippingAddress.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {order.shippingAddress.phone}</p>
                                    <p><span className="font-semibold">Address:</span> {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                                    <p><span className="font-semibold">Zip:</span> {order.shippingAddress.zip}</p>
                                    <p><span className="font-semibold">Country:</span> {order.shippingAddress.country}</p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-[#faf8f6] dark:bg-neutral-700/60 rounded-xl p-6 border border-[#eee] dark:border-neutral-700 shadow-sm">
                                <h2 className="text-xl font-semibold text-[#c1a875] mb-4">
                                    Payment & Order Info
                                </h2>
                                <div className="space-y-2 text-sm text-[#1a1a1a] dark:text-neutral-100">
                                    <p><span className="font-semibold">Payment Method:</span> {order.paymentMethod.replace(/\b\w/g, l => l.toUpperCase())}</p>
                                    <p><span className="font-semibold">Status:</span>
                                        <span className={`ml-2 font-bold ${order.status === "delivered" ? "text-green-600" :
                                            order.status === "cancelled" ? "text-red-500" : "text-[#c1a875]"}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </p>
                                    <p><span className="font-semibold">Created At:</span> {new Date(order.createdAt).toLocaleString("en-GB")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Receipt */}
                        <div className="bg-[#faf8f6] dark:bg-neutral-700/60 rounded-xl p-6 border border-[#eee] dark:border-neutral-700 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#c1a875] mb-2">
                                Receipt
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-neutral-300 mb-4">
                                Resend the receipt to the user. Leave email empty to use the default order email.
                            </p>
                            <div className="flex flex-col md:flex-row gap-3 md:items-center">
                                <input type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} placeholder={`Email (default: ${order.shippingAddress.email || order.userEmail || "not set"})`} className="flex-1 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-[#1a1a1a] dark:text-neutral-100 px-4 py-2 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                                <button onClick={handleResendReceipt} disabled={isSendingReceipt} className="px-6 py-2 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                                    {isSendingReceipt ? "Sending..." : "Send Receipt"}
                                </button>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <h2 className="text-xl font-semibold text-[#c1a875] mb-4">Order Items</h2>
                            <div className="overflow-x-auto border border-[#eee] dark:border-neutral-700 rounded-xl">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="bg-[#f5f2ee] dark:bg-neutral-700/40">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-[#c1a875] uppercase tracking-wide">Image</th>
                                            <th className="px-6 py-3 text-left font-semibold text-[#c1a875] uppercase tracking-wide">Product</th>
                                            <th className="px-6 py-3 text-left font-semibold text-[#c1a875] uppercase tracking-wide">Size</th>
                                            <th className="px-6 py-3 text-left font-semibold text-[#c1a875] uppercase tracking-wide">Quantity</th>
                                            <th className="px-6 py-3 text-left font-semibold text-[#c1a875] uppercase tracking-wide">Unit Price</th>
                                            <th className="px-6 py-3 text-left font-semibold text-[#c1a875] uppercase tracking-wide">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.orderItems.map((item) => {
                                            const product = productsList.find(p => p._id === item.itemId)
                                            return (
                                                <tr key={item._id} className="hover:bg-[#faf8f6] dark:hover:bg-neutral-700/60 transition">
                                                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                                        <img src={product?.image} alt={product?.title} className="w-16 h-16 object-cover rounded-lg border border-[#eee] dark:border-neutral-600" />
                                                    </td>
                                                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#1a1a1a] dark:text-neutral-100 font-medium">
                                                        {product?.title || "Unknown Product"}
                                                    </td>
                                                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#1a1a1a] dark:text-neutral-100 font-medium">
                                                        {item.selectedSize?.toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#1a1a1a] dark:text-neutral-100 font-medium">
                                                        {item.selectedQuantity}
                                                    </td>
                                                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#1a1a1a] dark:text-neutral-100 font-medium">
                                                        ${item.itemPricePerUnit.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 font-semibold text-[#c1a875]">
                                                        ${(item.itemPricePerUnit * item.selectedQuantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total */}
                            <div className="flex justify-end mt-6 pr-4">
                                <p className="text-lg font-bold dark:text-neutral-100">
                                    Total:{" "}
                                    <span className="text-[#c1a875]">
                                        ${order.orderItems.reduce((acc, item) => acc + item.itemPricePerUnit * item.selectedQuantity, 0).toFixed(2)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showConfirmModal &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-neutral-100 mb-2">
                            Confirm Status Change
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            Are you sure you want to mark this order as{" "}
                            <span className="font-semibold text-[#c1a875]">
                                {statusPendingConfirmation?.toUpperCase()}
                            </span>
                            ?
                        </p>
                        <div className="flex justify-end gap-3 pt-6">
                            <button type="button" onClick={handleCancelConfirmation} className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 text-sm font-semibold text-neutral-600 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer">
                                Cancel
                            </button>
                            <button type="button" onClick={handleConfirmStatusUpdate} className="px-4 py-2 rounded-xl bg-[#c1a875] text-sm font-semibold text-[#1a1a1a] hover:bg-[#b39563] transition cursor-pointer">
                                Yes, update
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
