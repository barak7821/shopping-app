import Product, { productSchemaJoi } from "../models/productModel.js";
import { errorLog, log } from "../utils/log.js";

// Controller to add a new product
export const addProduct = async (req, res) => {
    const { title, category, price, image, description, sizes, type } = req.body
    try {
        // Validate input fields
        if (!title || !category || !price || !image || !description || !sizes || !type) return res.status(400).json({ message: "Missing required fields" })

        // Validate input against Joi schema
        await productSchemaJoi.validateAsync({ title, category, price, image, description, sizes })

        // Verify if the product already exists
        const productExists = await Product.findOne({ title: title.toLowerCase() })
        if (productExists) return res.status(400).json({ code: "exist", message: "Product already exists" })

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

// Controller to get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getProducts controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to add multiple products at once
export const addMultipleProducts = async (req, res) => {
    const products = req.body

    if (!Array.isArray(products) || products.length === 0)
        return res.status(400).json({ message: "No products provided" })

    try {
        // Validate and format each product
        const formattedProducts = []

        for (const product of products) {
            const { title, category, price, image, description, sizes, type } = product

            // Check for required fields
            if (!title || !category || !price || !image || !description || !sizes || !type) {
                return res.status(400).json({ message: `Missing fields in one of the products` })
            }

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

// Controller to find products from search input
export const findProducts = async (req, res) => {
    const { search } = req.body
    if (!search || search.trim() === "") return res.status(400).json({ message: "Search input is required" })

    try {
        const products = await Product.find({ title: { $regex: search, $options: "i" } }) // Find products by title
            .limit(10) // Limit results to 10 for performance

        if (!products) return res.status(404).json({ message: "No products found" })
        if (products.length === 0) return res.status(404).json({ message: "No products found" })

        log(`Found ${products.length} products for search: ${search}`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in findProducts controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// Controller to find products by query parameters
export const findProductsQuery = async (req, res) => {
    const { search } = req.query // Use query parameters for search input
    if (!search || search.trim() === "") return res.status(400).json({ message: "Search query is required" })

    try {
        const products = await Product.find({ title: { $regex: search, $options: "i" } }) // Find products by title

        if (!products) return res.status(404).json({ message: "No products found" })
        if (products.length === 0) return res.status(404).json({ message: "No products found" })

        log(`Found ${products.length} products for search: ${search}`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in findProducts controller", error.message)
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

// temp controller for delete all products - SHOULD ONLY BE USED FOR TESTING!!!
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