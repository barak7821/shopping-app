import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { errorLog } from "../lib/logger";
import { checkAdminAuth } from "../api/apiClient";

interface AuthResponse {
  exist: boolean
  role?: string
  provider?: string
  mfa?: boolean
  aud?: string
}

interface AdminAuthContextType {
  isAuthenticated: boolean | null
  loading: boolean
  token: string | null
}

// Create a global context to share authentication state across the app
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem("token") : null)
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenUrl = params.get("token");

    if (tokenUrl) {
      localStorage.setItem("token", tokenUrl);
      setToken(tokenUrl);
      window.history.replaceState({}, document.title, "/");
    }
  }, [])

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      const token = localStorage.getItem("token")

      // No token = user is not logged in
      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      // Token exist, verify with backend
      try {
        const data: AuthResponse = await checkAdminAuth()

        if (!data.exist) { // If user does not exist, reset auth state
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        if (data.provider && data.provider !== "local") {
          // If user logged in via 3rd party provider, they cannot access admin panel
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        const isAdminUser = data.exist && data.role === "admin" && data.aud === "admin" && data.mfa === true
        setIsAuthenticated(isAdminUser) // Only admins are authenticated here
        return
      } catch (error) {
        errorLog("Error in checkAuth:", error)
        setIsAuthenticated(false) // If fails, reset auth state
        return
      } finally {
        setLoading(false) // Set loading to false
      }
    }

    checkAuth()
  }, [token]) // re-run when token changes (e.g. login/logout)

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, loading, token }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// Custom hook to easily use auth state in any component
export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
