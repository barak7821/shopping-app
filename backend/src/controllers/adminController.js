import Product, { productSchemaJoi, updateProductSchemaJoi } from "../models/productModel.js";
import { errorLog, log } from "../utils/log.js";

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

        if (formattedProducts.length === 0)
            return res.status(400).json({ message: "No new products to add" })

        await Product.insertMany(formattedProducts)

        log(`${formattedProducts.length} products added`)
        res.status(201).json({ message: `${formattedProducts.length} products added`, added: formattedProducts.length })
    } catch (error) {
        errorLog("Error in addMultipleProducts controller", error.message)
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

    console.log(id)

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

// Controller to edit product by id - TO BE IMPLEMENTED
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
