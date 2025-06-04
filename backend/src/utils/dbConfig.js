import mongoose from "mongoose"
import { log } from "./log.js"

// Function to establish a connection to MongoDB
const connectToDB = async () => {
    try {
        const MongoDBConnection = await mongoose.connect(process.env.MONGODB_URL)
        log(`MongoDB connected: ${MongoDBConnection.connection.host}`)
    } catch (error) {
        log("MongoDB connection error:", error)
        throw error
    }
}

export default connectToDB