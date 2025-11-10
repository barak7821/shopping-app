import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchProductsByQuery } from '../utils/api';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useApiErrorHandler } from '../utils/useApiErrorHandler';
import SaleProduct from '../components/saleProduct';

function getPageNumbers(totalPages, currentPage) {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let last = null

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i)
        }
    }

    for (let i of range) {
        if (last) {
            if (i - last === 2) {
                rangeWithDots.push(last + 1)
            } else if (i - last > 2) {
                rangeWithDots.push("...")
            }
        }
        rangeWithDots.push(i)
        last = i
    }

    return rangeWithDots
}


export default function Collection() {
    const nav = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams() // To get and set query params
    const [loading, setLoading] = useState(true)
    const [productsList, setProductsList] = useState([]) // List of products
    const [totalPages, setTotalPages] = useState(1) // Total number of pages for pagination
    const { handleApiError } = useApiErrorHandler()

    // Get query params and set default values
    const sortBy = (searchParams.get("sort") || "featured").toLowerCase()
    const currentPage = Math.max(1, +(searchParams.get("page")) || 1)
    const categories = (searchParams.get("category") || "").toLowerCase().split(",").filter(Boolean)
    const type = (searchParams.get("type") || "").toLowerCase().split(",").filter(Boolean)
    const sizes = (searchParams.get("sizes") || "").toUpperCase().split(",").filter(Boolean)

    // Fetch products by query
    const getProducts = async (signal) => {
        // Build query object
        const query = { page: currentPage }
        if (categories.length > 0) query.category = categories.join(",")
        if (type.length > 0) query.type = type.join(",")
        if (sizes.length > 0) query.sizes = sizes.join(",")
        query.sort = ["price-low", "price-high", "new", "featured"].includes(sortBy) ? sortBy : "featured"

        setLoading(true)
        try {
            const data = await fetchProductsByQuery(query, { signal }) // Send query to backend and signal to abort request if needed
            if (signal.aborted) return // If the request was aborted, return early
            setProductsList(data.items)
            setTotalPages(+data.totalPages)
        } catch (error) {
            handleApiError(error, "getProducts")
        } finally {
            setLoading(false)
        }
    }

    // Fetch products on mount
    useEffect(() => {
        const controller = new AbortController() // Create AbortController

        getProducts(controller.signal) // controller.signal is used to abort the request if needed

        return () => controller.abort() // Abort the request when the component unmounts
    }, [searchParams])

    // Function to handle page changes in pagination
    const handlePageChange = (nextPage) => {
        const safe = Math.min(Math.max(1, nextPage), totalPages) // Safeguard against invalid page numbers like negative or greater than total pages
        setSearchParams(prev => { // Update query params
            const params = new URLSearchParams(prev) // Get current query params
            params.set("page", String(safe)) // Set page to the safe value
            return params
        })
        window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top of page
    }

    // Function to handle checkbox changes in the filters
    const handleParamChange = (setSearchParams, paramKey, currentValues, e, formatValue = v => v) => {
        const { value, checked } = e.target // Get value and checked status of the input
        const formattedValue = formatValue(value) // Format the value if needed

        setSearchParams(prev => {
            const params = new URLSearchParams(prev) // Get current query params

            if (typeof checked === "boolean") { // If the input is a checkbox
                const updatedValues = checked ? [...currentValues, formattedValue] : currentValues.filter(v => v !== formattedValue)

                if (updatedValues.length > 0) { // If there are updated values
                    params.set(paramKey, updatedValues.join(",")) 
                } else {
                    params.delete(paramKey)
                }
            } else {
                params.set(paramKey, formattedValue) // If the input is not a checkbox, set the value directly
            }

            params.set("page", "1") // Reset page to 1 when changing params so we get the first page of results

            return params
        })

    }


    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6] dark:bg-neutral-900">
            <NavBar />

            <div className="flex-1 w-full">
                <div className="max-w-[1280px] mx-auto flex flex-col items-center pt-8 pb-20 px-4">
                    {/* Title */}
                    <h1 className="font-prata text-3xl md:text-5xl text-[#181818] dark:text-neutral-100 mb-2 tracking-tight text-center">
                        All Collections
                    </h1>
                    <p className="text-sm md:text-lg text-[#555] dark:text-neutral-300 font-montserrat text-center mb-8 max-w-xs md:max-w-md">
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
                                    <div className="flex flex-col gap-2 text-sm text-[#555] dark:text-neutral-300">
                                        {[
                                            { name: "Men", value: "men" },
                                            { name: "Women", value: "women" },
                                            { name: "Kids", value: "kids" },
                                        ].map(item =>
                                            <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" checked={categories.includes(item.value)} onChange={e => handleParamChange(setSearchParams, "category", categories, e, v => v.toLowerCase())} />
                                                {item.name}
                                            </label>
                                        )}
                                    </div>
                                </div>
                                {/* Types */}
                                <div>
                                    <h3 className="font-semibold mb-2 text-[#c1a875]">Type</h3>
                                    <div className="flex flex-col gap-2 text-sm text-[#555] dark:text-neutral-300">
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
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" checked={type.includes(item.value)} onChange={e => handleParamChange(setSearchParams, "type", type, e, v => v.toLowerCase())} />
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
                                        <h4 className="font-bold text-xs text-[#888] dark:text-neutral-400 mb-1">Adult Sizes</h4>
                                        {[
                                            { name: "XS", value: "XS" },
                                            { name: "S", value: "S" },
                                            { name: "M", value: "M" },
                                            { name: "L", value: "L" },
                                            { name: "XL", value: "XL" },
                                            { name: "XXL", value: "XXL" }
                                        ].map(item =>
                                            <label key={item.value} className="flex items-center gap-2 cursor-pointer text-[#555] dark:text-neutral-300">
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" checked={sizes.includes(item.value)} onChange={e => handleParamChange(setSearchParams, "sizes", sizes, e, v => v.toUpperCase())} />
                                                {item.name}
                                            </label>
                                        )}
                                    </div>
                                    {/* Separator */}
                                    <hr className='border-gray-200 dark:border-neutral-700 my-2' />
                                    {/* Kids Sizes */}
                                    <div className="flex flex-col gap-2 text-sm mt-2">
                                        <h4 className="font-bold text-xs text-[#888] dark:text-neutral-400 mb-1">Kids Sizes</h4>
                                        {[
                                            { name: "4", value: "4" },
                                            { name: "6", value: "6" },
                                            { name: "8", value: "8" },
                                            { name: "10", value: "10" }
                                        ].map(item =>
                                            <label key={item.value} className="flex items-center gap-2 cursor-pointer text-[#555] dark:text-neutral-300">
                                                <input type="checkbox" value={item.value} className="accent-[#c1a875] w-4 h-4" checked={sizes.includes(item.value)} onChange={e => handleParamChange(setSearchParams, "sizes", sizes, e, v => v.toUpperCase())} />
                                                {item.name}
                                            </label>
                                        )}
                                    </div>
                                    {/* Separator */}
                                    <hr className='border-gray-200 dark:border-neutral-700 my-2' />
                                    {/* Clear Filters Button */}
                                    <div className='flex justify-center'>
                                        <button onClick={() => setSearchParams(prev => {
                                            const params = new URLSearchParams(prev)
                                            params.delete("category")
                                            params.delete("type")
                                            params.delete("sizes")
                                            params.set("page", "1")
                                            return params
                                        })} className="text-sm text-[#c1a875] hover:underline mt-2 cursor-pointer">Clear Filters</button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Products + Sort */}
                        <main className="flex-1 flex flex-col gap-6">
                            {/* Sort Bar */}
                            <div className="flex justify-end mb-2">
                                <select onChange={e => handleParamChange(setSearchParams, "sort", sortBy, e, v => v.toLowerCase())} value={sortBy} className="rounded-2xl border border-gray-200 dark:border-neutral-700 px-4 py-2 text-base bg-neutral-50 dark:bg-neutral-800 shadow-sm focus:ring-2 focus:ring-[#c1a875] focus:outline-none w-auto dark:text-white">
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
                                        : productsList.map(item =>
                                            <div key={item._id} onClick={() => nav(`/product/${item._id}`)} className="flex flex-col items-center group cursor-pointer">
                                                <div className="relative w-[170px] h-[210px] md:w-[140px] md:h-[280px] lg:w-[180px] xl:w-[220px] flex items-center justify-center overflow-hidden mb-4 md:mb-5 rounded-2xl">
                                                    <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />

                                                    {/* Sale Tag */}
                                                    {item.onSale && <SaleProduct />}
                                                </div>
                                                <div className="flex flex-col items-center w-full">
                                                    <h3 className="font-prata text-base md:text-lg text-[#232323] dark:text-neutral-100 mb-1 text-center">
                                                        {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                                                    </h3>

                                                    {/* Sale */}
                                                    {item.onSale
                                                        ? <div className="flex flex-col items-center text-center">
                                                            <div className="flex items-baseline justify-center gap-2">
                                                                <p className="text-[#c1a875] dark:text-[#d3b988] font-bold text-base">${(item.price * (1 - item.discountPercent / 100)).toFixed(2)}</p>
                                                                <p className="text-gray-500 dark:text-neutral-400 font-semibold text-sm line-through">${item.price.toFixed(2)}</p>
                                                            </div>
                                                            <span className="text-sm font-semibold text-[#c1a875] dark:text-[#d3b988] tracking-wide mt-1">{item.discountPercent}% OFF</span>
                                                        </div>
                                                        : <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a] dark:text-neutral-200">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                    }
                                                </div>
                                            </div>
                                        )}
                                </div>

                                {/* Pagination Controls */}
                                {!loading && totalPages > 1 && (
                                    <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">

                                        {/* Prev */}
                                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 rounded-lg bg-[#eee] dark:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <polyline points="15 18 9 12 15 6" />
                                            </svg>
                                        </button>

                                        {/* Page Numbers */}
                                        {getPageNumbers(totalPages, currentPage).map((page, i) =>
                                            page === "..."
                                                ? <span key={`dots-${i}`} className="px-3 text-[#999] dark:text-neutral-400">
                                                    ...
                                                </span>
                                                : <button key={`page-${page}`} onClick={() => handlePageChange(page)} className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${currentPage === page
                                                    ? "bg-[#c1a875] text-white"
                                                    : "bg-[#eee] dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-200 hover:bg-[#c1a875]/30"
                                                    }`}>
                                                    {page}
                                                </button>
                                        )}


                                        {/* Next */}
                                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg bg-[#eee] dark:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                            </div>
                        </main>
                    </div>
                </div>
            </div >

            {/* About Section */}
            < AboutCard />

            {/* Footer */}
            < Footer />
        </div >
    )
}
