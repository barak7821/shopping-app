"use client"
import { useEffect, useState } from "react"
import type { Notyf as NotyfType } from "notyf"
import "notyf/notyf.min.css"

export const useNotyf = () => {
    const [notyf, setNotyf] = useState<NotyfType | null>(null)

    useEffect(() => {
        let isMounted = true

        if (typeof window === "undefined") return

        void import("notyf").then((mod) => {
            if (!isMounted) return
            setNotyf(new mod.Notyf({ position: { x: "center", y: "top" } }))
        })

        return () => {
            isMounted = false
        }
    }, [])

    return notyf
}
