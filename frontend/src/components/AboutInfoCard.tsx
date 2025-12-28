import { useEffect, useState } from "react"
import { FiMail, FiPhone, FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi"
import { fetchContactInfo } from "../api/apiClient"
import { useApiErrorHandler } from "../hooks/useApiErrorHandler"
import type { ContactInfo } from "../types/types"

export default function AboutCard() {
    const [contact, setContact] = useState<ContactInfo>({})
    const { handleApiError } = useApiErrorHandler()

    const fetchContact = async () => {
        try {
            const data = await fetchContactInfo()
            setContact(data)
        } catch (error) {
            handleApiError(error, "fetchHomeSection")
        }
    }

    useEffect(() => {
        fetchContact()
    }, [])

    return (
        <section className="w-full py-10 flex justify-center items-center px-4">
            <div className="w-full max-w-5xl bg-white/90 dark:bg-neutral-900/90 rounded-2xl lg:shadow-[0_0_35px_rgba(0,0,0,0.1)] dark:shadow-none px-6 md:px-16 py-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                {/* About */}
                <div className="flex-1 flex flex-col mb-6 md:mb-0">
                    <h2 className="text-3xl md:text-4xl font-prata font-bold mb-4 text-[#1a1a1a] dark:text-neutral-100">
                        Our Store
                    </h2>
                    <p className="text-base md:text-lg text-gray-700 dark:text-neutral-300 max-w-xl">
                        We are committed to providing the best shopping experience with a wide range of designer products and exceptional customer service.
                        Discover our curated collections and enjoy exclusive benefits with every order.
                    </p>
                </div>

                {/* Contact */}
                <div className="flex-1 flex flex-col items-start">
                    <h3 className="text-xl font-semibold mb-3 text-[#1a1a1a] dark:text-neutral-100">Get in touch with us:</h3>
                    <ul className="space-y-3 text-gray-700 dark:text-neutral-300 text-base font-montserrat">
                        <li className="flex items-center gap-2">
                            <FiMail className="text-[#c1a875]" size={19} />
                            <span>Email:</span>
                            <a href="mailto:info@ourstore.com" className="text-blue-600 hover:underline ml-1">
                                {contact.email || "Loading..."}
                            </a>
                        </li>
                        <li className="flex items-center gap-2">
                            <FiPhone className="text-[#c1a875]" size={19} />
                            <span>Phone:</span>
                            <a href="tel:+1234567890" className="text-blue-600 hover:underline ml-1">
                                {contact.phone || "Loading..."}
                            </a>
                        </li>
                    </ul>
                    <div className="flex gap-4 mt-6">
                        <a href={contact.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FiInstagram className="text-[#c1a875] hover:text-[#e4405f] transition" size={26} />
                        </a>
                        <a href={contact.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FiFacebook className="text-[#c1a875] hover:text-[#1877f3] transition" size={26} />
                        </a>
                        <a href={contact.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FiTwitter className="text-[#c1a875] hover:text-[#1da1f2] transition" size={26} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
