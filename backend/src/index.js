import Express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import connectToDB from "./utils/dbConfig.js"
import { errorLog, log } from "./utils/log.js"
import helmet from "helmet"
import apicache from "apicache"
import compression from "compression"
import morgan from "morgan"

dotenv.config()
const app = Express()
const cache = apicache.middleware

// Middleware
app.use(cors({ 
    origin: process.env.CORS_ORIGIN || "*"
}))
app.use(helmet())
app.use(Express.json({ limit: "10mb" }))
app.use(compression())
app.use(morgan("dev"))

// Caching for frequently used routes
app.use("/api/products", cache("5 minutes"))
app.use("/api/order", cache("5 minutes"))

// Define route handlers
app.use("/api/auth", authRoutes) // authentication routes (eg. register, login)
app.use("/api/user", userRoutes) // user routes (eg. get, update or remove user details)
app.use("/api/order", orderRoutes) // order routes (eg. create, get, update or remove order details)
app.use("/api/products", productRoutes) // product routes (eg. add, get, update or remove product details)

// Define a simple ping endpoint to check if the server is running
app.get("/api/ping", (req, res) => res.send("Running"))

const PORT = process.env.PORT || 3000

try {
    await connectToDB()
    app.listen(PORT, () => {
        log(`Server is running on port ${PORT}`)
    })

} catch (error) {
    errorLog("Failed to connect to the database", error)
}