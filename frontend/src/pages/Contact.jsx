import React from "react"
import NavBar from "../components/NavBar"
import AboutCard from "../components/AboutCard"
import Footer from "../components/Footer"

export default function Contact() {
    return (
        <div className="min-h-screen bg-[#faf8f6] flex flex-col font-montserrat">
            <NavBar />
            <div className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 py-16">
                <h1 className="text-4xl md:text-6xl font-prata text-[#181818] mb-4 tracking-tight">
                    Contact Us
                </h1>
                <p className="text-lg text-[#555] mb-12 max-w-2xl">
                    For any questions, information or support – we're here for you.<br />
                    See below how to reach us:
                </p>
                <div className="grid md:grid-cols-2 gap-16 mb-20">
                    <div>
                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Store Address</h2>
                        <p className="text-[#222] text-base mb-8">
                            23 King George St, Tel Aviv, Israel<br />
                            (Main showroom & pickup)
                        </p>

                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Opening Hours</h2>
                        <p className="text-[#222] text-base">
                            Sun–Thu: 10:00 - 19:00<br />
                            Fri: 09:00 - 14:00<br />
                            Sat: Closed
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Contact Details</h2>
                        <p className="text-[#222] text-base mb-8">
                            <span className="font-semibold">Phone: </span>
                            <a href="tel:+972501234567" className="underline hover:text-[#c1a875] transition">+972 50 123 4567</a><br />
                            <span className="font-semibold">Email: </span>
                            <a href="mailto:info@yourshop.com" className="underline hover:text-[#c1a875] transition">info@yourshop.com</a>
                        </p>
                        <h2 className="text-xl font-semibold text-[#c1a875] mb-3">Follow Us</h2>
                        <div className="flex gap-8 text-lg">
                            <a href="https://www.instagram.com/yourshop" target="_blank" rel="noopener noreferrer" className="hover:text-[#c1a875] transition">Instagram</a>
                            <a href="https://www.facebook.com/yourshop" target="_blank" rel="noopener noreferrer" className="hover:text-[#c1a875] transition">Facebook</a>
                        </div>
                    </div>
                </div>
                <hr className="my-12 border-[#e6dfd2]" />
                <p className="text-center text-sm text-[#bbb]">
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
