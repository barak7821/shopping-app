import bcrypt from "bcrypt"
import { errorLog } from "./logger.js"
import { getErrorMessage } from "./errorUtils.js"

const SALT_ROUNDS = 12

// Function to hash the password
export async function hashPassword(password: string) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS)
    } catch (error) {
        errorLog("Error in hashPassword:", getErrorMessage(error))
        throw new Error(`Failed to hash password: ${getErrorMessage(error)}`)
    }
}

// Function to compare a plain password with a hashed password
export async function checkPassword(password: string, hashedPassword: string) {
    try {
        return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
        errorLog("Error in checkPassword:", getErrorMessage(error))
        throw new Error(`Failed to compare password: ${getErrorMessage(error)}`)
    }
}