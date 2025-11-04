import Order from '../models/orderModel.js'
import { orderUserSchemaJoi, orderGuestSchemaJoi } from '../models/orderModel.js'
import User from '../models/userModel.js'
import { log, errorLog } from "../utils/log.js"

// Controller to create a new order for guest users - not registered
export const createOrder = async (req, res) => {
    const { orderDetails } = req.body
    if (!orderDetails) return res.status(400).json({ code: "!field", message: "Order details are required" })

    try {
        // Ensure userId is set to "guest"
        orderDetails.userId = "guest"

        // // Validate against Joi schema
        await orderGuestSchemaJoi.validateAsync(orderDetails)
        const newOrder = new Order(orderDetails) // Create a new order instance

        await newOrder.save() // Save the order to the database

        log("Order created successfully")
        res.status(201).json({ message: "Order created successfully" })
    } catch (error) {
        errorLog("Error in createOrder controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to create a new order for registered users
export const createOrderForUser = async (req, res) => {
    const { orderDetails } = req.body
    if (!orderDetails) return res.status(400).json({ code: "!field", message: "Order details are required" })

    try {
        // Fetch user ID from request
        const userId = req.user.id
        if (!userId) return res.status(400).json({ code: "!field", message: "User ID is required" })

        // Verify if user exists
        const user = await User.findById(userId)
        if (!user) return res.status(400).json({ code: "exist", message: "User not found" })

        // Add user details to order details
        orderDetails.userId = userId

        // Validate against Joi schema
        await orderUserSchemaJoi.validateAsync(orderDetails)
        const newOrder = new Order(orderDetails) // Create a new order instance

        await newOrder.save() // Save the order to the database

        log("Order created successfully")
        res.status(201).json({ message: "Order created successfully" })
    } catch (error) {
        errorLog("Error in createOrder controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

export const getOrdersById = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }) // Find orders by user ID

        log("Orders found successfully")
        res.status(200).json(orders) // Send the orders as a response
    } catch (error) {
        errorLog("Error in getOrdersById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}