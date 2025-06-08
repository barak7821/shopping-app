import jwt from "jsonwebtoken"
import User, { localSchema } from "../models/userModel.js"
import { checkPassword, hashPassword } from "../utils/passwordUtils.js"
import { log, errorLog } from "../utils/log.js"

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