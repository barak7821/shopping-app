import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar';
import AboutCard from '../components/AboutCard';
import Footer from '../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { findProductsQuery } from '../utils/api';

export default function SearchResults() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const query = params.get("q")
    const [loading, setLoading] = useState(true)
    const [productsList, setProductsList] = useState([])
    const [sortedList, setSortedList] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedSubCategories, setSelectedSubCategories] = useState([])
    const [selectedSizes, setSelectedSizes] = useState([])
    const [sortBy, setSortBy] = useState("featured")

    const findProducts = async () => {
        setLoading(true)

        log("findProducts called with query:", query)
        try {
            const data = await findProductsQuery(query.toLowerCase().trim())
            setProductsList(data)
            setSortedList(data)
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

    const categoryFilter = (e) => {
        const value = e.target.value.toLowerCase() // the value of the checked input
        log("category", value)
        const isChecked = e.target.checked // the checked status of the input

        let updatedCategories

        if (isChecked) { // if the input is checked
            updatedCategories = [...selectedCategories, value] // add the value to the array, eg: [men] -> [men, women]
        } else {
            updatedCategories = selectedCategories.filter(item => item !== value) // remove the value from the array, eg: [men, women] -> [women]
        }

        log("updatedCategories", updatedCategories)
        setSelectedCategories(updatedCategories)
    }

    const subCategoryFilter = (e) => {
        const value = e.target.value.toLowerCase() // the value of the checked input
        log("subCategory", value)
        const isChecked = e.target.checked // the checked status of the input

        let updatedSubCategories

        if (isChecked) { // if the input is checked
            updatedSubCategories = [...selectedSubCategories, value] // add the value to the array, eg: [men] -> [men, women]
        } else {
            updatedSubCategories = selectedSubCategories.filter(item => item !== value) // remove the value from the array, eg: [men, women] -> [women]
        }
        log("updatedSubCategories", updatedSubCategories)
        setSelectedSubCategories(updatedSubCategories)
    }

    const sizeFilter = (e) => {
        const value = e.target.value.toUpperCase() // the value of the checked input
        log("size", value)
        const isChecked = e.target.checked // the checked status of the input

        let updatedSizes

        if (isChecked) { // if the input is checked
            updatedSizes = [...selectedSizes, value] // add the value to the array, eg: [men] -> [men, women]
        } else {
            updatedSizes = selectedSizes.filter(item => item !== value) // remove the value from the array, eg: [men, women] -> [women]
        }
        log("updatedSizes", updatedSizes)
        setSelectedSizes(updatedSizes)
    }

    useEffect(() => {
        let filtered = productsList

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(item => selectedCategories.includes(item.category))
        }

        if (selectedSubCategories.length > 0) {
            filtered = filtered.filter(item => selectedSubCategories.includes(item.type))
        }

        if (selectedSizes.length > 0) {
            filtered = filtered.filter(item =>
                Array.isArray(item.sizes) && item.sizes.some(size => selectedSizes.includes(size))
            )
        }

        if (sortBy === "new") {
            filtered = [...filtered].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt))
        }

        if (sortBy === "price-low") {
            filtered = [...filtered].sort((a, b) => a.price - b.price)
        }

        if (sortBy === "price-high") {
            filtered = [...filtered].sort((a, b) => b.price - a.price)
        }

        setSortedList(filtered)
    }, [productsList, selectedCategories, selectedSubCategories, selectedSizes, sortBy])

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6]">
            <NavBar />

            {productsList.length === 0 && !loading
                ? <div className="flex-1 flex flex-col items-center justify-center px-4">
                    {/* Title */}
                    <h1 className="font-prata text-3xl md:text-5xl text-[#181818] mb-2 tracking-tight text-center">
                        No Results Found
                    </h1>
                    <p className="text-sm md:text-lg text-[#555] font-montserrat text-center mb-8 max-w-xs md:max-w-md">
                        We couldn't find any products matching your search for "<span className="font-bold text-[#c1a875]">{query}</span>". Please try a different search term or check your spelling.
                    </p>
                    <button onClick={() => nav("/")} className="px-8 py-3 border border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-white hover:text-black transition rounded-2xl shadow font-semibold text-lg active:scale-95 mt-6 cursor-pointer">
                        Go Back to Home
                    </button>
                </div>

                : < div className="flex-1 w-full">
                    <div className="max-w-[1280px] mx-auto flex flex-col items-center pt-8 pb-20 px-4">
                        {/* Title */}
                        <h1 className="font-prata text-3xl md:text-5xl text-[#181818] mb-2 tracking-tight text-center">
                            Search Results
                        </h1>
                        <p className="text-sm md:text-lg text-[#555] font-montserrat text-center mb-8 max-w-xs md:max-w-md">
                            Showing results for "<span className="font-bold text-[#c1a875]">{query}</span>"
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
                                                    <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" onChange={categoryFilter} />
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
                                                { name: "T-Shirt", value: "t-shirt" },
                                                { name: "Shirt", value: "shirt" },
                                                { name: "Hoodie", value: "hoodie" },
                                                { name: "Dress", value: "dress" },
                                                { name: "Pants", value: "pants" },
                                                { name: "Shorts", value: "shorts" },
                                                { name: "Skirt", value: "skirt" },
                                                { name: "Jacket", value: "jacket" },
                                                { name: "Leggings", value: "leggings" },
                                            ].map(item =>
                                                <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" onChange={subCategoryFilter} />
                                                    {item.name}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    {/* Sizes */}
                                    <div>
                                        <h3 className="font-semibold mb-2 text-[#c1a875]">Sizes</h3>
                                        {/* Adult Sizes */}
                                        <div className="flex flex-col gap-2 text-sm">
                                            <h4 className="font-bold text-xs text-[#888] mb-1">Adult Sizes</h4>
                                            {[
                                                { name: "XS", value: "XS" },
                                                { name: "S", value: "S" },
                                                { name: "M", value: "M" },
                                                { name: "L", value: "L" },
                                                { name: "XL", value: "XL" },
                                                { name: "XXL", value: "XXL" }
                                            ].map(item =>
                                                <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" onChange={sizeFilter} />
                                                    {item.name}
                                                </label>
                                            )}
                                        </div>
                                        {/* Separator */}
                                        <hr className='border-gray-200 my-2' />
                                        {/* Kids Sizes */}
                                        <div className="flex flex-col gap-2 text-sm mt-2">
                                            <h4 className="font-bold text-xs text-[#888] mb-1">Kids Sizes</h4>
                                            {[
                                                { name: "4", value: "4" },
                                                { name: "6", value: "6" },
                                                { name: "8", value: "8" },
                                                { name: "10", value: "10" }
                                            ].map(item =>
                                                <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" onChange={sizeFilter} />
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
                                    <select onChange={e => setSortBy(e.target.value)} className="rounded-2xl border border-gray-200 px-4 py-2 text-base bg-neutral-50 shadow-sm focus:ring-2 focus:ring-[#c1a875] focus:outline-none w-auto">
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
                                        {loading
                                            ? Array.from({ length: 20 }).map((_, i) => <LoadingSkeleton key={i} />)
                                            : sortedList.map(item =>
                                                <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                                    <div className="w-[170px] h-[210px] md:w-[140px] md:h-[280px] lg:w-[180px] xl:w-[220px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
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
                </div>}

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div >

    )
}
