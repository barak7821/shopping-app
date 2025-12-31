"use client"
import { useEffect, useState } from "react"
import SideBar from "../components/SideBar"
import { findProductsSearch, updateBestSellerSection } from "../services/apiClient"
import { useApiErrorHandler, type ApiError } from "../hooks/useApiErrorHandler"
import { log } from "../lib/logger"
import { type Product } from "../types/types";
import { useNotyf } from "../hooks/useNotyf"

export default function BestSeller() {
    const notyf = useNotyf()
    const [searchInput, setSearchInput] = useState("")
    const [results, setResults] = useState<Product[]>([])
    const [selected, setSelected] = useState<Product[]>([])
    const { handleApiError } = useApiErrorHandler()

    const getProducts = async () => {
        try {
            const data = await findProductsSearch(searchInput.toLowerCase().trim())
            setResults(data)
            log("Search results:", data)
        } catch (error) {
            handleApiError(error as ApiError, "getProducts")
        }
    }

    useEffect(() => {
        if (searchInput.trim() === "" || searchInput.length < 3) {
            setResults([])
            return
        }

        const delaySearch = setTimeout(() => {
            getProducts()
        }, 300) // Debounce search input to avoid too many requests

        return () => clearTimeout(delaySearch)
    }, [searchInput])

    const handleAddItem = (item: Product) => {
        if (selected.find(product => product._id === item._id)) return notyf?.error("Item already selected")
        if (selected.length === 5) return notyf?.error("You can only select 5 products")
        setSelected(prev => [...prev, item])
    }

    const handleRemoveItem = (id: any) => {
        setSelected(prev => prev.filter(product => product._id !== id))
    }

    const handleSave = async () => {
        if (selected.length === 0) return notyf?.error("Please select at least one product")
        if (selected.length !== 5) return notyf?.error("Please select 5 products")
        log("Selected products:", selected)

        try {
            await updateBestSellerSection(selected)
            log("Best seller section updated successfully!")
            setSelected([])
            setSearchInput("")
            setResults([])
            notyf?.success("Best seller section updated successfully!")
        } catch (error) {
            handleApiError(error as ApiError, "handleSave")
        }
    }

    const handleMoveItem = (id: any, direction: "up" | "down") => {
        if (direction === "up") {
            const index = selected.findIndex(product => product._id === id)
            if (index > 0) {
                const item = selected[index]
                const newSelected = [...selected]
                newSelected.splice(index, 1)
                newSelected.splice(index - 1, 0, item)
                setSelected(newSelected)
            }
        }
        if (direction === "down") {
            const index = selected.findIndex(product => product._id === id)
            if (index < selected.length - 1) {
                const item = selected[index]
                const newSelected = [...selected]
                newSelected.splice(index, 1)
                newSelected.splice(index + 1, 0, item)
                setSelected(newSelected)
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                {/* Sidebar */}
                <SideBar />

                {/* Main */}
                <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10 flex flex-col gap-10">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#eee] dark:border-neutral-700 pb-6">
                        <div>
                            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">
                                Best Sellers
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                                Choose which products will appear in the homepage Best Seller section.
                            </p>
                        </div>

                        {/* Save Selection */}
                        <button onClick={handleSave} disabled={selected.length < 5} className={`px-6 py-2.5 rounded-2xl font-semibold text-base transition shadow-md border
              ${selected.length < 5
                                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-700"
                                : "bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#c1a875] hover:text-[#1a1a1a] hover:border-[#c1a875] active:scale-95 cursor-pointer"}`}>
                            Save Selection
                        </button>
                    </div>

                    {/* Search */}
                    <section className="p-6 rounded-2xl bg-[#faf8f6] dark:bg-neutral-800/50 border border-[#eee] dark:border-neutral-700 shadow-sm">
                        <h2 className="text-xl font-semibold text-[#1a1a1a] dark:text-neutral-100 mb-4">
                            Search for Products
                        </h2>

                        <div className="relative">
                            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Type a product name..." className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-base focus:ring-2 focus:ring-[#c1a875] focus:outline-none dark:text-neutral-100" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-neutral-400">
                                {results.length} results
                            </div>
                        </div>

                        {/* Results */}
                        <div className="mt-5 max-h-80 overflow-auto rounded-xl border border-[#efe7db] dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
                            {results.length === 0
                                ? <div className="p-6 text-sm text-gray-500 dark:text-neutral-400 text-center">
                                    No results found.
                                </div>
                                : <ul className="divide-y divide-[#f1e7d9] dark:divide-neutral-700">
                                    {results.map(item => (
                                        <li key={item._id} className="flex items-center gap-4 p-4 hover:bg-[#faf8f6] dark:hover:bg-neutral-700/50 transition">
                                            <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl border border-[#efe7db] dark:border-neutral-600" />
                                            <div className="flex-1">
                                                <p className="font-medium text-[#232323] dark:text-neutral-100">
                                                    {item.title}
                                                </p>
                                                <p className={`text-sm ${item.onSale ? "text-[#c1a875] font-semibold" : "text-[#777] dark:text-neutral-400"}`}>
                                                    {item.onSale ? `$${(item.price * (1 - item.discountPercent / 100)).toFixed(2)} (On sale)` : `$${item.price}`}
                                                </p>
                                            </div>
                                            {/* Add */}
                                            <button onClick={() => handleAddItem(item)} className="px-4 py-2 rounded-xl border border-[#1a1a1a] bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition shadow-sm active:scale-95 cursor-pointer dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-white dark:hover:text-[#1a1a1a]">
                                                Add
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>
                    </section>

                    {/* Selected Items */}
                    <section className="p-6 rounded-2xl bg-[#faf8f6] dark:bg-neutral-800/50 border border-[#eee] dark:border-neutral-700 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold text-[#1a1a1a] dark:text-neutral-100">
                                Selected Items
                            </h2>
                            <span className="text-xs px-3 py-1 rounded-full bg-[#c1a875]/15 text-[#8a6b3b] dark:bg-[#c1a875]/20 dark:text-[#dec7a1]">
                                {selected.length} selected
                            </span>
                        </div>

                        {selected.length === 0
                            ? <p className="text-sm text-gray-500 dark:text-neutral-400">
                                No items selected.
                            </p>
                            : <div className="flex flex-col gap-3">
                                {selected.map(item => (
                                    <div key={item._id} className="flex items-center gap-4 p-3 rounded-xl border border-[#efe7db] dark:border-neutral-700 bg-white dark:bg-neutral-800/60 hover:bg-[#f9f5ef] dark:hover:bg-neutral-700/60 transition">
                                        <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg border border-[#efe7db] dark:border-neutral-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#232323] dark:text-neutral-100">
                                                {item.title}
                                            </p>
                                            <p className={`text-xs ${item.onSale ? "text-[#c1a875] font-semibold" : "text-[#777] dark:text-neutral-400"}`}>
                                                {item.onSale ? `$${(item.price * (1 - item.discountPercent / 100)).toFixed(2)} (On sale)` : `$${item.price}`}
                                            </p>
                                        </div>

                                        {/* Up / Down */}
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <button onClick={() => handleMoveItem(item._id, "up")} className="text-[#c1a875] hover:text-[#8a6b3b] transition cursor-pointer">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleMoveItem(item._id, "down")} className="text-[#c1a875] hover:text-[#8a6b3b] transition cursor-pointer">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button onClick={() => handleRemoveItem(item._id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition text-sm active:scale-95 cursor-pointer dark:bg-red-900/50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-800">
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        }
                    </section>
                </div>
            </div>
        </div>
    )
}