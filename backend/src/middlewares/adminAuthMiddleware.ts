import jwt from "jsonwebtoken"
import type { NextFunction, Response } from "express"
import User from "../models/userModel.js"
import { errorLog } from "../utils/logger.js"
import type { AuthRequest, AuthUser } from "../utils/types.js"
import { getErrorMessage } from "../utils/errorUtils.js"

// Middleware to authenticate the user via JWT token
const adminAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {

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
        if (typeof decoded === "string" || !("sub" in decoded)) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        if (decoded.aud !== "admin" || decoded.mfa !== true) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        req.user = { id: String(decoded.sub), aud: String(decoded.aud), mfa: Boolean(decoded.mfa) } as AuthUser

        // Find the user in the database based on the decoded ID
        const user = await User.findById(decoded.sub)
        if (!user) return res.status(401).json({ message: "Unauthorized" })

        // Check if the user has admin role and is a local user
        if (user.role !== "admin" || user.provider !== "local") return res.status(403).json({ message: "Forbidden" })

        req.user.role = user.role
        req.user.provider = user.provider

        next()
    } catch (error) {
        errorLog("Token verification error:", getErrorMessage(error))
        return res.status(401).json({ message: "Unauthorized" })
    }
}

export default adminAuthMiddleware
