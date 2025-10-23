import { useAdminAuth } from './AdminAuthContext'
import Loading from '../components/Loading';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, loading } = useAdminAuth()

    if (loading) {
        return <Loading />
    }

    if (!isAuthenticated) {
        // If the user is not authenticated, remove the token from local storage and redirect to the login page
        localStorage.removeItem("token")
        window.location.replace(import.meta.env.VITE_FRONTEND_URL)
        return null
    }

    if (!isAdmin) {
        window.location.replace(import.meta.env.VITE_FRONTEND_URL)
        return null
    }

    return (
        <>
            {children}
        </>
    )
}