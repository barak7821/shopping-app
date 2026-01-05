import { Suspense } from "react"
import DeletedCustomersClient from "./DeletedCustomersClient"

export default function DeletedCustomersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DeletedCustomersClient />
    </Suspense>
  )
}
