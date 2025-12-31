import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Shop App",
  description: "A Demo Shop App"
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!googleClientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID")
  }

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </GoogleOAuthProvider>
        </CartProvider>
      </body>
    </html>
  )
}
