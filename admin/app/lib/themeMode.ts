// Global variable to store the media query and listener
let systemMedia: MediaQueryList | null = null
let systemListener: ((event: MediaQueryListEvent) => void) | null = null

// Possible theme modes
type ThemeMode = "dark" | "light" | "system"

// Function to set the theme based on the mode
export function setTheme(mode: ThemeMode): void {
    if (typeof window === "undefined") {
        return
    }

    // Root element
    const root = document.documentElement

    // Check if the mode is chosen by the user
    if (mode === "dark" || mode === "light") {
        // If dark mode is chosen, add the class to the root element and set the local storage
        root.classList.toggle("dark", mode === "dark")
        localStorage.setItem("theme", mode)
        // Remove the system media query and listener if they exist
        if (systemMedia && systemListener) {
            systemMedia.removeEventListener("change", systemListener)
            systemMedia = null
            systemListener = null
        }
    }

    // If the mode is not chosen by the user, check the system preference
    else {
        // Remove from local storage
        localStorage.removeItem("theme")

        // If the system preference is dark, add the class to the root element
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.classList.toggle("dark", isDark)

        // If the system media query and listener do not exist, create them
        if (!systemMedia) {
            systemMedia = window.matchMedia("(prefers-color-scheme: dark)")
            systemListener = (event: MediaQueryListEvent) => {
                document.documentElement.classList.toggle("dark", event.matches)
            }
            systemMedia.addEventListener("change", systemListener)
        }
    }
}

// Function to set theme based on the local storage or system preference
export function initTheme(): void {
    if (typeof window === "undefined") {
        return
    }

    // Check if the user has a preference in local storage
    const stored = localStorage.getItem("theme") as ThemeMode | null

    // If the user has a preference, set the theme based on it
    if (stored === "dark" || stored === "light") {
        setTheme(stored)
    } else {
        // If the user does not have a preference, set the theme based on the system preference
        setTheme("system")
    }
}
