import rateLimit from "express-rate-limit"

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    code: "rate_limit",
    message: "Too many requests, Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
})

export default apiLimiter

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    code: "rate_limit_auth",
    message: "Too many login attempts, Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const orderCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    code: "rate_limit_order",
    message: "Too many order attempts, please try again"
  }
})