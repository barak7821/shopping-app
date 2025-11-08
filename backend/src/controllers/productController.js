import Product from "../models/productModel.js";
import { errorLog, log } from "../utils/log.js";

// Controller to get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
        log(`Fetched ${products.length} products`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getProducts controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to find products from search input
export const findProducts = async (req, res) => {
    const { search } = req.body
    if (!search || search.trim() === "") return res.status(400).json({ code: "!field", message: "Search input is required" })

    try {
        const products = await Product.find({ title: { $regex: search, $options: "i" } }).select("-__v -createdAt -updatedAt -description -sizes -type -category -onSale -discountPercent") // Find products by title
            .limit(10) // Limit results to 10 for performance

        log(`Found ${products.length} products for search: ${search}`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in findProducts controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to find products by query parameters
export const findProductsQuery = async (req, res) => {
    const { search } = req.query // Use query parameters for search input
    if (!search || search.trim() === "") return res.status(400).json({ code: "!field", message: "Search query is required" })

    try {
        const products = await Product.find({ title: { $regex: search, $options: "i" } }) // Find products by title

        log(`Found ${products.length} products for search: ${search}`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in findProducts controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get latest 10 products
export const getLatestProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).limit(10).select("-__v -createdAt -updatedAt -description -sizes -type -category")
        log(`Fetched ${products.length} latest products`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getLatestProducts controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to gets multiple products by their IDs
export const getProductsByIds = async (req, res) => {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ code: "!field", message: "Product ids are required" })

    try {
        const products = await Product.find({ _id: { $in: ids } }).select("-__v")
        if (products.length !== ids.length) return res.status(404).json({ code: "not_found", message: "One or more products not found" })

        log("Products found successfully")
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getProductsByIds controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}