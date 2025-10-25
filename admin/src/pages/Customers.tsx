import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Loading from "../components/Loading";
import { useAdminAuth } from "../utils/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from "../utils/log";
import { deleteUserById, fetchUsers } from "../utils/api";

interface User {
  _id: number
  name: string
  email: string
  role: string
  lastLogin: string
  createdAt: string
  provider: string
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

export default function Customers() {
  const nav = useNavigate()
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const [usersList, setUsersList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const { token } = useAdminAuth()

  const getUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchUsers()
      setUsersList(data)
      log("Users:", data)
    } catch (error) {
      errorLog("Error in getUsers", error)
      notyf.error("Something went wrong. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  const totalPages = Math.ceil(usersList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUsers = usersList.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeleteBtn = async (userId: number, email: string) => {
    if (!token) {
      notyf.error("You must be logged in to delete products.")
      return
    }

    try {
      const data = await deleteUserById(userId) // Call API to delete product

      const updatedUsers = currentUsers.filter(user => user._id !== userId) // Update local state
      setUsersList(updatedUsers) // Save updated list to state

      log(`Deleted user ID ${userId}:`, data)
      notyf.success(`User ${email} deleted successfully.`)
    } catch (error) {
      errorLog("Error in handleDeleteBtn", error)
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
      <div className="flex flex-1 w-full mx-auto gap-12 pt-8 pb-20 px-4">


        {/* Sidebar */}
        <SideBar />

        {/* Products Table */}
        <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-8 flex flex-col">

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
                  {["Name", "Email", "Role", "Last Login", "Register Date", "Provider", "Actions"].map((title) => (
                    <th key={title} className="px-6 py-3 text-sm font-semibold text-[#c1a875] uppercase tracking-wide">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Users */}
                {currentUsers.map((user) => (
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

                    {/* Last Login */}
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                      {new Date(user.lastLogin).toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Register Date */}
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                      {new Date(user.createdAt).toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Provider */}
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700 text-[#232323] dark:text-neutral-200 capitalize">
                      {user.provider}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                      <div className="flex items-center gap-3">
                        <button onClick={() => nav(`/customers/edit/${user._id}`)} title="Edit" className="p-2 rounded-full hover:bg-[#c1a875]/10 text-[#c1a875] transition cursor-pointer">
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteBtn(user._id, user.email)} title="Delete" className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 transition cursor-pointer">
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
