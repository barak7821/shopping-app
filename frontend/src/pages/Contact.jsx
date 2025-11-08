import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import AboutCard from "../components/AboutCard"
import Footer from "../components/Footer"
import { useApiErrorHandler } from "../utils/useApiErrorHandler"
import { fetchContactInfo } from "../utils/api"

export default function Contact() {
    const [contact, setContact] = useState({})
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
        <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex flex-col font-montserrat">
            <NavBar />
            <div className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 py-16">
                <h1 className="text-4xl md:text-6xl font-prata text-[#181818] dark:text-neutral-100 mb-4 tracking-tight">
                    Contact Us
                </h1>
                <p className="text-lg text-[#555] dark:text-neutral-300 mb-12 max-w-2xl">
                    For any questions, information or support - we're here for you.<br />
                    See below how to reach us:
                </p>
                <div className="grid md:grid-cols-2 gap-16 mb-20">
                    <div>
                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Store Address</h2>
                        <p className="text-[#222] dark:text-neutral-200 text-base mb-8">
                            {contact.address || "Loading..."}<br />
                            {contact.address && "(Main showroom & pickup)"}
                        </p>

                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Opening Hours</h2>
                        <p className="text-[#222] dark:text-neutral-200 text-base">
                            {contact.openingHours
                                ? contact.openingHours.split(/\s{2,}/).map((chunk, idx) => (
                                    <span key={idx} className="block">{chunk.trim()}</span>
                                ))
                                : "Loading..."}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Contact Details</h2>
                        <p className="text-[#222] dark:text-neutral-200 text-base mb-8">
                            <span className="font-semibold">Phone: </span>

                            {contact.phone
                                ? <a href={`tel:${contact.phone}`} className="underline hover:text-[#c1a875] transition" >{contact.phone}</a>
                                : "Loading..."
                            }
                            <br />
                            <span className="font-semibold">Email: </span>
                            {contact.email
                                ? <a href={`mailto:${contact.email || "#"}`} className="underline hover:text-[#c1a875] transition">{contact.email || "Loading..."}</a>
                                : "Loading..."
                            }
                        </p>
                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Follow Us</h2>
                        <div className="flex gap-8 text-lg">
                            <a href={contact.instagramUrl || "/*"} target="_blank" rel="noopener noreferrer" className="hover:text-[#c1a875] transition dark:text-white hover:underline">Instagram</a>
                            <a href={contact.facebookUrl || "/*"} target="_blank" rel="noopener noreferrer" className="hover:text-[#c1a875] transition dark:text-white hover:underline">Facebook</a>
                            <a href={contact.twitterUrl || "/*"} target="_blank" rel="noopener noreferrer" className="hover:text-[#c1a875] transition dark:text-white hover:underline">Twitter</a>
                        </div>
                    </div>
                </div>
                <hr className="my-12 border-[#e6dfd2] dark:border-neutral-700" />
                <p className="text-center text-sm text-[#bbb] dark:text-neutral-500">
                    We typically respond to emails within 1 business day.
                </p>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>

    )
}
