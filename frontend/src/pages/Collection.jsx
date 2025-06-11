import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { useNavigate } from 'react-router-dom'
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import Loading from '../components/Loading';
import { fetchProducts } from '../utils/api';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';

export default function Collection() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [loading, setLoading] = useState(true)
    const [productsList, setProductsList] = useState([])

    const getProducts = async () => {
        setLoading(true)
        try {
            const data = await fetchProducts()
            setProductsList(data)
            log("Products:", data)
        } catch (error) {
            errorLog("Error in getProducts", error)
            notyf.error("Something went wrong. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getProducts()
    }, [])

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6]">
            <NavBar />

            <div className="flex-1 w-full">
                <div className="max-w-[1280px] mx-auto flex flex-col items-center pt-8 pb-20 px-4">
                    {/* Title */}
                    <h1 className="font-prata text-3xl md:text-5xl text-[#181818] mb-2 tracking-tight text-center">
                        All Collections
                    </h1>
                    <p className="text-sm md:text-lg text-[#555] font-montserrat text-center mb-8 max-w-xs md:max-w-md">
                        Browse and filter our full range of products by category, type, or size.
                    </p>

                    {/* Filters and Products */}
                    <div className="flex w-full gap-12">
                        {/* Filters */}
                        <aside className="hidden md:block flex-shrink-0 pt-4">
                            <div className="flex flex-col gap-8">
                                {/* Category */}
                                <div>
                                    <h3 className="font-semibold mb-2 text-[#c1a875]">Categories</h3>
                                    <div className="flex flex-col gap-2 text-sm">
                                        {[
                                            { name: "Men", value: "men" },
                                            { name: "Women", value: "women" },
                                            { name: "Kids", value: "kids" },
                                        ].map(item =>
                                            <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" />
                                                {item.name}
                                            </label>
                                        )}
                                    </div>
                                </div>
                                {/* Types */}
                                <div>
                                    <h3 className="font-semibold mb-2 text-[#c1a875]">Type</h3>
                                    <div className="flex flex-col gap-2 text-sm">
                                        {[
                                            { name: "Pants", value: "pants" },
                                            { name: "T-Shirt", value: "t-shirt" },
                                            { name: "Jacket", value: "jacket" },
                                            { name: "Sweater", value: "sweater" },
                                            { name: "Sport", value: "sport" },
                                            { name: "Jeans", value: "jeans" },
                                        ].map(item =>
                                            <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" />
                                                {item.name}
                                            </label>
                                        )}
                                    </div>
                                </div>
                                {/* Sizes */}
                                <div>
                                    <h3 className="font-semibold mb-2 text-[#c1a875]">Sizes</h3>
                                    <div className="flex flex-col gap-2 text-sm">
                                        {[
                                            { name: "XS", value: "xs" },
                                            { name: "S", value: "s" },
                                            { name: "M", value: "m" },
                                            { name: "L", value: "l" },
                                            { name: "XL", value: "xl" },
                                            { name: "XXL", value: "xxl" },
                                        ].map(item =>
                                            <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" />
                                                {item.name}
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Products + Sort */}
                        <main className="flex-1 flex flex-col gap-6">
                            {/* Sort Bar */}
                            <div className="flex justify-end mb-2">
                                <select className="rounded-2xl border border-gray-200 px-4 py-2 text-base bg-neutral-50 shadow-sm focus:ring-2 focus:ring-[#c1a875] focus:outline-none w-50">
                                    {[
                                        { name: "Sort By: Featured", value: "featured" },
                                        { name: "Sort By: Newest Arrivals", value: "new" },
                                        { name: "Sort By: Price: Low to High", value: "price-low" },
                                        { name: "Sort By: Price: High to Low", value: "price-high" },
                                    ].map(item =>
                                        <option value={item.value} key={item.value}>{item.name}</option>
                                    )}
                                </select>
                            </div>

                            {/* Products Grid */}
                            <div className="w-full">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-12 gap-y-12">
                                    {/* sorted according to new - createdAt */}
                                    {productsList.map(item =>
                                        <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                            {/* Image */}
                                            <div className="w-[170px] h-[210px] md:w-[140px] md:h-[280px] lg:w-[180px] xl:[220px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
                                                <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />
                                            </div>
                                            <div className="flex flex-col items-center w-full">
                                                <h3 className="font-prata text-base md:text-lg text-[#232323] mb-1 text-center">
                                                    {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                                                </h3>
                                                <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a]">
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
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}
