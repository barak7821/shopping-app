import { useEffect, useState } from 'react'
import { setTheme, initTheme } from "../utils/darkMode"
import { FiSun, FiMoon } from "react-icons/fi"

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
        <button onClick={handleThemeChange} aria-label={themeBtn ? "Switch to light mode" : "Switch to dark mode"} className="bg-transparent border-none outline-none transition text-neutral-800 hover:text-[#c1a875] focus:text-[#c1a875] active:scale-95 cursor-pointer dark:text-white"
            style={{ lineHeight: 0 }}>
            {themeBtn ? <FiMoon className="text-2xl" /> : <FiSun className="text-2xl" />}
        </button>
    )
}