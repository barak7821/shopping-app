import React from 'react'
import { useAuth } from './AuthContext'
import { Navigate } from 'react-router-dom'
import Loading from '../components/Loading';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <Loading />
    }

    if (!isAuthenticated) {
        // If the user is not authenticated, remove the token from local storage and redirect to the login page
        localStorage.removeItem("token")
        return <Navigate to="/" replace />
    }

    return (
        <>
            {children}
        </>
    )
}