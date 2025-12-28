import { useEffect, useState } from "react"
import { FiX } from "react-icons/fi";
import { log } from '../lib/logger';
import { findProductsSearch } from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";
import type { Product } from "../types/types";

export default function SearchBar({ setSearchOpen }: { setSearchOpen: (open: boolean) => void }) {
    const nav = useNavigate()
    const [searchInput, setSearchInput] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const { handleApiError } = useApiErrorHandler()

    const handleSearch = async () => {
        log("Search initiated with input:", searchInput)

        try {
            const data = await findProductsSearch(searchInput.toLowerCase().trim())
            setSearchResults(data)
            log("Search results:", data)
        } catch (error) {
            handleApiError(error, "handleSearch")
        }
    }

    useEffect(() => {
        if (searchInput.trim() === "" || searchInput.length < 3) {
            setSearchResults([])
            return
        }

        const delaySearch = setTimeout(() => {
            handleSearch()
        }, 300) // Debounce search input to avoid too many requests

        return () => clearTimeout(delaySearch)
    }, [searchInput])

    const handleClick = () => {
        if (searchInput.trim().length > 0) {
            nav(`/search?q=${encodeURIComponent(searchInput)}`)
        }

        setSearchResults([])
        setSearchInput("")
        setSearchOpen(false)
        return
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSearchOpen(false)} aria-label="Close Search Overlay" />
            <div className="inset-0 z-50 flex flex-col pointer-events-none">
                <div className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm sticky top-0 shadow-sm pointer-events-auto">
                    <div className="max-w-screen-xl mx-auto flex items-center gap-2 px-24 py-3 relative">
                        {/* Search */}
                        <div className="flex flex-1 gap-2 items-center relative">
                            <input type="text" autoFocus placeholder="Search for products, categories, etc…" value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-base bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#c1a875] transition dark:placeholder-neutral-400 dark:text-white" />
                            {/* Close */}
                            {searchResults.length > 0 &&
                                <button onClick={() => setSearchInput("")} aria-label="Close Search" className="mr-2 absolute right-1 top-1/2 transform -translate-y-1/2">
                                    <FiX size={22} className="text-neutral-700 dark:text-neutral-300 cursor-pointer" />
                                </button>
                            }
                        </div>

                        {/* To All Results Button */}
                        {searchResults.length > 0 &&
                            <button onClick={handleClick} className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition cursor-pointer">
                                <span>To all results</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                </svg>
                            </button>
                        }
                    </div>
                    <hr className="border-[#e6dfd2] dark:border-neutral-700" />
                    {searchResults.length > 0 &&
                        <div className="absolute left-0 right-0 top-full mx-auto w-full max-w-2xl bg-white dark:bg-neutral-800 shadow-xl rounded-b-xl z-50 max-h-192 overflow-y-auto border-t border-neutral-200 dark:border-neutral-700">
                            {searchResults.map((product: Product, index) => (
                                <div key={index} onClick={() => nav(`/product/${product._id}`)} className="flex items-center gap-4 border-b dark:border-neutral-700 last:border-b-0 py-3 px-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition">
                                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-lg" />
                                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{product.title.replace(/\b\w/g, l => l.toUpperCase())}</h3>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </>
    )
}
