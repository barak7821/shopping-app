import { Suspense } from "react"
import CustomersClient from "./CustomersClient"

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CustomersClient />
    </Suspense>
  )
}
