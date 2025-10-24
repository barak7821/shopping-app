import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog } from "../utils/log"

export const useApiErrorHandler = () => {
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })

  const handleApiError = (error, context = "API request") => {
    const status = error?.response?.status
    const code = error?.response?.data?.code

    // Default message
    let message = "An unexpected error occurred. Please try again later."

    // Shared error codes map
    const errorMap = {
      "!field": "Please fill in all required fields.",
      "!email": "Email address is required.",
      "otp_invalid": "Invalid or expired verification code.",
      "otp_expired": "Verification code expired. Please request a new one.",
      "otp_active": "A verification code has already been sent. Please check your email.",
      "blocked": "Too many attempts. Try again later.",
      "too_fast": "Please wait before requesting another code.",
      "email_fail": "Failed to send verification code. Try again later.",
      "invalid_pass": "Password must meet security requirements.",
      "same_pass": "New password cannot match the old one.",
      "server_error": "A server error occurred. Please try again later.",
      "google_user": "Password reset is not available for Google sign-in accounts.",
      "exist": "Already exists.",
    }

    if (code && errorMap[code]) message = errorMap[code]

    // Display notification
    notyf.error(message)
    errorLog(`Error (${code || "unknown"}) in ${context}`, error)

    return { status, code, message }
  }

  return { handleApiError }
}
