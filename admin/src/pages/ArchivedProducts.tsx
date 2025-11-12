import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { fetchArchivedProducts, restoreArchivedProduct } from "../utils/api";
import { log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { useAdminAuth } from "../utils/AdminAuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import TableLoadingSkeleton from "../components/TableLoadingSkeleton";
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import { type Product } from "../utils/types";
import getPageNumbers from "../utils/getPageNumbers";

export default function ArchivedProducts() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const nav = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [productsList, setProductsList] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(1) // Total number of pages for pagination
    const [updatingRestore, setUpdatingRestore] = useState(false)
    const { token } = useAdminAuth()
    const { handleApiError } = useApiErrorHandler()

    // Get query params and set default values
    const currentPage = Math.max(1, +(searchParams.get("page") || 1))

    const getArchivedProducts = async (signal?: AbortSignal) => {
        const query = { page: currentPage }

        setLoading(true)
        try {
            const data = await fetchArchivedProducts(query, { signal })
            if (signal?.aborted) return // If the request was aborted, return early
            setProductsList(data.items)
            setTotalPages(Math.max(1, data.totalPages || 1))
        } catch (error) {
            if ((error as any)?.response?.data?.code === "page_not_found") {
                nav("/archivedProducts", { replace: true })
                return
            }
            handleApiError(error as ApiError, "getArchivedProducts")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        getArchivedProducts(controller.signal)
        return () => controller.abort()
    }, [searchParams])

    const handlePageChange = (nextPage: number) => {
        const safe = Math.min(Math.max(1, nextPage), totalPages) // Safeguard against invalid page numbers like negative or greater than total pages
        setSearchParams(prev => {
            const params = new URLSearchParams(prev)
            params.set("page", String(safe))
            return params
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleRestoreBtn = async (productId: number) => {
        if (!token) {
            notyf.error("You must be logged in to delete products.")
            return
        }

        setUpdatingRestore(true)
        try {
            const data = await restoreArchivedProduct(productId.toString())

            const updatedProducts = productsList.filter(product => product._id !== productId) // Update local state
            setProductsList(updatedProducts) // Save updated list to state

            log(`Restored product ID ${productId}:`, data)
            notyf.success(`Product restored successfully.`)
        } catch (error) {
            handleApiError(error as ApiError, "handleRestoreBtn")
        } finally {
            setUpdatingRestore(false)
        }
    }

    if (loading) {
        return (
            <TableLoadingSkeleton />
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            {/* Sidebar + Main */}
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

                {/* Sidebar */}
                <SideBar />

                {/* Products Table */}
                <div className="flex-1 min-w-0 overflow-hidden bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
                            Archived Products
                        </h1>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-[#eee] dark:border-neutral-700">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f5f2ee] dark:bg-neutral-700/40">
                                <tr>
                                    {["Image", "Name", "Price", "Category", "Actions"].map((title) => (
                                        <th key={title} className="px-6 py-3 text-sm font-semibold text-[#c1a875] uppercase tracking-wide">
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Products */}
                                {productsList.map((product) => (
                                    <tr key={product._id} className="hover:bg-[#faf8f6] dark:hover:bg-neutral-700/60 transition">
                                        {/* Image */}
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <img src={product.image} alt={product.title} className="w-16 h-16 rounded-lg object-cover border border-[#f2e8db] dark:border-neutral-600 shadow-sm" />
                                        </td>

                                        {/* Title */}
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 font-medium">
                                            {product.title}
                                        </td>

                                        {/* Price */}
                                        <td className={`px-6 py-4 border-t border-[#eee] dark:border-neutral-700 ${product.onSale === true ? "text-[#c1a875] font-semibold" : "text-[#232323] dark:text-neutral-200"}`}>
                                            {product.onSale ? `$${(product.price * (1 - product.discountPercent / 100)).toFixed(2)} (On sale)` : `$${product.price}`}
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                                            {product.category}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => nav(`/archivedProducts/edit/${product._id}`)} title="Edit" className="p-2 rounded-full hover:bg-[#c1a875]/10 text-[#c1a875] transition cursor-pointer">
                                                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleRestoreBtn(product._id)} disabled={updatingRestore} title="Restore" className="p-2 rounded-full hover:bg-[#c1a875]/10 text-[#c1a875] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                                                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                        <path d="M12 21V12l3 3.333M12 12l-3 3.333" strokeLinejoin="round" />
                                                        <path d="M20.5 7v6c0 3.771 0 5.657-1.172 6.828C18.157 21 16.271 21 12.5 21h-1M3.5 7v6c0 3.771 0 5.657 1.172 6.828.705.705 1.668.986 3.144 1.098" />
                                                        <path d="M12 3H4c-1 0-1.5 0-1.707.293C2 3.586 2 4.057 2 5s0 .414.293.707C2.586 7 3.057 7 4 7h16c.943 0 1.414 0 1.707-.293C22 6.414 22 5.943 22 5s0-.414-.293-.707C21.414 3 20.943 3 20 3h-4" />
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