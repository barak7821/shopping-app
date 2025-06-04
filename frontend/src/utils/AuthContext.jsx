import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { errorLog, log } from "./log";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [isAdmin, setIsAdmin] = useState(null)

    // This is the base URL for the API.
    const baseApiUrl = `${import.meta.env.VITE_BACKEND_URL}/api`

    // Get token from local storage
    const token = localStorage.getItem("token")

    // Check if the user is authenticated
    const checkAuth = async () => {
        // If no token, set isAuthenticated to false
        if (!token) {
            setIsAuthenticated(false)
            return
        }

        // Check if token is valid
        try {
            const { data } = await axios.get(`${baseApiUrl}/auth`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setIsAuthenticated(data.exist)
            log("User is authenticated:", data.exist)
        } catch (error) {
            errorLog("Error in checkAuth:", error)
            setIsAuthenticated(false)
            return
        }

        // If the user is authenticated, check if they are an admin
        try {
            // If no token, set isAuthenticated to false
            if (!token) {
                setIsAuthenticated(false)
                return
            }

            const { data } = await axios.get(`${baseApiUrl}/admin/check`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setIsAdmin(data.isAdmin)
        } catch (error) {
            errorLog("Failed to check admin status", error)
            setIsAdmin(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [token])

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)