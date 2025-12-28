import { useEffect, useState } from 'react'
import { setTheme, initTheme } from "../lib/themeMode"

export default function Theme() {
    const [themeBtn, setThemeBtn] = useState(false)
    // Set theme mode
    initTheme()

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme")
        if (storedTheme === "dark") {
            setThemeBtn(true)
        } else {
            setThemeBtn(false)
        }
    }, [])

    const handleThemeChange = () => {
        setThemeBtn(prev => {
            const newThemeState = !prev
            setTheme(newThemeState ? "dark" : "light")
            return newThemeState
        })
    }

    return (
        <button onClick={handleThemeChange} aria-label={themeBtn ? "Switch to light mode" : "Switch to dark mode"} className="bg-transparent border-none outline-none transition text-neutral-800 hover:text-[#c1a875] focus:text-[#c1a875] active:scale-95 cursor-pointer dark:text-white">
            {themeBtn
                ? <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-moon">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                : <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sun">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            }
        </button>
    )
}