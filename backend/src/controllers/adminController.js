import DeletedUser from "../models/deletedUserModel.js";
import Order from "../models/orderModel.js";
import Product, { productSchemaJoi, updateProductSchemaJoi } from "../models/productModel.js";
import User, { localSchema } from "../models/userModel.js";
import { errorLog, log } from "../utils/log.js";
import { hashPassword } from "../utils/passwordUtils.js";

// Products controllers

// temp - Controller for delete all products - SHOULD ONLY BE USED FOR TESTING!!!
export const deleteAllProducts = async (req, res) => {
    try {
        await Product.deleteMany({})

        log("All products deleted")
        res.status(200).json({ message: "All products deleted" })
    } catch (error) {
        errorLog("Error in deleteAllProducts controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// temp - Controller to add multiple products at once - SHOULD ONLY BE USED FOR TESTING/SEEDING!!!
export const addMultipleProducts = async (req, res) => {
    const products = req.body
    if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ code: "!field", message: "No products provided" })

    try {
        // Validate and format each product
        const formattedProducts = []

        for (const product of products) {
            const { title, category, price, image, description, sizes, type } = product

            // Check for required fields
            if (!title || !category || !price || !image || !description || !sizes || !type) return res.status(400).json({ code: "!field", message: `Missing fields in one of the products` })


            // Validate with Joi
            await productSchemaJoi.validateAsync({ title, category, price, image, description, sizes, type })

            // Check if product already exists
            const exists = await Product.findOne({ title: title.toLowerCase() })
            if (exists) {
                log(`Skipped duplicate: ${title}`)
                continue
            }

            formattedProducts.push({
                title: title.toLowerCase(),
                category: category.toLowerCase(),
                price,
                image,
                description,
                sizes,
                type: type.toLowerCase()
            })
        }

        if (formattedProducts.length === 0) return res.status(400).json({ message: "No new products to add" })

        await Product.insertMany(formattedProducts)

        log(`${formattedProducts.length} products added`)
        res.status(201).json({ message: `${formattedProducts.length} products added`, added: formattedProducts.length })
    } catch (error) {
        errorLog("Error in addMultipleProducts controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// temp - Controller to seed users at once - SHOULD ONLY BE USED FOR TESTING/SEEDING!!
export const seedUsers = async (req, res) => {
    const users = req.body
    if (!Array.isArray(users) || users.length === 0) return res.status(400).json({ code: "!field", message: "No users provided" })

    try {
        // Validate and format each product
        const results = []

        for (const user of users) {
            const { name, email, password, city } = user

            // Check for required fields
            if (!name || !email || !password) return res.status(400).json({ code: "!field", message: `Missing fields in one of the users` })

            // Validate with Joi
            await localSchema.validateAsync({ name, email, password })

            // Check for required fields
            const exists = await User.findOne({ email: email.toLowerCase() })
            if (exists) {
                log(`Skipped duplicate: ${email}`)
                continue
            }

            results.push({
                name: name.toLowerCase(),
                email: email.toLowerCase(),
                password,
                provider: "local",
                role: "user",
                city
            })
        }

        if (results.length === 0) return res.status(400).json({ message: "No new users to add" })

        await User.insertMany(results)

        log(`${results.length} users added`)
        res.status(201).json({ message: `${results.length} users added`, added: results.length })
    } catch (error) {
        errorLog("Error in seedUsers controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to add a new product
export const addProduct = async (req, res) => {
    const { title, category, price, image, description, sizes, type } = req.body
    if (!title || !category || !price || !image || !description || !sizes || !type) return res.status(400).json({ code: "!field", message: "Missing required fields" })

    try {
        // Validate input against Joi schema
        await productSchemaJoi.validateAsync({ title, category, price, image, description, sizes, type })

        // Verify if the product already exists
        const product = await Product.findOne({ title: title.toLowerCase() })
        if (product) return res.status(400).json({ code: "exist", message: "Product already exists" })

        // Create a new product
        const newProduct = new Product({
            title: title.toLowerCase(),
            category: category.toLowerCase(),
            price,
            image,
            description,
            sizes,
            type: type.toLowerCase()
        })

        // Save the new product to the database
        await newProduct.save()

        log(`${title} added successfully`)
        res.status(201).json({ message: `${title} added successfully`, exist: false })
    } catch (error) {
        errorLog("Error in addProduct controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller for delete product by id
export const deleteProductById = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const product = await Product.findByIdAndDelete(id)
        if (!product) return res.status(400).json({ code: "exist", message: "Product not found" })

        log(`Product with id ${id} deleted successfully`)
        res.status(200).json({ message: `Product with id ${id} deleted successfully` })
    } catch (error) {
        errorLog("Error in deleteProductById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to get product by id
export const getProductById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const product = await Product.findById(id)
        if (!product) return res.status(400).json({ code: "exist", message: "Product not found" })

        log(`Product with id ${id} found successfully`)
        res.status(200).json(product)
    } catch (error) {
        errorLog("Error in getProductById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to edit product by id
export const updateProductById = async (req, res) => {
    const { title, category, price, image, description, sizes, type } = req.body
    if (Object.keys(req.body).length === 0) return res.status(400).json({ code: "!field", message: "No data provided" })

    try {
        // Validate input against Joi schema
        await updateProductSchemaJoi.validate({ title, category, price, image, description, sizes, type })

        // Update product data if provided
        const updateFields = {}
        if (title) updateFields.title = title.toLowerCase()
        if (category) updateFields.category = category.toLowerCase()
        if (price) updateFields.price = price
        if (image) updateFields.image = image
        if (description) updateFields.description = description
        if (sizes) updateFields.sizes = sizes
        if (type) updateFields.type = type.toLowerCase()

        // If no fields are provided, return an error
        if (Object.keys(updateFields).length === 0) return res.status(400).json({ message: "No fields provided" })

        console.log(req.body.id)

        // Update product data
        const product = await Product.findByIdAndUpdate({ _id: req.body.id }, updateFields, { new: true })
        if (!product) return res.status(400).json({ code: "exist", message: "Product already exists" })

        log(`Product with id ${req.body.id} updated successfully`)
        res.status(200).json({ message: `Product with id ${req.body.id} updated successfully` })
    } catch (error) {
        errorLog("Error in updateProductById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to fetch users
export const fetchUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -otpCode -otpExpiresAt -otpLastSentAt -otpAttempts -otpBlockedUntil -__v")
        res.status(200).json(users)
    } catch (error) {
        errorLog("Error in fetchUsers controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to delete user by ID
export const deleteUserById = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(400).json({ code: "exist", message: "User not found" })

        // User cannot do it for himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        if (user.role === "admin") return res.status(400).json({ code: "admin", message: "Cannot delete admin user" })

        const deletedUser = new DeletedUser({
            ...user.toObject(),
            deletedAt: new Date()
        })

        await deletedUser.save()
        await user.deleteOne()

        log("User deleted successfully")
        res.status(200).json({ message: "User deleted successfully", id: user._id })
    } catch (error) {
        errorLog("Error in deleteUserById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to get user by ID
export const getUserById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id).select("-password -otpCode -__v")
        if (!user) return res.status(400).json({ code: "exist", message: "User not found" })

        log(`User with id ${id} found successfully`)
        res.status(200).json(user)
    } catch (error) {
        errorLog("Error in getUserById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to fetch deleted users
export const fetchDeletedUsers = async (req, res) => {
    try {
        const deletedUser = await DeletedUser.find().select("-password -otpCode -otpExpiresAt -otpLastSentAt -otpAttempts -otpBlockedUntil -__v")
        res.status(200).json(deletedUser)
    } catch (error) {
        errorLog("Error in fetchDeletedUsers controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to get deleted user by ID
export const getDeletedUserById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const deletedUser = await DeletedUser.findById(id).select("-password -otpCode -__v")
        if (!deletedUser) return res.status(400).json({ code: "exist", message: "User not found" })

        log(`User with id ${id} found successfully`)
        res.status(200).json(deletedUser)
    } catch (error) {
        errorLog("Error in getDeletedUserById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to make admin 
export const makeAdmin = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(400).json({ code: "exist", message: "User not found" })

        // User cannot do it for himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        user.role = "admin"
        await user.save()
        log(`User with id ${id} made admin successfully`)
        res.status(200).json({ message: `User with id ${id} made admin successfully` })
    } catch (error) {
        errorLog("Error in makeAdmin controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to remove admin
export const removeAdmin = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(400).json({ code: "exist", message: "User not found" })

        // User cannot do it for himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        user.role = "user"
        await user.save()
        log(`User with id ${id} removed admin successfully`)
        res.status(200).json({ message: `User with id ${id} removed admin successfully` })
    } catch (error) {
        errorLog("Error in removeAdmin controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to fetch orders
export const fetchOrders = async (req, res) => {
    try {
        const orders = await Order.find().select("-__v")
        log("Orders found successfully")
        res.status(200).json(orders)
    } catch (error) {
        errorLog("Error in fetchOrders controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to get order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "Order id is required" })

    try {
        const order = await Order.findById(id).select("-__v")
        if (!order) return res.status(400).json({ code: "exist", message: "Order not found" })

        log(`Order with id ${id} found successfully`)
        res.status(200).json(order)
    } catch (error) {
        errorLog("Error in getOrderById controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to gets multiple products by their IDs
export const getProductsByIds = async (req, res) => {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ code: "!field", message: "Product ids are required" })

    try {
        const products = await Product.find({ _id: { $in: ids } }).select("-__v")
        if (products.length !== ids.length) return res.status(400).json({ code: "exist", message: "One or more products not found" })

        log("Products found successfully")
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getProductsByIds controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to updates an order's status by ID
export const updateOrderStatus = async (req, res) => {
    const { id, newStatus } = req.body
    log(id, newStatus)
    if (!id || !newStatus) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        const order = await Order.findById(id)
        if (!order) return res.status(400).json({ code: "exist", message: "Order not found" })

        // Prevent updating a cancelled order
        if (order.status === "cancelled") return res.status(400).json({ code: "cancelled_order", message: "Cannot update a cancelled order." })

        // Prevent updating a delivered order
        if (order.status === "delivered") return res.status(400).json({ code: "delivered_order", message: "Cannot update a delivered order." })

        // Prevent updating to the same status
        if (order.status === newStatus) return res.status(400).json({ code: "same_status", message: "New status is the same as the old status" })

        // Update status
        order.status = newStatus
        await order.save()

        log(`Order with id ${id} updated successfully`)
        res.status(200).json({ message: `Order with id ${id} updated successfully` })
    } catch (error) {
        errorLog("Error in updateOrderStatus controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}