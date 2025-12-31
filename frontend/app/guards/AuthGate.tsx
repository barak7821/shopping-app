"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import ProtectedRouteAuth from "./ProtectedRouteAuth"

const PUBLIC_ROUTES = [
    "/",
    "/register",
    "/login",
    "/resetPassword",
    "/cart",
    "/collection",
    "/checkout",
    "/payment",
    "/orderSuccess",
    "/product",
    "/about",
    "/contact",
    "/search"
]

const isPublicRoute = (pathname: string) => {
    return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export default function AuthGate({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    if (isPublicRoute(pathname)) {
        return <>{children}</>
    }

    return <ProtectedRouteAuth>{children}</ProtectedRouteAuth>
}
