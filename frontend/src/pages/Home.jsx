import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { FiRefreshCw, FiShield, FiHeadphones } from "react-icons/fi"
import { fetchBestSellers, fetchHeroSection, fetchLatestProducts, fetchProducts } from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useApiErrorHandler } from '../utils/useApiErrorHandler';
import SaleProduct from '../components/saleProduct';

export default function Home() {
    const nav = useNavigate()
    const [bestSeller, setBestSeller] = useState({})
    const [latestProduct, setLatestProduct] = useState({})
    const [heroSection, setHeroSection] = useState({})
    const [loading, setLoading] = useState(true)
    const { handleApiError } = useApiErrorHandler()

    const fetchHomeSection = async () => {
        setLoading(true)
        try {
            const data = await fetchLatestProducts()
            setLatestProduct(data)

            const heroData = await fetchHeroSection()
            setHeroSection(heroData)

            const bestSellerData = await fetchBestSellers()
            setBestSeller(bestSellerData)
        } catch (error) {
            handleApiError(error, "fetchHomeSection")
            nav("/*")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHomeSection()
    }, [])

    return (
        <div className='min-h-screen flex flex-col font-montserrat dark:bg-neutral-900'>
            <NavBar />

            <div className='flex-1'>
                {/* Hero Section */}
                {loading
                    ? <section className="bg-[#faf8f6] dark:bg-[#121212] w-full flex flex-col lg:flex-row items-center justify-between min-h-[550px] px-6 lg:px-32 py-16 relative overflow-hidden">
                        {/* Text skeleton */}
                        <div className="flex-1 flex flex-col justify-center items-start z-10 animate-pulse">
                            <div className="h-10 md:h-14 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
                            <div className="h-10 md:h-14 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded mb-6" />
                            <div className="h-5 w-5/6 bg-gray-200 dark:bg-neutral-700 rounded mb-3" />
                            <div className="h-5 w-2/3 bg-gray-200 dark:bg-neutral-700 rounded mb-3" />
                            <div className="h-5 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded mb-8" />
                            <div className="h-12 w-40 bg-gray-200 dark:bg-neutral-700 rounded-2xl" />
                        </div>

                        {/* Image skeleton */}
                        <div className="hidden lg:flex flex-1 items-center justify-center mt-10 lg:mt-0 relative z-10 animate-pulse">
                            <div className="w-[320px] h-[440px] bg-gray-200 dark:bg-neutral-700 rounded-2xl shadow-xl border border-[#eee] dark:border-[#333]" />
                        </div>
                    </section>
                    : <section className="bg-[#faf8f6] dark:bg-[#121212] w-full flex flex-col lg:flex-row items-center justify-between min-h-[550px] px-6 lg:px-32 py-16 relative overflow-hidden">
                        {/* Text */}
                        <div className="flex-1 flex flex-col justify-center items-start z-10">
                            <h1 className="text-5xl md:text-6xl font-prata font-bold leading-tight text-[#1a1a1a] dark:text-[#f5f5f5] mb-6">
                                {heroSection.title}<br />
                                <span className="text-[#c1a875]">{heroSection.subtitle}</span>
                            </h1>
                            <p className="text-lg md:text-xl text-[#444] dark:text-gray-400 font-montserrat mb-8 max-w-lg">
                                {heroSection.description}
                            </p>
                            <button className="px-10 py-4 bg-white dark:bg-[#1a1a1a] border border-[#1a1a1a] dark:border-[#f5f5f5] hover:bg-[#1a1a1a] dark:hover:bg-[#faf8f6] hover:text-white dark:hover:text-[#1a1a1a] transition rounded-2xl shadow-md font-semibold font-montserrat text-lg text-[#1a1a1a] dark:text-[#f5f5f5]">
                                {heroSection.buttonText}
                            </button>
                        </div>

                        {/* Image */}
                        <div className="hidden lg:flex flex-1 items-center justify-center mt-10 lg:mt-0 relative z-10">
                            <img src={heroSection.imageUrl} alt={heroSection.imageAlt} className="w-[320px] h-[440px] object-cover rounded-2xl shadow-xl border border-[#eee] dark:border-[#333] transition" />
                        </div>
                    </section>
                }

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
                                : latestProduct.map(item =>
                                    <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                        <div className="relative w-[170px] h-[210px] md:w-[220px] md:h-[280px] flex items-center justify-center overflow-hidden mb-4 md:mb-5 rounded-2xl">
                                            <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />

                                            {/* Sale Tag */}
                                            {item.onSale == true && <SaleProduct />}

                                        </div>
                                        <div className="flex flex-col items-center w-full">
                                            <h3 className="font-prata text-base md:text-lg text-[#232323] dark:text-[#f5f5f5] mb-1 text-center">
                                                {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                                            </h3>

                                            {/* Sale */}
                                            {item.onSale == true
                                                ? <div className="flex flex-col items-center text-center gap-1">
                                                    <div className="flex items-baseline justify-center gap-2">
                                                        <p className="text-[#c1a875] dark:text-[#d3b988] font-bold text-base md:text-lg">${(item.price * (1 - item.discountPercent / 100)).toFixed(2)}</p>
                                                        <p className="text-gray-500 dark:text-neutral-400 font-semibold line-through text-xs md:text-sm">${item.price.toFixed(2)}</p>
                                                    </div>
                                                    <span className="text-[0.65rem] md:text-xs font-semibold text-[#c1a875] dark:text-[#d3b988] tracking-[0.3em] uppercase">
                                                        {item.discountPercent}% Off
                                                    </span>
                                                </div>
                                                : <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a] dark:text-[#f5f5f5]">
                                                    ${item.price.toFixed(2)}
                                                </p>
                                            }
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
                                : bestSeller.map((item) => (
                                    <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                        <div className="relative w-[170px] h-[210px] md:w-[220px] md:h-[280px] flex items-center justify-center overflow-hidden mb-4 md:mb-5 rounded-2xl">
                                            <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />

                                            {/* Sale Tag */}
                                            {item.onSale == true && <SaleProduct />}

                                        </div>
                                        <div className="flex flex-col items-center w-full">
                                            <h3 className="font-prata text-base md:text-lg text-[#232323] dark:text-[#f5f5f5] mb-1 text-center">
                                                {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                                            </h3>

                                            {/* Sale */}
                                            {item.onSale == true
                                                ? <div className="flex flex-col items-center text-center gap-1">
                                                    <div className="flex items-baseline justify-center gap-2">
                                                        <p className="text-[#c1a875] dark:text-[#d3b988] font-bold text-base md:text-lg">${(item.price * (1 - item.discountPercent / 100)).toFixed(2)}</p>
                                                        <p className="text-gray-500 dark:text-neutral-400 font-semibold line-through text-xs md:text-sm">${item.price.toFixed(2)}</p>
                                                    </div>
                                                    <span className="text-[0.65rem] md:text-xs font-semibold text-[#c1a875] dark:text-[#d3b988] tracking-[0.3em] uppercase">
                                                        {item.discountPercent}% Off
                                                    </span>
                                                </div>
                                                : <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a] dark:text-[#f5f5f5]">
                                                    ${item.price.toFixed(2)}
                                                </p>
                                            }
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
