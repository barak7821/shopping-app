import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Loading from "../components/Loading";
import { deleteProductById, fetchProducts } from "../utils/api";
import { errorLog, log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { useAdminAuth } from "../utils/AdminAuthContext";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: number
  image: string
  title: string
  price: number
  category: string
}

function getPageNumbers(totalPages: number, currentPage: number) {
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let last: number | null = null

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i)
    }
  }

  for (const page of range) {
    if (last !== null) {
      if (page - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (page - last > 2) {
        rangeWithDots.push("...")
      }
    }
    rangeWithDots.push(page)
    last = page
  }

  return rangeWithDots
}

export default function Products() {
  const nav = useNavigate()
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const [productsList, setProductsList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const { token } = useAdminAuth()

  const getProducts = async () => {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProductsList(data)
      log("Products:", data)
    } catch (error) {
      errorLog("Error in getProducts", error)
      notyf.error("Something went wrong. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProducts()
  }, [])

  const totalPages = Math.ceil(productsList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentProducts = productsList.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeleteBtn = async (productId: number) => {
    if (!token) {
      notyf.error("You must be logged in to delete products.")
      return
    }

    try {
      const data = await deleteProductById(productId) // Call API to delete product

      const updatedProducts = currentProducts.filter(product => product._id !== productId) // Update local state
      setProductsList(updatedProducts) // Save updated list to state

      log(`Deleted product ID ${productId}:`, data)
      notyf.success(`Product ID: ${productId} deleted successfully.`)
    } catch (error) {
      errorLog("Error in handleEditBtn", error)
      notyf.error("Something went wrong. Please try again later.")
    }
  }

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
      {/* Sidebar + Main */}
      <div className="flex flex-1 w-full max-w-[1400px] mx-auto gap-10 pt-10 pb-20 px-6">

        {/* Sidebar */}
        <SideBar />

        {/* Products Table */}
        <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-8 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
              Products
            </h1>
            <button onClick={() => nav("/products/add")} className="px-6 py-2 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
              + Add Product
            </button>
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
                {currentProducts.map((product) => (
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
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                      {product.category}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                      <div className="flex items-center gap-3">
                        <button onClick={() => nav(`/products/edit/${product._id}`)} title="Edit" className="p-2 rounded-full hover:bg-[#c1a875]/10 text-[#c1a875] transition cursor-pointer">
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteBtn(product._id)} title="Delete" className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 transition cursor-pointer">
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a2 2 0 012-2h0a2 2 0 012 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 gap-2">

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
                : <button key={`page-${page}`} onClick={() => handlePageChange(page as number)} className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${currentPage === page
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

        </div>
      </div>
    </div>
  )
}
