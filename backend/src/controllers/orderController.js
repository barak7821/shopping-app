import Order from '../models/orderModel.js'
import { orderUserSchemaJoi, orderGuestSchemaJoi } from '../models/orderModel.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import { log, errorLog } from "../utils/log.js"

// Controller to create a new order for guest users - not registered
export const createOrder = async (req, res) => {
    const { orderDetails } = req.body
    if (!orderDetails) return res.status(400).json({ code: "!field", message: "Order details are required" })

    try {
        // Ensure userId is set to "guest"
        orderDetails.userId = "guest"

        // Get unique product IDs
        const productIds = [...new Set(orderDetails.orderItems.map(item => item.itemId))]

        // Fetch products
        const products = await Product.find({ _id: { $in: productIds }, active: true })

        // Verify if product exists
        if (products.length !== productIds.length) return res.status(404).json({ code: "not_found", message: "Product not found" })

        const quantityByProductId = {}

        // Calculate total quantity for each product
        for (const item of orderDetails.orderItems) {
            if (!quantityByProductId[item.itemId]) {
                quantityByProductId[item.itemId] = 0
            }
            quantityByProductId[item.itemId] += item.selectedQuantity
        }

        // Verify if product is in stock
        for (const [productId, totalQty] of Object.entries(quantityByProductId)) {
            const product = products.find(product => product._id.toString() === productId)
            if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" })
            if (product.stock < totalQty) return res.status(400).json({ code: "low_stock", message: "Product is out of stock" })
        }

        // // Validate against Joi schema
        await orderGuestSchemaJoi.validateAsync(orderDetails)
        const newOrder = new Order(orderDetails) // Create a new order instance

        await newOrder.save() // Save the order to the database

        // Update product stock
        for (const [productId, totalQty] of Object.entries(quantityByProductId)) {
            const product = products.find(product => product._id.toString() === productId)
            product.stock -= totalQty
            product.active = false
            await product.save()
        }

        log("Order created successfully")
        res.status(201).json({ message: "Order created successfully" })
    } catch (error) {
        errorLog("Error in createOrder controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
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
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // Add user details to order details
        orderDetails.userId = userId

        // Get unique product IDs
        const productIds = [...new Set(orderDetails.orderItems.map(item => item.itemId))]

        // Fetch products
        const products = await Product.find({ _id: { $in: productIds }, active: true })

        // Verify if product exists
        if (products.length !== productIds.length) return res.status(404).json({ code: "not_found", message: "Product not found" })

        const quantityByProductId = {}

        // Calculate total quantity for each product
        for (const item of orderDetails.orderItems) {
            if (!quantityByProductId[item.itemId]) {
                quantityByProductId[item.itemId] = 0
            }
            quantityByProductId[item.itemId] += item.selectedQuantity
        }

        // Verify if product is in stock
        for (const [productId, totalQty] of Object.entries(quantityByProductId)) {
            const product = products.find(product => product._id.toString() === productId)
            if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" })
            if (product.stock < totalQty) return res.status(400).json({ code: "low_stock", message: "Product is out of stock" })
        }

        // Validate against Joi schema
        await orderUserSchemaJoi.validateAsync(orderDetails)
        const newOrder = new Order(orderDetails) // Create a new order instance

        await newOrder.save() // Save the order to the database

        // Update product stock
        for (const [productId, totalQty] of Object.entries(quantityByProductId)) {
            const product = products.find(product => product._id.toString() === productId)
            product.stock -= totalQty
            product.active = false
            await product.save()
        }

        log("Order created successfully")
        res.status(201).json({ message: "Order created successfully" })
    } catch (error) {
        errorLog("Error in createOrder controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ code: "!field", message: "Order id is required" })

    try {
        const orders = await Order.findById(id).select("-__v -updatedAt").lean()
        if (!orders) return res.status(404).json({ code: "not_found", message: "Order not found" })

        log("Order found successfully")
        res.status(200).json(orders)
    } catch (error) {
        errorLog("Error in getOrderById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get orders by query parameters for pagination
export const getOrdersByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1)
        const limit = 5
        const sortBy = { createdAt: -1, _id: 1 }

        const total = await Order.countDocuments()
        const items = await Order.find({ userId: req.user.id }).sort(sortBy).skip((page - 1) * limit).limit(limit).select("-__v -updatedAt").lean()
        const totalPages = Math.max(1, Math.ceil(total / limit))
        const hasNext = page < totalPages
        const hasPrev = page > 1

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} orders for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getOrdersByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}