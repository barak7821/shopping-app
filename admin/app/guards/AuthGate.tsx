"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import ProtectedRouteAdmin from "./ProtectedRouteAdmin"

const PUBLIC_ROUTES = ["/login", "/setup2fa", "/verify2fa"]

const isPublicRoute = (pathname: string) => {
    return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export default function AuthGate({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    if (isPublicRoute(pathname)) {
        return <>{children}</>
    }

    return <ProtectedRouteAdmin>{children}</ProtectedRouteAdmin>
}
