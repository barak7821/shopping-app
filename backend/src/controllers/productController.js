import Product, { productSchemaJoi } from "../models/productModel.js";
import { errorLog, log } from "../utils/log.js";

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