import { createContext, useContext, useEffect, useState } from "react";
import { errorLog } from "./log";
import { checkUserAuth } from "./api";

// Create a global context to share authentication state across the app
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [isAdmin, setIsAdmin] = useState(null)
    const [provider, setProvider] = useState(null)
    const [loading, setLoading] = useState(true)

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

                if (!data.exist) { // If user does not exist, reset auth state
                    setIsAuthenticated(false)
                    setProvider(null)
                    setIsAdmin(false)
                    setLoading(false)
                    return
                }

                setIsAuthenticated(data.exist) // true/false from backend
                setProvider(data.provider || null) // Set provider if exist
                setIsAdmin(data.provider === "local" ? data.role === "admin" : false) // Check if user is admin
                setLoading(false)
                return
            } catch (error) {
                errorLog("Error in checkAuth:", error)
                setIsAuthenticated(false) // If fails, reset auth state
                setProvider(null) // Same for provider
                setIsAdmin(false) // Same for admin
                return
            } finally {
                setLoading(false) // Set loading to false
            }
        }

        checkAuth()
    }, [token]) // re-run when token changes (e.g. login/logout)

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin, provider, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to easily use auth state in any component
export const useAuth = () => useContext(AuthContext)