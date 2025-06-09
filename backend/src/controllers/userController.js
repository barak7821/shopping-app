import User, { updateUserSchemaJoi } from "../models/userModel.js"
import { log, errorLog } from "../utils/log.js"

// Controller to get the logged-in user's details
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User not found" })

        res.status(200).json(user)
    } catch (error) {
        errorLog("Error in getUser controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

export const updateUser = async (req, res) => {
    const { name, email, phone, street, city, zip, country } = req.body
    try {
        // Check if data is provided
        if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "No data provided" })

        // Validate against Joi schema
        await updateUserSchemaJoi.validateAsync({ name, email, phone, street, city, zip, country })

        // Update user data if provided
        const updateFields = {}
        if (name) updateFields.name = name.toLowerCase()
        if (email) updateFields.email = email.toLowerCase()
        if (phone !== undefined) updateFields.phone = phone
        if (street !== undefined) updateFields.street = street.toLowerCase()
        if (city !== undefined) updateFields.city = city.toLowerCase()
        if (zip !== undefined) updateFields.zip = zip
        if (country !== undefined) updateFields.country = country.toLowerCase()

        // If no fields are provided, return an error
        if (Object.keys(updateFields).length === 0) return res.status(400).json({ message: "No fields provided" })

        // Update user data
        const updateUser = await User.findByIdAndUpdate(
            { _id: req.user.id },
            updateFields,
            { new: true }
        )
        if (!updateUser) return res.status(404).json({ message: "User not found" })

        log("User data updated successfully")
        res.status(200).json({ message: "User data updated successfully" })
    } catch (error) {
        errorLog("Error in updateUser controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to delete a user
export const deleteUser = async (req, res) => {
    try {
        // Check if user exists and delete it
        const user = await User.findByIdAndDelete(req.user.id)
        if (!user) return res.status(404).json({ message: "User not found" })

        log("User deleted successfully")
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        errorLog("Error in deleteUser controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}