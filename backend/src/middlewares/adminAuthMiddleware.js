import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import { errorLog } from "../utils/log.js"

// Middleware to authenticate the user via JWT token
const adminAuthMiddleware = async (req, res, next) => {

    // Retrieve the Authorization header
    const authHeader = req.header("Authorization")

    // If no Authorization header, return unauthorized error
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" })

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1]

    // If no token found, return unauthorized error
    if (!token) return res.status(401).json({ message: "Unauthorized" })

    try {
        // Check if the JWT secret is defined
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined")
        }

        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.id) {
            throw new Error("Invalid token")
        }

        req.user = decoded

        // Find the user in the database based on the decoded ID
        const user = await User.findById(decoded.id)
        if (!user) return res.status(200).json({ exist: false }) // Not an error — just means the user doesn't exist

        // Check if the user has admin role and is a local user
        if (user.role !== "admin" || user.provider !== "local") return res.status(403).json({ message: "Forbidden" })

        req.user.role = user.role
        req.user.provider = user.provider

        next()
    } catch (error) {
        errorLog("Token verification error:", error.message)
        res.status(200).json({ message: "Unauthorized", exist: false })  // Not an error — just means the user doesn't exist
    }
}

export default adminAuthMiddleware
