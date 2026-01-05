import { Suspense } from "react"
import OrdersClient from "./OrdersClient"

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrdersClient />
    </Suspense>
  )
}
