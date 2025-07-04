import React, { useEffect, useState } from "react"
import { FiSearch, FiX } from "react-icons/fi";
import { errorLog, log } from '../utils/log';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { findProductsLimited } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ setSearchOpen }) {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [searchInput, setSearchInput] = useState("")
    const [searchResults, setSearchResults] = useState([])

    const handleSearch = async (e) => {
        log("Search initiated with input:", searchInput)

        try {
            const data = await findProductsLimited(searchInput.toLowerCase().trim());

            if (!data || data.length === 0) {
                log("No products found for search input:", searchInput)
                return
            }

            const products = data.map(product => ({
                ...product,
                _id: product._id,
                title: product.title.replace(/\b\w/g, l => l.toUpperCase()),
                category: product.category.replace(/\b\w/g, l => l.toUpperCase()),
                type: product.type.replace(/\b\w/g, l => l.toUpperCase()),
                price: product.price.toFixed(2),
                image: product.image,
                description: product.description,
                sizes: product.sizes,
            }))

            setSearchResults(products)
            log("Search results:", products)
        } catch (error) {
            errorLog("Error during fetching products", error)
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

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSearchOpen(false)} aria-label="Close Search Overlay" />
            <div className="inset-0 z-50 flex flex-col pointer-events-none">
                <div className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm sticky top-0 shadow-sm pointer-events-auto">
                    <div className="max-w-screen-xl mx-auto flex items-center gap-2 px-24 py-3 relative">
                        {/* Search */}
                        <form className="flex flex-1 gap-2 items-center" onSubmit={e => (e.preventDefault(), searchInput.trim().length > 0 && nav(`/search?q=${encodeURIComponent(searchInput)}`), setSearchOpen(false))}>
                            <input type="text" autoFocus placeholder="Search for products, categories, etc…" value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-base bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#c1a875] transition dark:placeholder-neutral-400 dark:text-white" />
                        </form>
                        {/* Close */}
                        {setSearchOpen &&
                            <button onClick={() => setSearchOpen(false)} aria-label="Close Search" className="mr-2">
                                <FiX size={22} className="text-neutral-700 dark:text-neutral-300 cursor-pointer" />
                            </button>
                        }
                    </div>
                    <hr className="border-[#e6dfd2] dark:border-neutral-700" />
                    {searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mx-auto w-full max-w-2xl bg-white dark:bg-neutral-800 shadow-xl rounded-b-xl z-50 max-h-192 overflow-y-auto border-t border-neutral-200 dark:border-neutral-700">
                            {searchResults.map((product, index) => (
                                <div key={index} onClick={() => nav(`/product/${product._id}`)} className="flex items-center gap-4 border-b dark:border-neutral-700 last:border-b-0 py-3 px-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition">
                                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-lg" />
                                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{product.title}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}