import jwt from "jsonwebtoken"
import type { NextFunction, Response } from "express"
import User from "../models/userModel.js"
import { errorLog } from "../utils/logger.js"
import { AuthRequest, AuthUser } from "../utils/types.js"
import { getErrorMessage } from "../utils/errorUtils.js"

// Middleware to authenticate the user via JWT token
const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {

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
        if (typeof decoded === "string" || !("id" in decoded)) {
            throw new Error("Invalid token")
        }

        req.user = decoded as AuthUser

        // Find the user in the database based on the decoded ID
        const user = await User.findById(decoded.id)
        if (!user) return res.status(200).json({ exist: false }) // Not an error — just means the user doesn't exist

        req.user.role = user.role
        req.user.provider = user.provider

        next()
    } catch (error) {
        errorLog("Token verification error:", getErrorMessage(error))
        res.status(200).json({ message: "Unauthorized", exist: false })  // Not an error — just means the user doesn't exist
    }
}

export default authMiddleware
