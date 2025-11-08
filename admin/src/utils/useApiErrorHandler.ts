import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog } from "./log"

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      code?: string;
      [key: string]: any;
    };
  };
  [key: string]: any;
}

interface ApiErrorResult {
  status?: number;
  code?: string;
  message: string;
}


export const useApiErrorHandler = () => {
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })

  const handleApiError = (error: ApiError, context: string = "API request"): ApiErrorResult => {
    const status = error?.response?.status
    const code = error?.response?.data?.code

    // Default message
    let message = "An unexpected error occurred. Please try again later."

    // Shared error codes map
    const errorMap: Record<string, string> = {
      "!field": "Please fill in all required fields.",
      "!email": "Email address is required.",
      "otp_invalid": "Invalid or expired verification code.",
      "otp_expired": "Verification code expired. Please request a new one.",
      "otp_active": "A verification code has already been sent. Please check your email.",
      "blocked": "Too many attempts. Try again later.",
      "too_fast": "Please wait before requesting another code.",
      "email_fail": "Failed to send verification code. Try again later.",
      "invalid_pass": "Invalid password.",
      "same_pass": "New password cannot match the old one.",
      "server_error": "A server error occurred. Please try again later.",
      "google_user": "Password reset is not available for Google sign-in accounts.",
      "exist": "Already exists.",
      "admin": "You can't delete an admin account.",
      "same_user": "You cannot perform this action on your own account",
      "same_status": "The current order status matches the selected status.",
      "cancelled_order": "This order was cancelled and can't be updated.",
      "delivered_order": "This order has already been delivered and can't be updated.",
      "not_found": "Requested resource not found.",
      "same_hero": "The current Hero section is identical to the existing one."
    }

    if (code && errorMap[code]) message = errorMap[code]

    // Display notification
    notyf.error(message)
    errorLog(`Error (${code || "unknown"}) in ${context}`, error)

    return { status, code, message }
  }

  return { handleApiError }
}
