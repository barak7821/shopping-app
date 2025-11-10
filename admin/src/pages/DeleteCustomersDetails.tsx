import { useEffect, useState } from "react"
import SideBar from "../components/SideBar"
import { useParams } from "react-router-dom"
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import Loading from "../components/Loading";
import { getDeletedUserById } from "../utils/api";

interface User {
  _id: string
  name: string
  email: string
  role: string
  lastLogin: string
  updatedAt: string
  deletedAt: string
  createdAt: string
  note: string
  provider: string
  city: string
  country: string
  zip: string
  phone: string
  street: string
}

export default function DeleteCustomersDetails() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { handleApiError } = useApiErrorHandler()
  const { id } = useParams()

  useEffect(() => {
    const fetchUserById = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await getDeletedUserById(id)
        setUser(data)
      } catch (error) {
        handleApiError(error as ApiError, "fetchUserById")
      } finally {
        setLoading(false)
      }
    }

    fetchUserById()
  }, [])

  const dateFormat = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB")
  }

  if (loading) {
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
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
      {/* Sidebar + Main */}
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10">
          {/* Header */}
          <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 mb-10 tracking-tight">
            Customer Details
          </h1>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#c1a875] mb-1">Name</label>
              <input value={user?.name} id="name" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#c1a875] mb-1">Email</label>
              <input value={user?.email} id="email" type="email" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[#c1a875] mb-1">Role</label>
              <input value={user?.role} id="role" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Provider */}
            <div>
              <label htmlFor="provider" className="block text-sm font-semibold text-[#c1a875] mb-1">Provider</label>
              <input value={user?.provider} id="provider" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Last Login */}
            <div>
              <label htmlFor="lastLogin" className="block text-sm font-semibold text-[#c1a875] mb-1">Last Login</label>
              <input value={dateFormat(user?.lastLogin || user?.createdAt || "")} id="lastLogin" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Register Date */}
            <div>
              <label htmlFor="registerDate" className="block text-sm font-semibold text-[#c1a875] mb-1">Register Date</label>
              <input value={dateFormat(user?.createdAt || "")} id="registerDate" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Last Update */}
            <div>
              <label htmlFor="lastUpdated" className="block text-sm font-semibold text-[#c1a875] mb-1">Last Updated</label>
              <input value={dateFormat(user?.updatedAt || "")} id="lastUpdated" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Delete On */}
            <div>
              <label htmlFor="deletedAt" className="block text-sm font-semibold text-[#c1a875] mb-1">Deleted Data</label>
              <input value={dateFormat(user?.deletedAt || "")} id="deletedAt" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="street" className="block text-sm font-semibold text-[#c1a875] mb-1">Street</label>
              <input value={user?.street} id="street" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-[#c1a875] mb-1">City</label>
              <input value={user?.city} id="city" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-[#c1a875] mb-1">Country</label>
              <input value={user?.country} id="country" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zip" className="block text-sm font-semibold text-[#c1a875] mb-1">Zip Code</label>
              <input value={user?.zip} id="zip" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[#c1a875] mb-1">Phone</label>
              <input value={user?.phone} id="phone" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}