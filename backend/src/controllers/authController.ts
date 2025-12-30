import jwt from "jsonwebtoken"
import User, { googleSchema, localSchema, updatePasswordSchemaJoi } from "../models/userModel.js"
import { checkPassword, hashPassword } from "../utils/passwordUtils.js"
import { log, errorLog } from "../utils/logger.js"
import { getErrorMessage } from "../utils/errorUtils.js"
import { sendOtpEmail } from "../utils/sendOtpEmail.js"
import { generate6DigitOtp, hashOtp, verifyOtpHash } from "../utils/otpUtils.js"
import axios from "axios"
import { sendAccountCreatedEmail, sendAccountPasswordChangedEmail } from "../utils/userNotifications.js"
import type { AuthHandler } from "../utils/types.js"

// Controller to register
export const register: AuthHandler = async (req, res) => {
    const { name, email, password } = req.body
    const provider = "local"
    if (!name || !email || !password) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Check if email already exists
        const user = await User.findOne({ email: email.toLowerCase() })
        if (user) return res.status(409).json({ code: "exist", message: "User already exists" })

        // Validate input against Joi schema
        await localSchema.validateAsync({ name, email, password, provider })

        // Hash the password
        const hashedPassword = await hashPassword(password)

        // Create a new user
        const newUser = new User({
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            provider
        })

        // Save the new user to the database
        await newUser.save()

        sendAccountCreatedEmail(newUser).catch(error => errorLog("Failed to send account created email", getErrorMessage(error)))

        // Ensure JWT_SECRET is defined in the environment variables
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined")

        // Generate a JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        log(`${email} added successfully`)
        res.status(201).json({ message: `${email} added successfully`, token, exist: false })
    } catch (error) {
        errorLog("Error in register controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to login
export const login: AuthHandler = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
        if (!user) return res.status(401).json({ code: "invalid_pass", message: "Invalid credentials" })
        if (!user.password) return res.status(401).json({ code: "invalid_pass", message: "Invalid credentials" })

        // Verify the password
        const isPasswordValid = await checkPassword(password, user.password)
        if (!isPasswordValid) return res.status(401).json({ code: "invalid_pass", message: "Invalid credentials" })

        // Ensure JWT_SECRET is defined in the environment variables
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined")

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

        log(`${email} logged in successfully`)
        res.status(200).json({ message: `${email} logged in successfully`, token, exist: false })
    } catch (error) {
        errorLog("Error in login controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller for checking if the user is authenticated based on the JWT token
export const checkAuth: AuthHandler = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ exist: false })
        res.status(200).json({ exist: true, provider: req.user.provider, role: req.user.role })
    } catch (error) {
        errorLog("Error in checkAuth controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to send OTP
export const sendOtp: AuthHandler = async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ code: "!field", message: "Email is required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+otpCode +otpExpiresAt +otpLastSentAt +otpAttempts +otpBlockedUntil")

        // Always return a neutral response for non-existing accounts
        if (!user) return res.status(200).json({ message: "OTP sent successfully if the account exists" })

        // Check if user google sign-in account 
        if (user.provider === "google") return res.status(403).json({ code: "google_user", message: "Password reset is not available for Google sign-in accounts." })

        // Check if the user is temporarily blocked
        if (user.otpBlockedUntil && user.otpBlockedUntil.getTime() > Date.now()) {
            return res.status(429).json({ code: "blocked", message: "Too many requests, Try again later." })
        }

        // Prevent spamming (limit: 1 request every 2 minutes)
        if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 2 * 60 * 1000) {
            return res.status(429).json({ code: "too_fast", message: "Please wait before requesting another code" })
        }

        // If a valid OTP already exists, do not create a new one
        if (user.otpExpiresAt && user.otpExpiresAt.getTime() > Date.now()) {
            return res.status(429).json({ code: "otp_active", message: "OTP already sent. Please check your email" })
        }

        if (!user.email) {
            return res.status(500).json({ code: "email_fail", message: "Failed to send OTP email. Please try again later." })
        }

        // Generate and hash new OTP
        const otpCode = generate6DigitOtp()
        const hashedOtp = hashOtp(otpCode, user._id)

        // Save OTP data to user
        user.otpCode = hashedOtp
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // valid for 5 minutes
        user.otpLastSentAt = new Date()
        user.otpAttempts = 0
        await user.save({ validateBeforeSave: false })

        // Try to send email
        try {
            await sendOtpEmail(user.email, otpCode)
        } catch (emailError) {
            user.otpCode = undefined
            user.otpExpiresAt = undefined
            await user.save({ validateBeforeSave: false })
            errorLog("Email sending failed", getErrorMessage(emailError))
            return res.status(500).json({ code: "email_fail", message: "Failed to send OTP email. Please try again later." })
        }

        log(`OTP sent successfully to ${user.email}`)
        res.status(200).json({ message: "OTP sent successfully if the account exists" })
    } catch (error) {
        errorLog("Error in sendOtp controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to verify OTP
export const verifyOtp: AuthHandler = async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+otpCode +otpExpiresAt +otpAttempts +otpBlockedUntil")

        // Neutral response for invalid users or missing OTP
        if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(401).json({ code: "otp_invalid", message: "Invalid or expired OTP" })

        // Check if user google sign-in account 
        if (user.provider === "google") return res.status(403).json({ code: "google_user", message: "Password reset is not available for Google sign-in accounts." })

        // Check if the user is temporarily blocked
        if (user.otpBlockedUntil && user.otpBlockedUntil.getTime() > Date.now()) {
            return res.status(429).json({ code: "blocked", message: "Too many requests, Try again later." })
        }

        // Check OTP expiration
        if (user.otpExpiresAt.getTime() < Date.now()) {
            return res.status(401).json({ code: "otp_expired", message: "OTP has expired" })
        }

        // Verify OTP hash
        const isValid = verifyOtpHash(otp, user._id, user.otpCode)
        if (!isValid) {
            user.otpAttempts = (user.otpAttempts || 0) + 1
            if (user.otpAttempts >= 5) {
                user.otpBlockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes block
            }
            await user.save({ validateBeforeSave: false })
            return res.status(401).json({ code: "otp_invalid", message: "Invalid or expired OTP" })
        }

        // OTP verified successfully (fields cleared in resetPassword controller)
        log(`OTP verified successfully for ${user.email}`)
        res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        errorLog("Error in verifyOtp controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to reset password
export const resetPassword: AuthHandler = async (req, res) => {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password +otpCode +otpExpiresAt +otpAttempts +otpBlockedUntil")

        // Neutral response for invalid users or missing OTP
        if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(401).json({ code: "otp_invalid", message: "Invalid or expired OTP" })

        // Block password reset for Google-authenticated users
        if (user.provider === "google") return res.status(403).json({ code: "google_user", message: "Password reset is not available for Google sign-in accounts." })

        // Check if user is temporarily blocked due to multiple failed attempts
        if (user.otpBlockedUntil && user.otpBlockedUntil.getTime() > Date.now()) {
            return res.status(429).json({ code: "blocked", message: "Too many requests, Try again later." })
        }

        // Check OTP expiration
        if (user.otpExpiresAt.getTime() < Date.now()) {
            return res.status(401).json({ code: "otp_expired", message: "OTP has expired" })
        }

        // Verify OTP hash
        const isOtpValid = verifyOtpHash(otp, user._id, user.otpCode)
        if (!isOtpValid) {
            user.otpAttempts = (user.otpAttempts || 0) + 1
            if (user.otpAttempts >= 5) {
                user.otpBlockedUntil = new Date(Date.now() + 15 * 60 * 1000) // Block for 15 minutes
            }
            await user.save({ validateBeforeSave: false })
            return res.status(401).json({ code: "otp_invalid", message: "Invalid or expired OTP" })
        }

        // Validate input against Joi schema
        await updatePasswordSchemaJoi.validateAsync({ password: newPassword })

        if (!user.password) return res.status(401).json({ code: "invalid_pass", message: "Invalid credentials" })
            
        // check if new password is the same as the old password
        const isSamePassword = await checkPassword(newPassword, user.password)
        if (isSamePassword) return res.status(422).json({ code: "same_pass", message: "New password cannot be the same as the current password" })

        // Hash and save new password
        const hashedPassword = await hashPassword(newPassword)
        user.password = hashedPassword

        // Clear all OTP-related fields
        user.otpCode = undefined
        user.otpExpiresAt = undefined
        user.otpAttempts = 0
        user.otpBlockedUntil = undefined
        user.otpLastSentAt = undefined
        user.passwordChangedAt = new Date()
        await user.save({ validateBeforeSave: false })


        // // Clear cached data for the current user
        // apicache.clear(req.user?.id)

        sendAccountPasswordChangedEmail(user).catch(error => errorLog("Failed to send password changed email", getErrorMessage(error)))

        log(`Password reset successfully for ${user.email}`)
        res.status(200).json({ message: "Password reset successfully" })
    } catch (error) {
        errorLog("Error in resetPassword controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to login/register with Google
export const google: AuthHandler = async (req, res) => {
    const { token } = req.body
    if (!token) return res.status(400).json({ code: "!field", message: "Token is required" })

    try {
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined") // Ensure JWT_SECRET is defined in the environment variables

        const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
        })

        const { email, name, provider } = data

        // Validate input against Joi schema
        await googleSchema.validateAsync({ name, email, provider })

        // Find user by email
        let user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            user = await User.create({
                email: email.toLowerCase(),
                name: name.toLowerCase(),
                provider: "google",
                lastLogin: new Date()
            })
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

        // Generate a JWT token
        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) throw new Error("JWT_SECRET is not defined")
        const jwtToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" })

        log(`${email} logged in successfully`)
        res.status(200).json({ token: jwtToken, exist: true, provider: user.provider })
    } catch (error) {
        errorLog("Error in google controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}
