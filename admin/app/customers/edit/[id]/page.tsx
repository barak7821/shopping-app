"use client"
import { useEffect, useState } from "react"
import SideBar from "@/app/components/SideBar"
import { useApiErrorHandler, type ApiError } from "@/app/hooks/useApiErrorHandler";
import Loading from "@/app/components/Loading";
import { addNoteToUser, deleteUserById, getUserById, makeAdmin, removeAdmin } from "@/app/api/apiClient";
import { type User } from "@/app/types/types";
import { useNotyf } from "@/app/hooks/useNotyf";
import { useParams, useRouter } from "next/navigation";

export default function CustomersDetails() {
  const router = useRouter()
  const params = useParams()
  const notyf = useNotyf()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingDelete, setUpdatingDelete] = useState(false)
  const { handleApiError } = useApiErrorHandler()
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id

  useEffect(() => {
    const fetchUserById = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await getUserById(id)
        setUser(data)
      } catch (error) {
        handleApiError(error as ApiError, "fetchUserById")
      } finally {
        setLoading(false)
      }
    }

    fetchUserById()
  }, [])

  const handleMakeAdmin = async () => {
    if (!id) return
    setLoading(true)

    try {
      await makeAdmin(id)
      notyf?.success("User made admin successfully!")
      router.push("/customers")
    } catch (error) {
      handleApiError(error as ApiError, "handleMakeAdmin")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async () => {
    if (!id) return
    setLoading(true)

    try {
      await removeAdmin(id)
      notyf?.success("User made admin successfully!")
      router.push("/customers")
    } catch (error) {
      handleApiError(error as ApiError, "handleRemoveAdmin")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBtn = async (userId: string, email: string, role: string) => {
    if (role === "admin") {
      notyf?.error("You can't delete an admin account.")
      return
    }

    setUpdatingDelete(true)
    try {
      await deleteUserById(userId)
      notyf?.success(`User ${email} deleted successfully.`)
      router.push("/customers")
    } catch (error) {
      handleApiError(error as ApiError, "handleDeleteBtn")
    } finally {
      setUpdatingDelete(false)
    }
  }

  const handleChangeNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    setUser({ ...user, note: e.target.value })
  }

  const handleSaveNote = async () => {
    if (!user) return
    setLoading(true)

    try {
      await addNoteToUser(user._id, user.note)
      notyf?.success("Note saved successfully!")
    } catch (error) {
      handleApiError(error as ApiError, "handleSaveNote")
    } finally {
      setLoading(false)
    }
  }

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
        <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#eee] dark:border-neutral-700 pb-6">
            <div>
              <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
                Customer Details
              </h1>
            </div>

            {/* Delete Button */}
            <button onClick={() => user && handleDeleteBtn(user._id, user.email, user.role)} disabled={updatingDelete} title="Delete" className="px-6 py-2.5 rounded-2xl font-semibold text-base transition shadow-md border bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#c1a875] hover:text-[#1a1a1a] hover:border-[#c1a875] active:scale-95 cursor-pointer">
              Delete User
            </button>
          </div>


          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 py-6">
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

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-semibold text-[#c1a875] mb-1">Note</label>
              <input onChange={handleChangeNote} value={user?.note || ""} id="note" disabled={updatingDelete} type="text" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm disabled:cursor-not-allowed disabled:opacity-60" />

              {/* Note Description */}
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 ml-2">
                Note can be used to store any additional information about the user.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex">
            {/* Save Note Button */}
            <button onClick={handleSaveNote} disabled={updatingDelete} className="px-8 py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              Save Note
            </button>
          </div>

          {user?.provider === "local" &&
            <div className="mt-auto flex flex-wrap items-center gap-4">
              <button onClick={() => user?.role === "admin" ? handleRemoveAdmin() : handleMakeAdmin()} disabled={loading} className="px-8 py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {user?.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>
            </div>}

        </div>
      </div>
    </div >
  )
}
