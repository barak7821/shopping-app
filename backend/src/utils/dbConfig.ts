import mongoose from "mongoose"
import { log } from "./logger.js"

// Function to establish a connection to MongoDB
const connectToDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL
        if (!mongoUrl) {
            throw new Error("MONGODB_URL is not set")
        }

        const MongoDBConnection = await mongoose.connect(mongoUrl)
        log(`MongoDB connected: ${MongoDBConnection.connection.host}`)
    } catch (error) {
        log("MongoDB connection error:", error)
        throw error
    }
}

export default connectToDB
