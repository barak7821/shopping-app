import { createContext, useContext, useEffect, useState } from "react";
import { errorLog } from "./log";
import { checkUserAdmin, checkUserAuth } from "./api";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [isAdmin, setIsAdmin] = useState(null)

    // Get token from local storage
    const token = localStorage.getItem("token")

    useEffect(() => {
        // Check if the user is authenticated
        const checkAuth = async () => {
            // If no token, set isAuthenticated to false
            if (!token) {
                setIsAuthenticated(false)
                return
            }

            // Check if token is valid
            try {
                const data = await checkUserAuth()
                // reload page if user is authenticated
                setIsAuthenticated(data.exist)
            } catch (error) {
                errorLog("Error in checkAuth:", error)
                setIsAuthenticated(false)
                return
            }
        }

        checkAuth()
    }, [token])

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
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin, checkAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)