"use client"
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <Loading />
    }

    if (!isAuthenticated) {
        // If the user is not authenticated, remove the token from local storage and redirect to the login page
        localStorage.removeItem("token")
        window.location.replace("/")
        return null
    }

    return (
        <>
            {children}
        </>
    )
}
