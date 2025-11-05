import { useAdminAuth } from './AdminAuthContext'
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, loading } = useAdminAuth()

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-b from-[#f6f4f1] to-[#e9e5df] dark:from-[#0b0b0b] dark:to-[#1a1a1a] transition-colors">
                <div className="flex flex-col items-center gap-3 animate-fadeIn">
                    <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide">
                        Redirecting
                    </h1>
                    <div className="flex gap-1 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c1a875] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c1a875] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c1a875] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                </div>

                {/* fade-in */}
                <style>
                    {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(6px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}
                </style>
            </div>
        )
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