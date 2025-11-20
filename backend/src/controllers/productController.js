import Product from "../models/productModel.js";
import { errorLog, log } from "../utils/log.js";
import ArchivedProduct from "../models/archivedProductModel.js";

// Controller to find products - Search Bar and Admin Best Seller
export const findProductsSearch = async (req, res) => {
    const { search } = req.body
    if (!search || search.trim() === "") return res.status(400).json({ code: "!field", message: "Search input is required" })

    try {
        const products = await Product.find({ title: { $regex: search, $options: "i" }, active: true }).select("-__v -createdAt -updatedAt -description -sizes -type -category").limit(10).lean()

        log(`Found ${products.length} products for search: ${search}`)
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in findProductsSearch controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to find products by query parameters - Search Results Page
export const findProductsQuery = async (req, res) => {
    const { search } = req.query // Use query parameters for search input
    if (!search || search.trim() === "") return res.status(400).json({ code: "!field", message: "Search query is required" })

    try {
        const products = await Product.find({ title: { $regex: search, $options: "i" }, active: true }).select("-__v -createdAt -updatedAt -description -sizes -type -category -lowStockThreshold -sizes.").limit(10).lean()

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
        const products = await Product.find({ active: true }).sort({ createdAt: -1 }).limit(10).select("-__v -createdAt -updatedAt -description -sizes -type -category -lowStockThreshold").lean()

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
        const products = await Product.find({ _id: { $in: ids }, active: true }).select("-__v -createdAt -updatedAt -description -sizes -type -category -lowStockThreshold -totalStock")

        log("Products found successfully")
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getProductsByIds controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to gets multiple products by list of IDs - exclusive for ORDERS!!!!!
export const getProductsByIdsOrders = async (req, res) => {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ code: "!field", message: "Product ids are required" })

    try {
        const products = await Product.find({ _id: { $in: ids } }).select("-__v -createdAt -updatedAt -description -sizes -type -category -lowStockThreshold -totalStock")

        // If some of products not found, search in archive products
        if (products.length !== ids.length) {
            const archivedProducts = await ArchivedProduct.find({ _id: { $in: ids } }).select("-__v -createdAt -updatedAt -description -sizes -type -category -lowStockThreshold")
            products.push(...archivedProducts)
        }

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

        const categoriesArray = categoryParam ? categoryParam.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) : [] // Split categories by comma and trim whitespace

        const typeParam = (req.query.type || "").trim() // Default to empty string if not provided

        const typesArray = typeParam ? typeParam.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) : [] // Split types by comma and trim whitespace

        const sizes = (req.query.sizes || "").trim().toUpperCase() // Default to empty string if not provided
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

        query.active = true // Add active to query

        const total = await Product.countDocuments(query) // Count total number of products

        const items = await Product.find(query).sort(sortBy).skip((page - 1) * limit).limit(limit).select("-__v -updatedAt -description -sizes -type -category -createdAt").lean()

        const totalPages = Math.max(1, Math.ceil(total / limit)) // Calculate total number of pages
        const hasNext = page < totalPages // Check if there are more pages
        const hasPrev = page > 1 // Check if there are previous pages

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} products for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getProductsByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const product = await Product.findOne({ _id: id, active: true }).select("-__v -createdAt -updatedAt -category -type -totalStock").lean({ virtuals: ["availability"] })
        if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" })

        const safeSizes = product.sizes.filter(size => (size.stock || 0) > 0).map(size => size.code)

        const sanitizedProduct = {
            ...product,
            sizes: safeSizes
        }

        log(`Product with id ${id} found successfully`)
        res.status(200).json(sanitizedProduct)
    } catch (error) {
        errorLog("Error in getProductById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}
