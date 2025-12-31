"use client"
import { useMemo } from "react"
import { Notyf } from "notyf"
import "notyf/notyf.min.css"

export const useNotyf = () => {
    return useMemo(() => {
        if (typeof window === "undefined") return null
        return new Notyf({ position: { x: "center", y: "top" } })
    }, [])
}