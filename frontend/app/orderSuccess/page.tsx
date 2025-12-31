"use client"
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import AboutCard from "../components/AboutInfoCard"
import Footer from "../components/Footer"
import { useCart } from "../context/CartContext"
import { log } from '../lib/logger';
import { useNotyf } from "../hooks/useNotyf"
import Loading from "../components/Loading"
import { useRouter } from "next/navigation"

export default function OrderSuccess() {
    const router = useRouter()
    const notyf = useNotyf()
    const { address } = useCart()
    const [loading, setLoading] = useState(false)


    // Verify there is shipping address before continue with OrderSuccess page - to block 
    useEffect(() => {
        setLoading(true)
        if (!address || Object.keys(address).length === 0) {
            notyf?.error("No shipping address found")
            log("No shipping address found")
            router.push("/")
            return
        } else {
            setLoading(false)
        }

        log(address)
    }, [address])

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            <NavBar />
            <div className="flex-1 w-full max-w-6xl mx-auto pt-12 pb-20 flex flex-col items-center">
                <h1 className="font-prata text-5xl text-[#181818] dark:text-neutral-100 mb-10 text-center tracking-wide">Order Successful</h1>
                <p className="text-xl text-[#444] dark:text-neutral-300 mb-14 text-center max-w-2xl">
                    Thank you for your purchase! Your order has been successfully placed. You will receive a confirmation email shortly with the details of your order.
                </p>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-[#c1a875]">Next Steps</h2>
                        <p className="text-base text-[#555] dark:text-neutral-300 text-center">
                            You can track your order status in your account dashboard. If you have any questions, feel free to contact our support team.
                        </p>
                    </section>
                    <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-[#c1a875]">Why Shop With Us?</h2>
                        <ul className="list-disc pl-4 text-[#555] dark:text-neutral-300 space-y-2 text-base text-left">
                            <li>Trending & classic styles</li>
                            <li>Inclusive sizes</li>
                            <li>Easy-to-use filters</li>
                            <li>Fast & secure checkout</li>
                            <li>Friendly support</li>
                        </ul>
                    </section>
                    <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-[#c1a875]">Contact Us</h2>
                        <p className="text-base text-[#555] dark:text-neutral-300 text-center">
                            Have questions or feedback?<br />
                            Reach out via our <span className="underline">Contact</span> page.
                        </p>
                    </section>
                </div>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}
