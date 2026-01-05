import { Suspense } from "react"
import LogsClient from "./LogsClient"

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LogsClient />
    </Suspense>
  )
}
