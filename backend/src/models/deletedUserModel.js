import mongoose from "mongoose";

const deletedUserSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
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
        otpCode: { // Hashed OTP (HMAC with pepper)
            type: String,
            select: false
        },
        otpExpiresAt: { // Expiration time for OTP
            type: Date,
            select: false
        },
        otpLastSentAt: { // Prevents frequent OTP sending
            type: Date,
            select: false
        },
        otpAttempts: { // Counts failed OTP attempts
            type: Number,
            default: 0,
            select: false
        },
        otpBlockedUntil: { // Temporary block after too many attempts
            type: Date,
            select: false
        },
        lastLogin: Date,
        deletedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema)
export default DeletedUser