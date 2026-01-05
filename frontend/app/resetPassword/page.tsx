import { Suspense } from "react"
import ResetPasswordClient from "./ResetPasswordClient"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex items-center justify-center text-[#555] dark:text-neutral-300 font-montserrat">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
