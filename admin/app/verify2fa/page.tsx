"use client"
import { useEffect, useState } from "react"
import { verifyAdmin2FA } from "../api/apiClient"
import { useApiErrorHandler } from "../hooks/useApiErrorHandler"
import { log } from "../lib/logger"
import { useRouter } from "next/navigation"

export default function Verify2FA() {
const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { handleApiError } = useApiErrorHandler()

  useEffect(() => {
    const token = localStorage.getItem("tempToken") // Get token from local storage
    log("Verify2FA token:", token)

    if (!token) { // If no token, redirect to login
      window.location.href = "/login"
      return
    }
  }, [])

  const handleVerify = async () => {
    const token = localStorage.getItem("tempToken")
    if (!token) {
      window.location.href = "/login"
      return
    }

    if (!code.trim() || code.trim().length < 6) {
      setError("code")
      return
    }

    setSubmitting(true)
    try {
      const data = await verifyAdmin2FA(token, code)
      localStorage.setItem("token", data.token)
      localStorage.removeItem("tempToken")
      window.location.href = "/"
    } catch (err) {
      const { code } = handleApiError(err as Error, "handleVerify")
      if (code === "invalid_token") {
        localStorage.removeItem("tempToken")
        router.push("/login")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4 justify-center items-center">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7">

          <div className="flex flex-col gap-3">
            {/* Title */}
            <h1 className="font-prata text-4xl text-[#181818] dark:text-neutral-100 tracking-wide text-center">
              Verify 2FA
            </h1>
            {/* Subtitle */}
            <p className="text-sm text-[#444] dark:text-neutral-300 text-center">
              Enter the 6-digit code from your authenticator app to continue.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">
              Verification code {error === "code" && <span className="text-red-500">*</span>}
            </label>
            <input id="code" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")), setError("") }} inputMode="numeric" maxLength={6} placeholder="123456" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 text-center tracking-widest" />
            {error === "code" && <p className="text-xs text-red-500 pl-1">Enter the 6-digit code</p>}
          </div>

          <button onClick={handleVerify} disabled={submitting} className="w-full py-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            {submitting ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  )
}
