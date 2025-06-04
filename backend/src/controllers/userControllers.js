import User from "../models/userModel.js"
import { log, errorLog } from "../utils/log.js"

// Controller to get the logged-in user's details
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("email")
        if (!user) return res.status(404).json({ message: "User not found" })

        res.status(200).json(user)
    } catch (error) {
        errorLog("Error in getUser controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

