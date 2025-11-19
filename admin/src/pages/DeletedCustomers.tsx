import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchDeletedUsers } from "../utils/api";
import TableLoadingSkeleton from "../components/TableLoadingSkeleton";
import { useApiErrorHandler } from "../utils/useApiErrorHandler";
import { type User } from "../utils/types";
import getPageNumbers from "../utils/getPageNumbers";

export default function DeletedCustomers() {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [usersList, setUsersList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const { handleApiError } = useApiErrorHandler()

  const currentPage = Math.max(1, +(searchParams.get("page") || 1))

  const getUsers = async (signal?: AbortSignal) => {
    const query = { page: currentPage }

    setLoading(true)
    try {
      const data = await fetchDeletedUsers(query, { signal })
      if (signal?.aborted) return
      setUsersList(data.items)
      setTotalPages(Math.max(1, data.totalPages || 1))
    } catch (error) {
      if ((error as any)?.response?.data?.code === "page_not_found") {
        nav("/deletedCustomers", { replace: true })
        return
      }
      handleApiError(error as any, "getUsers")
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    getUsers(controller.signal)
    return () => controller.abort()
  }, [searchParams])

  const handlePageChange = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages)

    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.set("page", String(safe))
      return params
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
              Customers
            </h1>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#eee] dark:border-neutral-700">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f5f2ee] dark:bg-neutral-700/40">
                <tr>
                  {["Name", "Email", "Role", "Deleted On", "Note", "Actions"].map((title) => (
                    <th key={title} className="px-6 py-3 text-sm font-semibold text-[#c1a875] uppercase tracking-wide">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Users */}
                {usersList.length === 0
                  ? <tr className="text-center">
                    <td colSpan={6} className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200">
                      No users found.
                    </td>
                  </tr>
                  : usersList.map((user) => (
                    <tr key={user._id} className="hover:bg-[#faf8f6] dark:hover:bg-neutral-700/60 transition">

                      {/* Name */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 font-medium">
                        {user.name}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {user.role}
                      </td>

                      {/* Deleted On */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {new Date(user.deletedAt).toLocaleString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Note */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                        {user.note}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <button onClick={() => nav(`/deletedCustomers/edit/${user._id}`)} title="Edit" className="p-2 rounded-full hover:bg-[#c1a875]/10 text-[#c1a875] transition cursor-pointer">
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
