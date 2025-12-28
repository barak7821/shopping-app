import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar';
import AboutCard from '../components/AboutInfoCard';
import Footer from '../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { errorLog } from '../lib/logger';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { findProductsQuery } from '../api/apiClient';
import type { Product } from '../types/types';

export default function SearchResults() {
    const nav = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const query = params.get("q") || ""
    const [loading, setLoading] = useState(true)
    const [productsList, setProductsList] = useState<Product[]>([])

    const findProducts = async () => {
        setLoading(true)
        try {
            const data = await findProductsQuery(query.toLowerCase().trim())
            setProductsList(data)
        } catch (error) {
            errorLog("Error in findProducts:", error)
            return
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        findProducts()
    }, [query])

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6] dark:bg-neutral-900">
            <NavBar />

            {productsList.length === 0 && !loading
                ? <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <h1 className="font-prata text-3xl md:text-5xl text-[#181818] dark:text-neutral-100 mb-2 tracking-tight text-center">
                        No Results Found
                    </h1>
                    <p className="text-sm md:text-lg text-[#555] dark:text-neutral-300 font-montserrat text-center mb-8 max-w-xs md:max-w-md">
                        We couldn't find any products matching your search for "<span className="font-bold text-[#c1a875]">{query}</span>". Please try a different search term or check your spelling.
                    </p>
                    <button onClick={() => nav("/")} className="px-8 py-3 border border-[#1a1a1a] dark:border-neutral-300 bg-[#1a1a1a] dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-white hover:text-black dark:hover:bg-neutral-800 dark:hover:text-white transition rounded-2xl shadow font-semibold text-lg active:scale-95 mt-6 cursor-pointer">
                        Go Back to Home
                    </button>
                </div>

                : <div className="flex-1 w-full">
                    <div className="max-w-[1280px] mx-auto flex flex-col items-center pt-8 pb-20 px-4">
                        <h1 className="font-prata text-3xl md:text-5xl text-[#181818] dark:text-neutral-100 mb-2 tracking-tight text-center">
                            Search Results
                        </h1>
                        <p className="text-sm md:text-lg text-[#555] dark:text-neutral-300 font-montserrat text-center mb-8 max-w-xs md:max-w-md">
                            Showing results for "<span className="font-bold text-[#c1a875]">{query}</span>"
                        </p>

                        <div className="flex w-full gap-12">
                            <main className="flex-1 flex flex-col gap-6">
                                <div className="w-full">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-12 gap-y-12">
                                        {loading
                                            ? Array.from({ length: 20 }).map((_, i) => <LoadingSkeleton key={i} />)
                                            : productsList.map(item =>
                                                <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                                    <div className="w-[170px] h-[210px] md:w-[140px] md:h-[280px] lg:w-[180px] xl:w-[220px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
                                                        <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />
                                                    </div>
                                                    <div className="flex flex-col items-center w-full">
                                                        <h3 className="font-prata text-base md:text-lg text-[#232323] dark:text-neutral-100 mb-1 text-center">
                                                            {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                                                        </h3>
                                                        <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a] dark:text-neutral-200">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>}

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}
