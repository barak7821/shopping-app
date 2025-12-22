import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { log } from "../utils/log"
import { setupAdmin2FA, verifyAdmin2FA } from "../utils/api"
import { useApiErrorHandler } from "../utils/useApiErrorHandler"
import Loading from "../components/Loading"
import { type Setup2FAProps } from "../utils/types"

export default function Setup2FA() {
  const nav = useNavigate()
  const { handleApiError } = useApiErrorHandler()
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<Setup2FAProps | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Verify 2FA setup token from local storage
  useEffect(() => {
    const token = localStorage.getItem("tempToken") // Get token from local storage
    log("Setup2FA token:", token)

    if (!token) { // If no token, redirect to login
      window.location.href = "/login"
      return
    }

    // Initialize 2FA setup
    const initSetup = async () => {
      try {
        const data = await setupAdmin2FA(token)
        setSetupData(data)
      } catch (err) {
        const { code } = handleApiError(err as Error, "initSetup")
        if (code === "invalid_setup" || code === "invalid_token") {
          localStorage.removeItem("tempToken")
          nav("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    initSetup()
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
        nav("/login")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading />
  }


  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4 justify-center items-center">

        {/* 2FA Setup Form */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-xl flex flex-col gap-8">
          <div className="flex flex-col gap-3">

            {/* Title */}
            <h1 className="font-prata text-4xl text-[#181818] dark:text-neutral-100 tracking-wide text-center">
              Two-Factor Setup
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-[#444] dark:text-neutral-300 text-center">
              Scan the QR code with your authenticator app, then enter the 6-digit code to enable 2FA.
            </p>
          </div>

          {setupData
            ? <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-neutral-200">
                  <img src={setupData.qrDataUrl} alt="2FA QR code" className="w-48 h-48" />
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-300 text-center">
                  <div>App name: {setupData.issuer}</div>
                  <div>Email: {setupData.email}</div>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl p-4 text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-200">Manual key</p>
                <p className="font-mono text-sm text-neutral-800 dark:text-neutral-100 mt-1 break-all">
                  {setupData.manualKey}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm text-center">
                  Verification code {error === "code" && <span className="text-red-500">*</span>}
                </label>
                <input id="code" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")), setError("") }} inputMode="numeric" maxLength={6} placeholder="123456" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 text-center tracking-widest" />
                {error === "code" && <p className="text-xs text-red-500 pl-1">Enter the 6-digit code</p>}
              </div>

              <button onClick={handleVerify} disabled={submitting} className="w-full py-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting ? "Verifying..." : "Verify and Enable"}
              </button>
            </div>
            : <p className="text-sm text-red-500 text-center">Unable to load setup details.</p>
          }
        </div>
      </div>
    </div>
  )
}
