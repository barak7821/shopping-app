import crypto from "crypto"
import { UserIdLike } from "./types.js"

// Generate a secure 6-digit OTP code
export const generate6DigitOtp = () => {
  const n = crypto.randomInt(0, 1000000)
  return String(n).padStart(6, "0")
}

// Hash OTP using HMAC with pepper and user ID
export const hashOtp = (otp: string, userId: UserIdLike) => {
  const pepper = process.env.OTP_PEPPER
  if (!pepper) throw new Error("Missing OTP_PEPPER in environment variables")

  return crypto
    .createHmac("sha256", pepper)
    .update(otp + userId.toString())
    .digest("hex")
}

// Verify OTP by comparing hashed values securely
export const verifyOtpHash = (otp: string, userId: UserIdLike, storedHash: string) => {
  const pepper = process.env.OTP_PEPPER
  if (!pepper) throw new Error("Missing OTP_PEPPER in environment variables")

  const candidate = hashOtp(otp, userId)

  const a = Buffer.from(candidate, "hex")
  const b = Buffer.from(storedHash, "hex")

  // Pad buffers to the same length to prevent timing attacks
  const maxLen = Math.max(a.length, b.length)
  const aPadded = Buffer.concat([a, Buffer.alloc(maxLen - a.length)])
  const bPadded = Buffer.concat([b, Buffer.alloc(maxLen - b.length)])

  return a.length === b.length && crypto.timingSafeEqual(aPadded, bPadded)
}
