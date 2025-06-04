import Express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import connectToDB from "./utils/dbConfig.js"
import { errorLog } from "./utils/log.js"

dotenv.config()

const app = Express()
app.use(Express.json())
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*"
}))

// Define route handlers
app.use("/api/auth", authRoutes) // authentication routes (eg. register, login)
app.use("/api/user", userRoutes) // user routes (eg. get, update or remove user details)
app.use("/api/order", orderRoutes) // order routes (eg. create, get, update or remove order details)

// Define a simple ping endpoint to check if the server is running
app.get("/api/ping", (req, res) => res.send("Running"))

const PORT = process.env.PORT || 3000

try {
    await connectToDB()
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })

} catch (error) {
    errorLog("Failed to connect to the database", error)
}