import DeletedUser from "../models/deletedUserModel.js"
import User, { updatePasswordSchemaJoi, updateUserSchemaJoi } from "../models/userModel.js"
import { log, errorLog } from "../utils/log.js"
import { checkPassword, hashPassword } from "../utils/passwordUtils.js"

// Controller to get the logged-in user's details
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -__v -createdAt -updatedAt  -_id")
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        log("User found successfully")
        res.status(200).json(user)
    } catch (error) {
        errorLog("Error in getUser controller", error.message)
        res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

export const updateUser = async (req, res) => {
    const { name, email, phone, street, city, zip, country } = req.body
    if (Object.keys(req.body).length === 0) return res.status(400).json({ code: "!field", message: "No data provided" })

    try {
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
        if (Object.keys(updateFields).length === 0) return res.status(400).json({ code: "!field", message: "No fields provided" })

        // Update user data
        const user = await User.findByIdAndUpdate({ _id: req.user.id }, updateFields, { new: true })
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        log("User data updated successfully")
        res.status(200).json({ message: "User data updated successfully" })
    } catch (error) {
        errorLog("Error in updateUser controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to delete a user
export const deleteUser = async (req, res) => {
    try {
        // Check if user exists and delete it
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        if (user.role === "admin") return res.status(403).json({ code: "admin", message: "Cannot delete admin user" })

        const deletedUser = new DeletedUser({
            ...user.toObject(),
            deletedAt: new Date()
        })

        await deletedUser.save()
        await user.deleteOne()

        log("User deleted successfully", user._id)
        res.status(200).json({ message: "User deleted successfully", id: user._id })
    } catch (error) {
        errorLog("Error in deleteUser controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}


// Controller to change password
export const changePassword = async (req, res) => {
    const { password, currentPassword } = req.body
    try {
        // Validate input fields
        if (!password || !currentPassword) return res.status(400).json({ code: "!field", message: "All fields are required" })

        // Validate input against Joi schema
        await updatePasswordSchemaJoi.validateAsync({ password })

        // check if new password is the same as the old password
        if (password === currentPassword) return res.status(422).json({ code: "same_pass", message: "New password cannot be the same as the old password" })

        // Find user by email
        const user = await User.findById(req.user.id).select("+password")
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // Check if user google sign-in account 
        if (user.provider === "google") return res.status(403).json({ code: "google_user", message: "Google users cannot change passwords because they sign in with Google." })

        // Verify the password
        const isPasswordValid = await checkPassword(currentPassword, user.password)
        if (!isPasswordValid) return res.status(401).json({ code: "invalid_pass", message: "Invalid password" })

        // hash the new password
        const hashedPassword = await hashPassword(password)

        // update the password
        await User.findByIdAndUpdate(user._id, { password: hashedPassword })

        log("Password changed successfully")
        res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        errorLog("Error in changePassword controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to verify password
export const verifyPassword = async (req, res) => {
    const { password } = req.body
    try {
        // Validate input fields
        if (!password) return res.status(400).json({ code: "!field", message: "All fields are required" })

        // Find user
        const user = await User.findById(req.user.id).select("+password")
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // Verify the password
        const isPasswordValid = await checkPassword(password, user.password)
        if (!isPasswordValid) return res.status(401).json({ code: "invalid_pass", message: "Invalid password" })

        log("Password verified successfully")
        res.status(200).json({ message: "Password verified successfully" })
    } catch (error) {
        errorLog("Error in verifyPassword controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}