import mongoose from "mongoose"
import Joi from "joi"

export const localSchema = Joi.object(
    {
        name: Joi.string().min(2).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(20).required(),
        role: Joi.string().default("user"),
        provider: Joi.string().valid("local").default("local"),
        lastLogin: Joi.date()
    }
)
export const googleSchema = Joi.object(
    {
        name: Joi.string().min(2).max(20).required(),
        email: Joi.string().email().min(5).max(30).required(),
        role: Joi.string().default("user"),
        provider: Joi.string().valid("google").default("google"),
        lastLogin: Joi.date()
    }
)

export const updateUserSchemaJoi = Joi.object(
    {
        name: Joi.string().min(2).max(20),
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\d{9,15}$/).allow(""),
        street: Joi.string().allow(""),
        city: Joi.string().allow(""),
        zip: Joi.string().allow(""),
        country: Joi.string().allow("")
    }
)

export const updatePasswordSchemaJoi = Joi.object(
    {
        password: Joi.string().min(6).max(20).required()
    }
)

const userSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            unique: true, // Ensures email is unique across users
            lowercase: true, // Converts email to lowercase before saving
            trim: true // Removes space from both ends of the email
        },
        password: {
            type: String,
            select: false // Exclude password from queries by default
        },
        role: {
            type: String,
            default: "user" // Default role is "user", can be changed to "admin" or others
        },
        provider: {
            type: String,
            default: "local" // Default provider is "local", can be "google" or others
        },
        phone: String,
        street: String,
        city: String,
        zip: String,
        country: String,
        otpCode: String, // One-time password for verification
        otpExpiresAt: Date // Expiration time for the OTP
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const User = mongoose.model("User", userSchema)
export default User