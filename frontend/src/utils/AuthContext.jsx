import { createContext, useContext, useEffect, useState } from "react";
import { errorLog } from "./log";
import { checkUserAdmin, checkUserAuth } from "./api";

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
            } catch (error) {
                errorLog("Error in checkAuth:", error)
                setIsAuthenticated(false) // If fails, reset auth state
                setProvider(null) // Same for provider
                return
            }
        }

        checkAuth()
    }, [token]) // re-run when token changes (e.g. login/logout)

    // Check if the user is admin
    const checkAdmin = async () => {
        if (!isAuthenticated) {
            setIsAdmin(false)
            return
        }
        try {
            const data = await checkUserAdmin()
            setIsAdmin(data.isAdmin)
        } catch (error) {
            errorLog("Failed to check admin status", error)
            setIsAdmin(false)
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin, checkAdmin, provider }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to easily use auth state in any component
export const useAuth = () => useContext(AuthContext)