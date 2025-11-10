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

// Controller to get products by query parameters for pagination + filters + sort
export const getProductsByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1) // Default to page 1 if not provided
        const limit = 20 // Default to 20 items per page

        const categoryParam = (req.query.category || "").trim() // Default to empty string if not provided

        const categoriesArray = categoryParam ? categoryParam.split(",").map(s => s.trim()).filter(Boolean) : [] // Split categories by comma and trim whitespace

        const typeParam = (req.query.type || "").trim() // Default to empty string if not provided

        const typesArray = typeParam ? typeParam.split(",").map(s => s.trim()).filter(Boolean) : [] // Split types by comma and trim whitespace

        const sizes = (req.query.sizes || "").trim() // Default to empty string if not provided
        const sort = (req.query.sort || "new").trim() // Default to "new" if not provided   

        const query = {} // Empty query object
        if (categoriesArray.length) query.category = { $in: categoriesArray } // Add category to query
        if (typesArray.length) query.type = { $in: typesArray } // Add type to query 
        if (sizes) { // Add sizes to query
            const arr = sizes.split(",").map(s => s.trim()).filter(Boolean)
            if (arr.length) query.sizes = { $in: arr }
        }

        let sortBy = { createdAt: -1 } // Default sort by createdAt in descending order
        if (sort === "price-low") sortBy = { price: 1, _id: 1 } // Sort by price in ascending order 
        if (sort === "price-high") sortBy = { price: -1, _id: 1 } // Sort by price in descending order
        if (sort === "featured") sortBy = { createdAt: -1, _id: 1 } // Sort by createdAt in descending order - then by _id in ascending order

        const total = await Product.countDocuments(query) // Count total number of products

        const items = await Product.find(query).sort(sortBy).skip((page - 1) * limit).limit(limit).select("-__v -updatedAt -description").lean()

        const totalPages = Math.max(1, Math.ceil(total / limit)) // Calculate total number of pages
        const hasNext = page < totalPages // Check if there are more pages
        const hasPrev = page > 1 // Check if there are previous pages

        log(`Fetched ${items.length} products for page ${page}`)
        return res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getProductsByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}