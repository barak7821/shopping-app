import jwt from "jsonwebtoken"
import User, { localSchema, updatePasswordSchemaJoi } from "../models/userModel.js"
import { checkPassword, hashPassword } from "../utils/passwordUtils.js"
import { log, errorLog } from "../utils/log.js"
import { sendOtpEmail } from "../utils/sendOtpEmail.js"
import { generate6DigitOtp, hashOtp, verifyOtpHash } from "../utils/otpUtils.js"


// Controller to register
export const register = async (req, res) => {
    const { name, email, password } = req.body
    const provider = "local"
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" })

    try {
        // Check if email already exists
        const userExists = await User.findOne({ email: email.toLowerCase() })
        if (userExists) return res.status(400).json({ code: "exist", message: "User already exists" })

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

        // Generate a JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        log(`${email} added successfully`)
        res.status(201).json({ message: `${email} added successfully`, token, exist: false })
    } catch (error) {
        errorLog("Error in register controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to login
export const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: "All fields are required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
        if (!user) return res.status(400).json({ code: "!exist", message: "User don't exists" })

        // Verify the password
        const isPasswordValid = await checkPassword(password, user.password)
        if (!isPasswordValid) return res.status(400).json({ code: "invalid_pass", message: "Invalid password" })

        // Ensure JWT_SECRET is defined in the environment variables
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined")
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

        log(`${email} logged in successfully`)
        res.status(200).json({ message: `${email} logged in successfully`, token, exist: false })
    } catch (error) {
        errorLog("Error in login controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller for checking if the user is authenticated based on the JWT token
export const checkAuth = async (req, res) => {
    res.status(200).json({ exist: true })
}

// Controller to send OTP
export const sendOtp = async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ code: "!field", message: "Email is required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+otpCode +otpExpiresAt +otpLastSentAt +otpAttempts +otpBlockedUntil")

        // Always return a neutral response for non-existing accounts
        if (!user) return res.status(400).json({ code: "otp_sent", message: "If an account exists, OTP was sent" })

        // Check if the user is temporarily blocked
        // if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) return res.status(429).json({ code: "blocked", message: "Too many requests, Try again later." })

        // Prevent spamming (limit: 1 request every 2 minutes)
        // if (user.otpLastSentAt && Date.now() - user.otpLastSentAt < 2 * 60 * 1000) return res.status(429).json({ code: "too_fast", message: "Please wait before requesting another code" })

        // If a valid OTP already exists, do not create a new one
        // if (user.otpExpiresAt && user.otpExpiresAt > Date.now()) return res.status(429).json({ code: "otp_active", message: "OTP already sent. Please check your email" })

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
            errorLog("Email sending failed", emailError.message)
            return res.status(500).json({ code: "email_fail", message: "Failed to send OTP email. Please try again later." })
        }

        log(`OTP sent successfully to ${user.email}`)
        res.status(200).json({ message: "OTP sent successfully if the account exists" })
    } catch (error) {
        errorLog("Error in sendOtp controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to verify OTP
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+otpCode +otpExpiresAt +otpAttempts +otpBlockedUntil")

        // Neutral response for invalid users or missing OTP
        if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(400).json({ code: "otp_invalid", message: "Invalid or expired OTP" })

        // Check if the user is temporarily blocked
        if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) return res.status(429).json({ code: "blocked", message: "Too many requests, Try again later." })

        // Check OTP expiration
        if (user.otpExpiresAt < Date.now()) return res.status(400).json({ code: "otp_expired", message: "OTP has expired" })

        // Verify OTP hash
        const isValid = verifyOtpHash(otp, user._id, user.otpCode)
        if (!isValid) {
            user.otpAttempts = (user.otpAttempts || 0) + 1
            if (user.otpAttempts >= 5)
                user.otpBlockedUntil = Date.now() + 15 * 60 * 1000 // 15 minutes block
            await user.save({ validateBeforeSave: false })
            return res.status(400).json({ code: "otp_invalid", message: "Invalid or expired OTP" })
        }

        // OTP verified successfully (fields cleared in resetPassword controller)
        log(`OTP verified successfully for ${user.email}`)
        res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        errorLog("Error in verifyOtp controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to reset password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password +otpCode +otpExpiresAt +otpAttempts +otpBlockedUntil")

        // Neutral response for invalid users or missing OTP
        if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(400).json({ code: "otp_invalid", message: "Invalid or expired OTP or user not found" })

        // Check if user is temporarily blocked
        if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) return res.status(429).json({ code: "blocked", message: "Too many requests, Try again later." })

        // Check OTP expiration
        if (user.otpExpiresAt < Date.now()) return res.status(400).json({ code: "otp_expired", message: "OTP has expired" })

        // Verify OTP hash
        const isOtpValid = verifyOtpHash(otp, user._id, user.otpCode)
        if (!isOtpValid) {
            user.otpAttempts = (user.otpAttempts || 0) + 1
            if (user.otpAttempts >= 5)
                user.otpBlockedUntil = Date.now() + 15 * 60 * 1000 // 15 minutes block
            await user.save({ validateBeforeSave: false })
            return res.status(400).json({ code: "otp_invalid", message: "Invalid or expired OTP" })
        }

        // Validate input against Joi schema
        await updatePasswordSchemaJoi.validateAsync({ password: newPassword })

        // check if new password is the same as the old password
        const isSamePassword = await checkPassword(newPassword, user.password)
        if (isSamePassword) return res.status(400).json({ code: "same_pass", message: "New password cannot be the same as the current password" })

        // Hash and save new password
        const hashedPassword = await hashPassword(newPassword)
        user.password = hashedPassword

        // Clear all OTP-related fields
        user.otpCode = undefined
        user.otpExpiresAt = undefined
        user.otpAttempts = undefined
        user.otpBlockedUntil = undefined
        user.otpLastSentAt = undefined
        user.passwordChangedAt = Date.now()
        await user.save({ validateBeforeSave: false })

        log(`Password reset successfully for ${user.email}`)
        res.status(200).json({ message: "Password reset successfully" })
    } catch (error) {
        errorLog("Error in resetPassword controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}