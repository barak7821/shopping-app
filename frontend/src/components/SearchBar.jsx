import React, { useState } from "react"
import { FiSearch, FiX } from "react-icons/fi"

export default function SearchBar({ setSearchOpen, onSearch }) {
    const [query, setQuery] = useState("")

    const handleSearch = (e) => {
        e.preventDefault()
        if (onSearch) onSearch(query)
    }

    return (
        <div className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="max-w-screen-xl mx-auto flex items-center gap-2 px-4 py-4">
                {/* Close */}
                {setSearchOpen &&
                    <button onClick={() => setSearchOpen(false)} aria-label="Close Search" className="mr-2">
                        <FiX size={22} className="text-neutral-700 dark:text-neutral-300" />
                    </button>
                }
                {/* Search */}
                <form onSubmit={handleSearch} className="flex flex-1 gap-2 items-center">
                    <input type="text" autoFocus placeholder="Search for products, categories, etc…" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-base bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#c1a875] transition"
                    />
                    <button type="submit" aria-label="Search" className="bg-[#c1a875] hover:bg-[#af9461] transition rounded-xl px-4 py-2 text-white font-semibold flex items-center gap-1">
                        <FiSearch size={18} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
