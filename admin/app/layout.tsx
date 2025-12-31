import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AuthGate from "./guards/AuthGate";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Panel"
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </AdminAuthProvider>
      </body>
    </html>
  )
}
