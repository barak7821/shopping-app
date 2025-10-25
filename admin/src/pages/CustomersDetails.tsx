import { useEffect, useState } from "react"
import SideBar from "../components/SideBar"
import { useNavigate, useParams } from "react-router-dom"
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import Loading from "../components/Loading";
import { getUserById, makeAdmin, removeAdmin } from "../utils/api";
import { log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

export default function EditCustomers() {
  const nav = useNavigate()
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [lastLogin, setLastLogin] = useState("")
  const [registerDate, setRegisterDate] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")
  const [provider, setProvider] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [zip, setZip] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [loading, setLoading] = useState(true)
  const { handleApiError } = useApiErrorHandler()
  const { id } = useParams()

  useEffect(() => {
    const fetchUserById = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await getUserById(id)
        log(data)
        setName(data.name)
        setEmail(data.email)
        setRole(data.role)
        setLastLogin(data.lastLogin)
        setRegisterDate(data.createdAt)
        setLastUpdated(data.updatedAt)
        setProvider(data.provider)
        setCity(data.city)
        setCountry(data.country)
        setZip(data.zip)
        setPhone(data.phone)
        setStreet(data.street)
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
      const data = await makeAdmin(id as string)
      log(data)
      notyf.success("User made admin successfully!")
      nav("/customers")
    } catch (error) {
      handleApiError(error as ApiError, "fetchUserById")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async () => {
    if (!id) return
    setLoading(true)

    try {
      const data = await removeAdmin(id as string)
      log(data)
      notyf.success("User made admin successfully!")
      nav("/customers")
    } catch (error) {
      handleApiError(error as ApiError, "fetchUserById")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <>
      <Loading />
    </>
  }


  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
      {/* Sidebar + Main */}
      <div className="flex flex-1 w-full mx-auto gap-12 pt-8 pb-20 px-4">

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
              <input value={name} id="name" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#c1a875] mb-1">Email</label>
              <input value={email} id="email" type="email" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[#c1a875] mb-1">Role</label>
              <input value={role} id="role" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Provider */}
            <div>
              <label htmlFor="provider" className="block text-sm font-semibold text-[#c1a875] mb-1">Provider</label>
              <input value={provider} id="provider" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Last Login */}
            <div>
              <label htmlFor="lastLogin" className="block text-sm font-semibold text-[#c1a875] mb-1">Last Login</label>
              <input value={lastLogin ? new Date(lastLogin).toLocaleString("en-GB") : new Date(registerDate).toLocaleString("en-GB")} id="lastLogin" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Register Date */}
            <div>
              <label htmlFor="registerDate" className="block text-sm font-semibold text-[#c1a875] mb-1">Register Date</label>
              <input value={new Date(registerDate).toLocaleString("en-GB")} id="registerDate" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Last Update */}
            <div>
              <label htmlFor="lastUpdated" className="block text-sm font-semibold text-[#c1a875] mb-1">Last Updated</label>
              <input value={new Date(lastUpdated).toLocaleString("en-GB")} id="lastUpdated" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="street" className="block text-sm font-semibold text-[#c1a875] mb-1">Street</label>
              <input value={street} id="street" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-[#c1a875] mb-1">City</label>
              <input value={city} id="city" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-[#c1a875] mb-1">Country</label>
              <input value={country} id="country" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zip" className="block text-sm font-semibold text-[#c1a875] mb-1">Zip Code</label>
              <input value={zip} id="zip" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[#c1a875] mb-1">Phone</label>
              <input value={phone} id="phone" type="text" disabled className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-not-allowed" />
            </div>

            {/* Button */}
            {provider === "local" && <div>
              <button onClick={() => role === "admin" ? handleRemoveAdmin() : handleMakeAdmin()} className="px-8 py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
                {role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}