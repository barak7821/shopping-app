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
