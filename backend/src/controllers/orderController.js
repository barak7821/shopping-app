import Order from '../models/orderModel.js'
import { orderUserSchemaJoi, orderGuestSchemaJoi } from '../models/orderModel.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import { log, errorLog } from "../utils/log.js"
import { notifyAdminOnCurrentStockStatus } from "../utils/adminNotifications.js"
import { sendOrderConfirmationEmail } from '../utils/userNotifications.js'
import { generateOrderNumber } from '../utils/OrderNumberGenerator.js'

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

        const quantityByProductAndSize = {}

        // Calculate total quantity by product and size
        for (const item of orderDetails.orderItems) {
            const key = `${item.itemId}:${item.selectedSize}` // create a unique key based on product ID and size

            if (!quantityByProductAndSize[key]) { // if the key doesn't exist
                quantityByProductAndSize[key] = 0
            }

            quantityByProductAndSize[key] += item.selectedQuantity // increment the quantity
        }

        // Verify if product size is in stock
        for (const [key, totalQty] of Object.entries(quantityByProductAndSize)) {
            const [productId, sizeCode] = key.split(":") // split the key

            const product = products.find(product => product._id.toString() === productId) // find the product
            if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" }) // if product not found

            const size = product.sizes.find(size => size.code === sizeCode) // find the size
            if (!size) return res.status(400).json({ code: "invalid_size", message: "Selected size not available" }) // if size not found

            if (size.stock < totalQty) return res.status(400).json({ code: "low_stock", message: "Selected size is out of stock" }) // if size is out of stock

        }

        let lastError = null // to store the last error encountered
        let newOrder = null // to store the newly created order

        // Attempt to create and save the order with a unique order number
        for (let attempt = 0; attempt < 5; attempt += 1) {
            orderDetails.orderNumber = generateOrderNumber() // Generate a new order number
            await orderGuestSchemaJoi.validateAsync(orderDetails) // Validate against Joi schema
            newOrder = new Order(orderDetails) // Create a new order instance

            try {
                await newOrder.save() // Save the order to the database
                break // Exit loop if successful
            } catch (error) {
                if (error?.code === 11000 && error?.keyPattern?.orderNumber) { // Check for duplicate order number error
                    lastError = error
                    continue // Retry
                }
                throw error // Rethrow other errors
            }
        }

        if (!newOrder || !newOrder._id) throw lastError || new Error("order_id_conflict") // If order creation failed after retries

        // Update product size stock
        for (const [key, totalQty] of Object.entries(quantityByProductAndSize)) {
            const [productId, sizeCode] = key.split(":") // split the key

            const product = products.find(product => product._id.toString() === productId) // find the product
            if (!product) continue // if product not found

            const size = product.sizes.find(size => size.code === sizeCode) // find the size
            if (!size) continue // if size not found

            size.stock -= totalQty // decrement the stock

            const totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0) // calculate total stock
            product.active = totalStock > 0 // update active status

            await product.save() // save the product

            // Notify admin on current stock status
            notifyAdminOnCurrentStockStatus(product, size).catch(error => errorLog("Error in notifyAdminOnCurrentStockStatus", error.message))
        }

        sendOrderConfirmationEmail({ order: newOrder }).catch(error => errorLog("Error in sendOrderConfirmationEmail", error.message))

        log("Order created successfully")
        res.status(201).json({ message: "Order created successfully" })
    } catch (error) {
        errorLog("Error in createOrderForUser controller", error.message)
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

        const quantityByProductAndSize = {}

        for (const item of orderDetails.orderItems) {
            const key = `${item.itemId}:${item.selectedSize}` // create a unique key based on product ID and size

            if (!quantityByProductAndSize[key]) { // if the key doesn't exist
                quantityByProductAndSize[key] = 0
            }

            quantityByProductAndSize[key] += item.selectedQuantity // increment the quantity
        }

        // Verify if product size is in stock
        for (const [key, totalQty] of Object.entries(quantityByProductAndSize)) {
            const [productId, sizeCode] = key.split(":") // split the key

            const product = products.find(product => product._id.toString() === productId) // find the product
            if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" }) // if product not found

            const size = product.sizes.find(size => size.code === sizeCode) // find the size
            if (!size) return res.status(400).json({ code: "invalid_size", message: "Selected size not available" }) // if size not found

            if (size.stock < totalQty) return res.status(400).json({ code: "low_stock", message: "Selected size is out of stock" }) // if size is out of stock
        }

        let lastError = null // to store the last error encountered
        let newOrder = null // to store the newly created order

        // Attempt to create and save the order with a unique order number
        for (let attempt = 0; attempt < 5; attempt += 1) {
            orderDetails.orderNumber = generateOrderNumber() // Generate a new order number
            await orderUserSchemaJoi.validateAsync(orderDetails) // Validate against Joi schema
            newOrder = new Order(orderDetails) // Create a new order instance

            try {
                await newOrder.save() // Save the order to the database
                break // Exit loop if successful
            } catch (error) {
                if (error?.code === 11000 && error?.keyPattern?.orderNumber) { // Check for duplicate order number error
                    lastError = error
                    continue // Retry
                }
                throw error // Rethrow other errors
            }
        }

        if (!newOrder || !newOrder._id) throw lastError || new Error("order_id_conflict") // If order creation failed after retries


        // Update product size stock
        for (const [key, totalQty] of Object.entries(quantityByProductAndSize)) {
            const [productId, sizeCode] = key.split(":") // split the key

            const product = products.find(product => product._id.toString() === productId) // find the product
            if (!product) continue // if product not found

            const size = product.sizes.find(size => size.code === sizeCode) // find the size
            if (!size) continue // if size not found

            size.stock -= totalQty // decrement the stock

            const totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0) // calculate total stock
            product.active = totalStock > 0 // update active status

            await product.save() // save the product

            // Notify admin on current stock status
            notifyAdminOnCurrentStockStatus(product, size).catch(error => errorLog("Error in notifyAdminOnCurrentStockStatus", error.message))
        }

        sendOrderConfirmationEmail({ user, order: newOrder }).catch(error => errorLog("Error in sendOrderConfirmationEmail", error.message))

        log("Order created successfully")
        res.status(201).json({ message: "Order created successfully" })
    } catch (error) {
        errorLog("Error in createOrder controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get order by order number
export const getOrderByOrderNumber = async (req, res) => {
    const { number } = req.params
    if (!number) return res.status(400).json({ code: "!field", message: "Order number is required" })

    try {
        const orders = await Order.findOne({ orderNumber: number }).select("-__v -updatedAt").lean()
        if (!orders) return res.status(404).json({ code: "not_found", message: "Order not found" })

        log("Order found successfully")
        res.status(200).json(orders)
    } catch (error) {
        errorLog("Error in getOrderByOrderNumber controller", error.message)
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
