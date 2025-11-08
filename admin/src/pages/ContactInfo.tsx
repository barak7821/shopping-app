import { useEffect, useState, type ChangeEvent } from "react";
import SideBar from "../components/SideBar";
import { log } from "../utils/log";
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import { fetchContactInfo, updateContactInfo } from "../utils/api";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import Loading from "../components/Loading";

interface ContactInfo {
    email: string
    address: string
    phone: string
    facebookUrl: string
    instagramUrl: string
    twitterUrl: string
    openingHours: string
}

export default function ContactInfo() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })

    const [contactInfoData, setContactInfoData] = useState<ContactInfo | null>(null)
    const [discardContactInfo, setDiscardContactInfo] = useState<ContactInfo | null>(null)
    const [isEnabled, setIsEnabled] = useState(false)
    const [loading, setLoading] = useState(true)
    const { handleApiError } = useApiErrorHandler()

    const getContactInfo = async () => {
        try {
            const data = await fetchContactInfo()
            log("Get contact info response:", data)
            setContactInfoData(data)
            setDiscardContactInfo(data)
        } catch (error) {
            handleApiError(error as ApiError, "getContactInfo")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getContactInfo()
    }, [])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setContactInfoData((prev) => ({ ...(prev as ContactInfo), [id]: value }))
        setIsEnabled(true)
    }

    const handleDiscardBtn = () => {
        setContactInfoData(discardContactInfo)
        notyf.success("Changes discarded successfully!")
        setIsEnabled(false)
    }

    const handleSaveBtn = async () => {
        if (!contactInfoData) return // if contactInfoData is null

        // check if all fields are filled
        if (!contactInfoData.email || !contactInfoData.address || !contactInfoData.phone || !contactInfoData.facebookUrl || !contactInfoData.instagramUrl || !contactInfoData.twitterUrl || !contactInfoData.openingHours) {
            notyf.error("All fields are required!")
            return
        }

        // check if there are any changes
        if (contactInfoData.email === discardContactInfo?.email &&
            contactInfoData.address === discardContactInfo?.address &&
            contactInfoData.phone === discardContactInfo?.phone &&
            contactInfoData.facebookUrl === discardContactInfo?.facebookUrl &&
            contactInfoData.instagramUrl === discardContactInfo?.instagramUrl &&
            contactInfoData.twitterUrl === discardContactInfo?.twitterUrl &&
            contactInfoData.openingHours === discardContactInfo?.openingHours) {
            notyf.error("No changes to save!")
            return
        }

        const newContactInfo = { // create a new object with the changes - clean object without unnecessary fields
            email: contactInfoData.email,
            address: contactInfoData.address,
            phone: contactInfoData.phone,
            facebookUrl: contactInfoData.facebookUrl,
            instagramUrl: contactInfoData.instagramUrl,
            twitterUrl: contactInfoData.twitterUrl,
            openingHours: contactInfoData.openingHours
        }

        setLoading(true)
        try {
            await updateContactInfo(newContactInfo)
            log("Contact info data:", newContactInfo)
            setDiscardContactInfo(newContactInfo)
            notyf.success("Changes saved successfully!")
            setIsEnabled(false)
        } catch (error) {
            handleApiError(error as ApiError, "updateContactInfo")
        } finally {
            setLoading(false)
        }
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
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                {/* Sidebar */}
                <SideBar />

                {/* Main */}
                <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10 flex flex-col gap-10">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#eee] dark:border-neutral-700 pb-6">
                        <div>
                            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
                                Contact Information
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 ml-2">
                                View and update your contact details
                            </p>
                        </div>

                        {/* Discard btn */}
                        <div className="flex gap-3">
                            <button onClick={handleDiscardBtn} disabled={!isEnabled} className={`px-4 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 transition shadow-sm ${!isEnabled
                                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-700"
                                : "bg-white dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-600 cursor-pointer"}`}>
                                Discard
                            </button>

                            {/* Save btn */}
                            <button onClick={handleSaveBtn} disabled={!isEnabled} className={`px-6 py-2.5 rounded-2xl font-semibold text-base transition shadow-md border ${!isEnabled
                                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-700"
                                : "bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#c1a875] hover:text-[#1a1a1a] hover:border-[#c1a875] active:scale-95 cursor-pointer"}`}>
                                Save Selection
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#c1a875] mb-1">Email</label>
                            <input onChange={handleChange} value={contactInfoData?.email} id="email" type="email" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-[#c1a875] mb-1">Phone</label>
                            <input onChange={handleChange} value={contactInfoData?.phone} id="phone" type="tel" inputMode="numeric" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                        </div>

                        {/* Facebook URL */}
                        <div>
                            <label htmlFor="facebook" className="block text-sm font-semibold text-[#c1a875] mb-1">Facebook URL</label>
                            <input onChange={handleChange} value={contactInfoData?.facebookUrl} id="facebookUrl" type="url" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                        </div>

                        {/* Instagram URL */}
                        <div>
                            <label htmlFor="instagram" className="block text-sm font-semibold text-[#c1a875] mb-1">Instagram URL</label>
                            <input onChange={handleChange} value={contactInfoData?.instagramUrl} id="instagramUrl" type="url" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-semibold text-[#c1a875] mb-1">Address</label>
                            <input onChange={handleChange} value={contactInfoData?.address} id="address" type="text" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 ml-2">
                                The Address must include a street number, street name, city, and country.
                            </p>
                        </div>

                        {/* Twitter URL */}
                        <div>
                            <label htmlFor="twitter" className="block text-sm font-semibold text-[#c1a875] mb-1">Twitter URL</label>
                            <input onChange={handleChange} value={contactInfoData?.twitterUrl} id="twitterUrl" type="url" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
                        </div>

                        {/* Opening Hours */}
                        <div>
                            <label htmlFor="openingHours" className="block text-sm font-semibold text-[#c1a875] mb-1">Opening Hours</label>
                            <textarea onChange={handleChange} value={contactInfoData?.openingHours} rows={3} id="openingHours" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />

                            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 ml-2">
                                Use double space "  " to break line.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
