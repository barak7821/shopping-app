import { Suspense } from "react"
import ArchivedProductsClient from "./ArchivedProductsClient"

export default function ArchivedProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ArchivedProductsClient />
    </Suspense>
  )
}
