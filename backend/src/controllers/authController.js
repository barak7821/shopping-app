import jwt from "jsonwebtoken"
import User, { localSchema } from "../models/userModel.js"
import { checkPassword, hashPassword } from "../utils/passwordUtils.js"
import { log, errorLog } from "../utils/log.js"
import { sendOtpEmail } from "../utils/sendOtpEmail.js"

export const register = async (req, res) => {
    const { name, email, password } = req.body
    const provider = "local"
    try {
        // Validate input fields
        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" })

        // Validate input against Joi schema
        await localSchema.validateAsync({ name, email, password, provider })

        // Check if email already exists
        const userExists = await User.findOne({ email: email.toLowerCase() })
        if (userExists) return res.status(400).json({ code: "exist", message: "User already exists" })

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

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        // Validate input fields
        if (!email || !password) return res.status(400).json({ message: "All fields are required" })

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() }).select("+password")
        if (!userExists) return res.status(400).json({ code: "!exist", message: "User don't exists" })

        // Verify the password
        const isPasswordValid = await checkPassword(password, userExists.password)
        if (!isPasswordValid) return res.status(400).json({ code: "invalid_pass", message: "Invalid password" })

        // Ensure JWT_SECRET is defined in the environment variables
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined")
        }

        // Generate a JWT token
        const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        await User.findByIdAndUpdate(userExists._id, { lastLogin: new Date() })

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
    if (!email) return res.status(400).json({ code: "!email", message: "Email is required" })

    try {
        // Check if user exists by email
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) return res.status(400).json({ code: "!exist", message: "User not found" }) // If user doesn't exist, return error


        // Check if OTP already sent and still valid
        if (user.otpExpiresAt && user.otpExpiresAt > Date.now()) return res.status(429).json({ message: "OTP already sent. Please wait a few minutes." })

        // Generate a 6-digit random OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

        // Hash the OTP code
        const hashedOtp = await hashPassword(otpCode)

        // set OTP expiration to 5 minutes from now
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

        // Save OTP to user
        user.otpCode = hashedOtp
        user.otpExpiresAt = otpExpiresAt
        await user.save()

        // Try to send email
        try {
            await sendOtpEmail(email, otpCode)
        } catch (emailError) {
            user.otpCode = undefined
            user.otpExpiresAt = undefined
            await user.save()
            throw new Error("Failed to send OTP email")
        }

        log("OTP sent successfully")
        res.status(200).json({ message: "OTP sent successfully" })
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
        log(email, otp)

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+otpCode +otpExpiresAt")

        // // Check if user exists and has valid OTP and expiration
        if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(400).json({ code: "!exist", message: "Invalid or expired OTP or user not found" })

        // Validate OTP code
        const isOtpValid = await checkPassword(otp, user.otpCode)
        if (!isOtpValid) return res.status(400).json({ code: "otp", message: "Invalid OTP" })

        // Validate OTP expiration
        if (user.otpExpiresAt < Date.now()) return res.status(400).json({ code: "otpExpired", message: "OTP has expired" })

        // Clear OTP
        user.otpCode = undefined
        user.otpExpiresAt = undefined
        await user.save()

        log("OTP verified successfully")
        res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        errorLog("Error in verifyOtp controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to reset password
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body
    if (!email || !newPassword) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Check if user exists by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
        if (!user) return res.status(400).json({ code: "!exist", message: "User not found" }) // If user doesn't exist, return error

        // Check if password contains at least one uppercase letter, one lowercase letter, and one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
        if (!passwordRegex.test(newPassword)) return res.status(400).json({ code: "invalid_pass", message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long" })

        // check if new password is the same as the old password
        const isPasswordValid = await checkPassword(newPassword, user.password)
        if (isPasswordValid) return res.status(400).json({ code: "samePass", message: "New password cannot be the same as the current password" })

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword)

        // Save new password to user
        user.password = hashedPassword
        await user.save()

        log("Password reset successfully")
        res.status(200).json({ message: "Password reset successfully" })
    } catch (error) {
        errorLog("Error in resetPassword controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}