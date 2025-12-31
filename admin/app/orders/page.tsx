"use client"
import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { useRouter, useSearchParams } from "next/navigation";
import { useApiErrorHandler, type ApiError } from "../hooks/useApiErrorHandler";
import { fetchOrdersByQuery } from "../services/apiClient";
import TableLoadingSkeleton from "../components/TableLoadingSkeleton";
import { type Order } from "../types/types";
import getPageNumbers from "../lib/getPageNumbers";

export default function Orders() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ordersList, setOrdersList] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const { handleApiError } = useApiErrorHandler()

  // Get query params and set default values
  const currentPage = Math.max(1, +(searchParams.get("page") || 1))

  const getOrders = async (signal?: AbortSignal) => {
    const query = { page: currentPage }

    setLoading(true)
    try {
      const data = await fetchOrdersByQuery(query, { signal })
      setOrdersList(data.items)
      setTotalPages(Math.max(1, data.totalPages || 1))
    } catch (error) {
      if ((error as any)?.response?.data?.code === "page_not_found") {
        router.replace("/orders")
        return
      }
      handleApiError(error as ApiError, "getOrders")
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    getOrders(controller.signal)
    return () => controller.abort()
  }, [searchParams])

  const handlePageChange = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(safe))
    router.replace(`/orders?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <TableLoadingSkeleton />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
              Orders
            </h1>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#eee] dark:border-neutral-700">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f5f2ee] dark:bg-neutral-700/40">
                <tr>
                  {["Order Number", "Email", "Order Date", "Payment Method", "Total", "Status", "Actions"].map((title) => (
                    <th key={title} className="px-6 py-3 text-sm font-semibold text-[#c1a875] uppercase tracking-wide">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* Orders */}
                {ordersList.length === 0
                  ? <tr className="text-center">
                    <td colSpan={6} className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200">
                      No orders found.
                    </td>
                  </tr>
                  : ordersList.map((order) => (
                    <tr key={order._id} className="hover:bg-[#faf8f6] dark:hover:bg-neutral-700/60 transition">

                      {/* Order Number */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200">
                        {order.orderNumber}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200">
                        {order.shippingAddress.email}
                      </td>

                      {/* Order Date */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {new Date(order.createdAt).toLocaleString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {order.paymentMethod}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {order.orderItems.length} items
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {order.status}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <button onClick={() => router.push(`/orders/edit/${order.orderNumber}`)} title="Edit" className="p-2 rounded-full hover:bg-[#c1a875]/10 text-[#c1a875] transition cursor-pointer">
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

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
                  </span> :
                  <button key={`page-${page}`} onClick={() => handlePageChange(page as number)} className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${currentPage === page
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
    </div>
  )
}
