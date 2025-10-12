import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { FiRefreshCw, FiShield, FiHeadphones } from "react-icons/fi"
import { errorLog, log } from '../utils/log';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { fetchProducts } from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Loading from '../components/Loading';

export default function Home() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [productsList, setProductsList] = useState([])
    const [loading, setLoading] = useState(true)

    const getProducts = async () => {
        setLoading(true)
        try {
            const data = await fetchProducts()
            setProductsList(data)
            log("Products:", data)
        } catch (error) {
            errorLog("Error in getProducts", error)
            notyf.error("Something went wrong. Please try again later.")
            nav("*")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getProducts()
    }, [])

    return (
        <div className='min-h-screen flex flex-col font-montserrat dark:bg-neutral-900'>
            <NavBar />

            <div className='flex-1'>
                {/* Hero Section */}
                <section className="bg-[#faf8f6] dark:bg-[#121212] w-full flex flex-col lg:flex-row items-center justify-between min-h-[550px] px-6 lg:px-32 py-16 relative overflow-hidden">
                    {/* Text */}
                    <div className="flex-1 flex flex-col justify-center items-start z-10">
                        <h1 className="text-5xl md:text-6xl font-prata font-bold leading-tight text-[#1a1a1a] dark:text-[#f5f5f5] mb-6">
                            Discover<br />
                            <span className="text-[#c1a875]">Timeless Fashion</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#444] dark:text-gray-400 font-montserrat mb-8 max-w-lg">
                            Step into elegance. Shop the latest designer collections crafted for every moment.
                        </p>
                        <button className="px-10 py-4 bg-white dark:bg-[#1a1a1a] border border-[#1a1a1a] dark:border-[#f5f5f5] hover:bg-[#1a1a1a] dark:hover:bg-[#faf8f6] hover:text-white dark:hover:text-[#1a1a1a] transition rounded-2xl shadow-md font-semibold font-montserrat text-lg text-[#1a1a1a] dark:text-[#f5f5f5]">
                            Shop Now
                        </button>
                    </div>

                    {/* Image */}
                    <div className="hidden lg:flex flex-1 items-center justify-center mt-10 lg:mt-0 relative z-10">
                        <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80" alt="Fashion model" className="w-[320px] h-[440px] object-cover rounded-2xl shadow-xl border border-[#eee] dark:border-[#333] transition" />
                    </div>
                </section>

                {/* Latest Collections Section */}
                <section className="w-full py-12 md:py-20">
                    <div className="flex flex-col items-center mb-10 px-3 md:px-0">
                        <h2 className="font-prata text-3xl md:text-5xl text-[#181818] dark:text-[#f5f5f5] mb-2 tracking-tight">
                            Latest Collections
                        </h2>
                        <p className="text-sm md:text-lg text-[#555] dark:text-gray-400 font-montserrat text-center max-w-xs md:max-w-md">
                            Fresh arrivals for the season. Stand out with style.
                        </p>
                    </div>

                    <div className="w-full max-w-[1280px] mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 px-4 md:px-0">
                            {loading
                                ? Array.from({ length: 10 }).map((_, i) => <LoadingSkeleton key={i} />)
                                : productsList.slice(0, 10).map(item =>
                                    <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                        <div className="w-[170px] h-[210px] md:w-[220px] md:h-[280px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
                                            <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />
                                        </div>
                                        <div className="flex flex-col items-center w-full">
                                            <h3 className="font-prata text-base md:text-lg text-[#232323] dark:text-[#f5f5f5] mb-1 text-center">
                                                {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                                            </h3>
                                            <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a] dark:text-[#f5f5f5]">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </section>

                {/* Best Sellers Section */}
                <section className="w-full py-12 md:py-20">
                    <div className="flex flex-col items-center mb-10 px-3 md:px-0">
                        <h2 className="font-prata text-3xl md:text-5xl text-[#181818] dark:text-[#f5f5f5] mb-2 tracking-tight">
                            Best Sellers
                        </h2>
                        <p className="text-sm md:text-lg text-[#555] dark:text-gray-400 font-montserrat text-center max-w-xs md:max-w-md">
                            Our most popular products loved by our customers.
                        </p>
                    </div>

                    <div className="w-full max-w-[1280px] mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 px-4 md:px-0">
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} />)
                                : productsList.slice(0, 5).map((item) => (
                                    <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                        <div className="relative w-[170px] h-[210px] md:w-[220px] md:h-[280px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
                                            <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />
                                            <span className="absolute top-3 left-3 bg-[#c1a875] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wide">
                                                Best Seller
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center w-full">
                                            <h3 className="font-prata text-base md:text-lg text-[#232323] dark:text-[#f5f5f5] mb-1 text-center">
                                                {item.title}
                                            </h3>
                                            <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a] dark:text-[#f5f5f5]">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>

                {/* Policy Section */}
                <section className="w-full py-10 md:py-16">
                    <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between gap-8 md:gap-0">
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="mb-4 text-[#c1a875]">
                                <FiRefreshCw size={38} />
                            </div>
                            <p className="font-semibold text-lg md:text-xl mb-1 text-[#181818] dark:text-[#f5f5f5]">
                                Easy Exchange Policy
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                                We offer a hassle-free exchange within 7 days on all products.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="mb-4 text-[#c1a875]">
                                <FiShield size={38} />
                            </div>
                            <p className="font-semibold text-lg md:text-xl mb-1 text-[#181818] dark:text-[#f5f5f5]">
                                7 Day Return Policy
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                                Changed your mind? Return products within 7 days, no questions asked.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="mb-4 text-[#c1a875]">
                                <FiHeadphones size={38} />
                            </div>
                            <p className="font-semibold text-lg md:text-xl mb-1 text-[#181818] dark:text-[#f5f5f5]">
                                24/7 Customer Support
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                                Our team is here for you anytime — chat, call, or email us for help.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}