import { createContext, useContext, useEffect, useState } from "react";
import { errorLog, log } from "./log";
import { checkUserAuth } from "./api";

// Create a global context to share authentication state across the app
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [isAdmin, setIsAdmin] = useState(null)
    const [provider, setProvider] = useState(null)

    // Get token from local storage
    const token = localStorage.getItem("token")

    useEffect(() => {
        // Check if the user is authenticated
        const checkAuth = async () => {
            // No token = user is not logged in
            if (!token) {
                setIsAuthenticated(false)
                setProvider(null)
                return
            }

            try {
                // Ask backend if token is valid
                const data = await checkUserAuth()

                setIsAuthenticated(data.exist) // true/false from backend

                if (data.provider) setProvider(data.provider) // If provide exist, send it
                if (data.role === "admin") { // Check if user is admin
                    setIsAdmin(true)
                } else {
                    setIsAdmin(false)
                }

            } catch (error) {
                errorLog("Error in checkAuth:", error)
                setIsAuthenticated(false) // If fails, reset auth state
                setProvider(null) // Same for provider
                setIsAdmin(false) // Same for admin
                return
            }
        }

        checkAuth()
    }, [token]) // re-run when token changes (e.g. login/logout)

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin, provider }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to easily use auth state in any component
export const useAuth = () => useContext(AuthContext)