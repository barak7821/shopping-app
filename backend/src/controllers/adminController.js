import DeletedUser from "../models/deletedUserModel.js";
import Order from "../models/orderModel.js";
import Product, { productSchemaJoi, updateProductSchemaJoi } from "../models/productModel.js";
import User from "../models/userModel.js";
import { BestSeller, bestSellerSchemaJoi, ContactInfo, contactInfoSchemaJoi, Hero, heroSchemaJoi } from "../models/homePageModel.js";
import { errorLog, log } from "../utils/log.js";
import { sendOrderConfirmationEmail } from "../utils/userNotifications.js";
import ArchivedProduct from "../models/archivedProductModel.js";
import logAdminAction from "../utils/adminLogger.js";
import AdminLog from "../models/adminLogModel.js";
import AdminSettings from "../models/adminSettingsModel.js";

// Temp Controller - SHOULD ONLY BE USED FOR TESTING!!!

// temp - Controller for delete all products - SHOULD ONLY BE USED FOR TESTING!!!
export const deleteAllProducts = async (req, res) => {
    try {
        await Product.deleteMany({})

        log("All products deleted")
        res.status(200).json({ message: "All products deleted" })
    } catch (error) {
        errorLog("Error in deleteAllProducts controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
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
            const { title, category, price, image, description, sizes, type, onSale, discountPercent } = product

            // Check for required fields
            if (!title || !category || !price || !image || !description || !sizes || !sizes.length || !type || onSale === undefined || discountPercent === undefined) return res.status(400).json({ code: "!field", message: `Missing fields in one of the products` })

            // Validate with Joi
            await productSchemaJoi.validateAsync({ title, category, price, image, description, sizes, type, onSale, discountPercent })

            // Check if product already exists
            const exists = await Product.findOne({ title: title.toLowerCase() })
            if (exists) {
                log(`Skipped duplicate: ${title}`)
                continue
            }

            // Calculate total stock
            const totalStock = sizes.reduce((sum, size) => {
                return sum + (size.stock || 0)
            }, 0)

            formattedProducts.push({
                title: title.toLowerCase(),
                category: category.toLowerCase(),
                price,
                image,
                description,
                sizes,
                type: type.toLowerCase(),
                onSale,
                discountPercent,
                active: totalStock > 0
            })
        }

        if (formattedProducts.length === 0) return res.status(400).json({ message: "No new products to add" })

        await Product.insertMany(formattedProducts)

        log(`${formattedProducts.length} products added`)
        res.status(201).json({ message: `${formattedProducts.length} products added`, added: formattedProducts.length })
    } catch (error) {
        errorLog("Error in addMultipleProducts controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
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
            const { name, email, password, role, provider, phone, street, city, zip, country, note } = user

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
                role,
                provider,
                phone,
                street,
                city,
                zip,
                country,
                note
            })
        }

        if (results.length === 0) return res.status(400).json({ message: "No new users to add" })

        await User.insertMany(results)

        log(`${results.length} users added`)
        res.status(201).json({ message: `${results.length} users added`, added: results.length })
    } catch (error) {
        errorLog("Error in seedUsers controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// temp - Controller to update hero section - SHOULD ONLY BE USED FOR TESTING!!!
export const tempHeroSection = async (req, res) => {
    const { title, subtitle, description, buttonText, buttonLink, imageUrl, imageAlt } = req.body
    if (!title || !subtitle || !description || !buttonText || !buttonLink || !imageUrl || !imageAlt) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        const hero = await Hero.findById("hero_section")
        if (!hero) {
            const newHero = new Hero({
                _id: "hero_section",
                title,
                subtitle,
                description,
                buttonText,
                buttonLink,
                imageUrl,
                imageAlt,
                version: 1
            })
            await newHero.save()
            log("Hero section created successfully")
            return res.status(200).json({ message: "Hero section created successfully" })
        }

        // Update hero section data
        hero.title = title
        hero.subtitle = subtitle
        hero.description = description
        hero.buttonText = buttonText
        hero.buttonLink = buttonLink
        hero.imageUrl = imageUrl
        hero.imageAlt = imageAlt
        hero.version += 1

        await hero.save()

        log("Hero section updated successfully")
        res.status(200).json({ message: "Hero section updated successfully" })
    } catch (error) {
        errorLog("Error in tempHeroSection controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// temp - Controller to update contact info section - SHOULD ONLY BE USED FOR TESTING!!!
export const tempContactInfo = async (req, res) => {
    const { email, phone, facebookUrl, instagramUrl, twitterUrl, openingHours, address } = req.body
    if (!email || !phone || !facebookUrl || !instagramUrl || !twitterUrl || !openingHours || !address) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        const contactInfo = await ContactInfo.findById("contact_info")
        if (!contactInfo) { // if contact info is not found
            const newContactInfo = new ContactInfo({
                _id: "contact_info",
                email: email,
                phone: phone,
                facebookUrl: facebookUrl,
                instagramUrl: instagramUrl,
                twitterUrl: twitterUrl,
                openingHours: openingHours,
                address: address,
                version: 1
            })
            await newContactInfo.save()
            log("Contact info section created successfully")
            return res.status(201).json({ message: "Contact info section created successfully" })
        }

        // Update contact info section data
        contactInfo.email = email
        contactInfo.phone = phone
        contactInfo.facebookUrl = facebookUrl
        contactInfo.instagramUrl = instagramUrl
        contactInfo.twitterUrl = twitterUrl
        contactInfo.openingHours = openingHours
        contactInfo.address = address
        contactInfo.version += 1

        await contactInfo.save()

        log("Contact info section updated successfully")
        res.status(200).json({ message: "Contact info section updated successfully" })
    } catch (error) {
        errorLog("Error in tempContactInfo controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// temp - Controller to update best seller section - SHOULD ONLY BE USED FOR TESTING!!!
export const tempBestSeller = async (req, res) => {
    const { bestSellerSection } = req.body

    try {
        const bestSeller = await BestSeller.findById("best_seller")
        if (!bestSeller) { // if best seller is not found
            const newBestSeller = new BestSeller({
                _id: "best_seller",
                products: bestSellerSection,
                version: 1
            })
            await newBestSeller.save()
            log("Best seller section created successfully")
            return res.status(201).json({ message: "Best seller section created successfully" })
        }

        // Update best seller section data
        bestSeller.products = bestSellerSection
        bestSeller.version += 1

        await bestSeller.save()

        log("Best seller section updated successfully")
        res.status(200).json({ message: "Best seller section updated successfully" })
    } catch (error) {
        errorLog("Error in tempBestSeller controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

/////////// Products Controllers ///////////

// Controller to add a new product
export const addProduct = async (req, res) => {
    const { title, category, price, image, description, sizes, type, onSale, discountPercent } = req.body
    if (!title || !category || !price || !image || !description || !sizes || sizes.length === 0 || !type) return res.status(400).json({ code: "!field", message: "Missing required fields" }) // onSale and discountPercent are optional

    try {
        // Validate input against Joi schema
        await productSchemaJoi.validateAsync({ title, category, price, image, description, sizes, type, onSale, discountPercent })

        // Verify if the product already exists
        const product = await Product.findOne({ title: title.toLowerCase() })
        if (product) return res.status(400).json({ code: "exist", message: "Product already exists" })

        // Calculate total stock
        const totalStock = sizes.reduce((sum, size) => {
            return sum + (size.stock || 0)
        }, 0)

        // Create a new product
        const newProduct = new Product({
            title: title.toLowerCase(),
            category: category.toLowerCase(),
            price,
            image,
            description,
            sizes,
            type: type.toLowerCase(),
            onSale,
            discountPercent,
            active: totalStock > 0
        })

        // Save the new product to the database
        await newProduct.save()

        log(`${title} added successfully`)
        res.status(201).json({ message: `${title} added successfully`, exist: false })

        // Log admin action
        logAdminAction(req.user.id, "create_product", newProduct._id)
    } catch (error) {
        errorLog("Error in addProduct controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to archive product by id
export const archiveProductById = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })
    log("Product with id ${id} deleted successfully")

    try {
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" })

        const archived = new ArchivedProduct({
            ...product.toObject(),
            deletedAt: new Date()
        })

        await archived.save()
        await product.deleteOne()

        log(`Product with id ${id} deleted successfully`)
        res.status(200).json({ message: `Product with id ${id} deleted successfully` })

        // Log admin action
        logAdminAction(req.user.id, "archive_product", product._id)
    } catch (error) {
        errorLog("Error in archiveProductById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get product by id
export const getProductById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const product = await Product.findById(id).select("-__v -createdAt -updatedAt").lean({ virtuals: true })
        if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" })

        const safeSizes = product.sizes.filter(size => (size.stock || 0) > 0)

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

// Controller to edit product by id
export const updateProductById = async (req, res) => {
    const { id, title, category, price, image, description, sizes, type, onSale, discountPercent } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

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
        if (sizes) {
            updateFields.sizes = sizes

            // Calculate total stock
            const totalStock = sizes.reduce((sum, size) => {
                return sum + (size.stock || 0)
            }, 0)

            updateFields.active = totalStock > 0
        }
        if (type) updateFields.type = type.toLowerCase()
        if (onSale !== undefined) updateFields.onSale = onSale
        if (discountPercent !== undefined) updateFields.discountPercent = discountPercent

        // If no fields are provided, return an error
        if (Object.keys(updateFields).length === 0) return res.status(400).json({ code: "!field", message: "No fields provided" })

        // Update product data
        const product = await Product.findByIdAndUpdate({ _id: req.body.id }, updateFields, { new: true })
        if (!product) return res.status(404).json({ code: "not_found", message: "Product not found" })

        log(`Product with id ${req.body.id} updated successfully`)
        res.status(200).json({ message: `Product with id ${req.body.id} updated successfully` })

        // Log admin action
        logAdminAction(req.user.id, "update_product", product._id, updateFields)
    } catch (error) {
        errorLog("Error in updateProductById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to gets multiple products by their IDs
export const getProductsByIds = async (req, res) => {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ code: "!field", message: "Product ids are required" })

    try {
        const products = await Product.find({ _id: { $in: ids } }).select("-__v -createdAt -updatedAt -description -sizes -type -category -lowStockThreshold -active -discountPercent -onSale -price").lean()
        if (products.length !== ids.length) return res.status(404).json({ code: "not_found", message: "One or more products not found" })

        log("Products found successfully")
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getProductsByIds controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get products by query parameters for pagination
export const getProductsByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1) // Default to page 1 if not provided
        const limit = 20 // Default to 20 items per page

        const sortBy = { createdAt: -1, _id: 1 } // Default sort by createdAt in descending order

        const total = await Product.countDocuments() // Count total number of products

        const items = await Product.find().sort(sortBy).skip((page - 1) * limit).limit(limit).select("-__v -createAt -updatedAt -description -type -active").lean({ virtuals: true })

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

//////////// Archived Product Controllers //////////////

// Controller to get products by query parameters for pagination
export const getArchivedProductsByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1) // Default to page 1 if not provided
        const limit = 20 // Default to 20 items per page

        const sortBy = { createdAt: -1, _id: 1 } // Default sort by createdAt in descending order

        const total = await ArchivedProduct.countDocuments() // Count total number of products

        const items = await ArchivedProduct.find().sort(sortBy).skip((page - 1) * limit).limit(limit).select("-__v -createAt -updatedAt -description -sizes -type -active").lean()

        const totalPages = Math.max(1, Math.ceil(total / limit)) // Calculate total number of pages
        const hasNext = page < totalPages // Check if there are more pages
        const hasPrev = page > 1 // Check if there are previous pages

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} products for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getArchivedProductsByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to restore archived product by Id
export const restoreArchivedProduct = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const archivedProduct = await ArchivedProduct.findById(id)
        if (!archivedProduct) return res.status(404).json({ code: "not_found", message: "Product not found" })

        const product = new Product({
            ...archivedProduct.toObject(),
            deletedAt: null
        })

        await product.save()
        await archivedProduct.deleteOne()

        log(`Product with id ${id} restored successfully`)
        res.status(200).json({ message: `Product with id ${id} restored successfully` })

        // Log admin action
        logAdminAction(req.user.id, "restore_product", product._id)
    } catch (error) {
        errorLog("Error in restoreArchivedProduct controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get archived product by Id
export const getArchivedProductById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "Product id is required" })

    try {
        const archivedProduct = await ArchivedProduct.findById(id).lean()
        if (!archivedProduct) return res.status(404).json({ code: "not_found", message: "Product not found" })

        log(`Product with id ${id} found successfully`)
        res.status(200).json(archivedProduct)
    } catch (error) {
        errorLog("Error in getArchivedProductById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

/////////// Users Controllers ///////////

// Controller to fetch users
export const getUsersByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1)
        const limit = 20
        const sortBy = { createdAt: -1, _id: 1 }

        const total = await User.countDocuments()
        const items = await User.find().sort(sortBy).skip((page - 1) * limit).limit(limit).select("-password -otpCode -otpExpiresAt -otpLastSentAt -otpAttempts -otpBlockedUntil -__v -city -provider -street -zip -country -phone").lean()
        const totalPages = Math.max(1, Math.ceil(total / limit))
        const hasNext = page < totalPages
        const hasPrev = page > 1

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} users for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getUsersByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to delete user by ID
export const deleteUserById = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // User cannot delete himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        // Admin cannot deleted
        if (user.role === "admin") return res.status(403).json({ code: "admin", message: "Cannot delete admin user" })

        // User cannot delete if note is not provided            
        if (user.note === "") return res.status(400).json({ code: "!field", message: "Note is required" })

        const deletedUser = new DeletedUser({
            ...user.toObject(),
            deletedAt: new Date()
        })

        await deletedUser.save()
        await user.deleteOne()

        log("User deleted successfully", user._id)
        res.status(200).json({ message: "User deleted successfully", id: user._id })

        // Log admin action
        logAdminAction(req.user.id, "delete_user", user._id)
    } catch (error) {
        errorLog("Error in deleteUserById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get user by ID
export const getUserById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id).select("-password -otpCode -otpExpiresAt -otpLastSentAt -otpAttempts -otpBlockedUntil -__v").lean()
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        log(`User with id ${id} found successfully`)
        res.status(200).json(user)
    } catch (error) {
        errorLog("Error in getUserById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to fetch deleted users
export const getDeletedUsersByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1)
        const limit = 20
        const sortBy = { deletedAt: -1, _id: 1 }

        const total = await DeletedUser.countDocuments()
        const items = await DeletedUser.find().sort(sortBy).skip((page - 1) * limit).limit(limit).select("-password -otpCode -otpExpiresAt -otpLastSentAt -otpAttempts -otpBlockedUntil -__v -city -provider -street -zip -country -phone -createdAt -updatedAt").lean()
        const totalPages = Math.max(1, Math.ceil(total / limit))
        const hasNext = page < totalPages
        const hasPrev = page > 1

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} deleted users for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getDeletedUsersByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get deleted user by ID
export const getDeletedUserById = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const deletedUser = await DeletedUser.findById(id).select("-password -otpCode -otpExpiresAt -otpLastSentAt -otpAttempts -otpBlockedUntil -__v").lean()
        if (!deletedUser) return res.status(404).json({ code: "not_found", message: "User not found" })

        log(`User with id ${id} found successfully`)
        res.status(200).json(deletedUser)
    } catch (error) {
        errorLog("Error in getDeletedUserById controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to make admin 
export const makeAdmin = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // User cannot do it for himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        user.role = "admin"
        await user.save()
        log(`User with id ${id} made admin successfully`)
        res.status(200).json({ message: `User with id ${id} made admin successfully` })

        // Log admin action
        await logAdminAction(req.user.id, "change_user_role", user._id, {
            newRole: user.role
        })
    } catch (error) {
        errorLog("Error in makeAdmin controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to remove admin
export const removeAdmin = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ code: "!field", message: "User id is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // User cannot do it for himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        user.role = "user"
        await user.save()
        log(`User with id ${id} removed admin successfully`)
        res.status(200).json({ message: `User with id ${id} removed admin successfully` })

        // Log admin action
        await logAdminAction(req.user.id, "change_user_role", user._id, {
            newRole: user.role
        })
    } catch (error) {
        errorLog("Error in removeAdmin controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to add note to user
export const addNoteToUser = async (req, res) => {
    const { id, note } = req.body
    if (!id || !note) return res.status(400).json({ code: "!field", message: "User id and note is required" })

    try {
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ code: "not_found", message: "User not found" })

        // User cannot add note to himself
        if (user._id.toString() === req.user.id.toString()) return res.status(403).json({ code: "same_user", message: "You cannot perform this action on your own account" })

        user.note = note
        await user.save()
        log(`Note added to user with id ${id} successfully`)
        res.status(200).json({ message: `Note added to user with id ${id} successfully` })
    } catch (error) {
        errorLog("Error in addNoteToUser controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

/////////// Orders Controllers ///////////

// Controller to fetch orders
export const getOrderByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1)
        const limit = 20

        const total = await Order.countDocuments()
        const items = await Order.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-__v -updatedAt -shippingAddress.city -shippingAddress.street -shippingAddress.zip -shippingAddress.country -shippingAddress.phone -shippingAddress.name -orderItems.selectedSize -orderItems.selectedQuantity -orderItems.itemPricePerUnit -userId").lean()

        const totalPages = Math.max(1, Math.ceil(total / limit))
        const hasNext = page < totalPages
        const hasPrev = page > 1

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} orders for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getOrderByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get order by Number
export const getOrderByOrderNumber = async (req, res) => {
    const { number } = req.query
    if (!number) return res.status(400).json({ code: "!field", message: "Order id is required" })

    try {
        const order = await Order.findOne({ orderNumber: number }).select("-__v -updatedAt").lean()
        if (!order) return res.status(404).json({ code: "not_found", message: "Order not found" })

        log(`Order ${number} found successfully`)
        res.status(200).json(order)
    } catch (error) {
        errorLog("Error in getOrderByOrderNumber controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to updates an order's status by ID
export const updateOrderStatus = async (req, res) => {
    const { id, newStatus } = req.body
    if (!id || !newStatus) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        const order = await Order.findById(id)
        if (!order) return res.status(404).json({ code: "not_found", message: "Order not found" })

        // Prevent updating a cancelled order
        if (order.status === "cancelled") return res.status(422).json({ code: "cancelled_order", message: "Cannot update a cancelled order." })

        // Prevent updating a delivered order
        if (order.status === "delivered") return res.status(422).json({ code: "delivered_order", message: "Cannot update a delivered order." })

        // Prevent updating to the same status
        if (order.status === newStatus) return res.status(409).json({ code: "same_status", message: "New status is the same as the old status" })

        // Update status
        order.status = newStatus
        await order.save()

        log(`Order with id ${id} updated successfully`)
        res.status(200).json({ message: `Order with id ${id} updated successfully` })

        // Log admin action
        logAdminAction(req.user.id, "update_order_status", order._id)
    } catch (error) {
        errorLog("Error in updateOrderStatus controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to resend order receipt email
export const resendOrderReceipt = async (req, res) => {
    const { orderId, orderNumber, email } = req.body
    if (!orderId && !orderNumber) return res.status(400).json({ code: "!field", message: "Order id or order number is required" })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ code: "invalid_email", message: "Invalid email" })
    }

    try {
        const query = orderId ? { _id: orderId } : { orderNumber }
        const order = await Order.findOne(query).lean()
        if (!order) return res.status(404).json({ code: "not_found", message: "Order not found" })

        let user = null
        if (order.userId && order.userId !== "guest") {
            user = await User.findById(order.userId).lean()
        }

        await sendOrderConfirmationEmail({ user, order, overrideEmail: email })

        log(`Order receipt resent for order ${order.orderNumber}`)
        res.status(200).json({ message: "Receipt sent successfully" })

        logAdminAction(req.user.id, "resend_order_receipt", order._id)
    } catch (error) {
        errorLog("Error in resendOrderReceipt controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

/////////// Home Page Controllers ///////////

// Controller to update hero section
export const heroSection = async (req, res) => {
    const { heroSection } = req.body
    if (!heroSection) return res.status(400).json({ code: "!field", message: "All fields are required" })
    if (Object.keys(heroSection).length === 0) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        // Validate input against Joi schema
        await heroSchemaJoi.validateAsync(heroSection)

        const hero = await Hero.findById("hero_section")
        if (!hero) { // if hero is not found
            const newHero = new hero({
                _id: "hero_section",
                title: heroSection.title,
                subtitle: heroSection.subtitle,
                description: heroSection.description,
                buttonText: heroSection.buttonText,
                buttonLink: heroSection.buttonLink.toLowerCase(),
                imageUrl: heroSection.imageUrl,
                imageAlt: heroSection.imageAlt,
                updatedBy: req.user.id,
                version: 1
            })
            await newHero.save()
            log("Hero section created successfully")
            return res.status(201).json({ message: "Hero section created successfully" })
        }

        // if hero is same as current hero section
        if (hero.title === heroSection.title &&
            hero.subtitle === heroSection.subtitle &&
            hero.description === heroSection.description &&
            hero.buttonText === heroSection.buttonText &&
            hero.buttonLink === heroSection.buttonLink &&
            hero.imageUrl === heroSection.imageUrl &&
            hero.imageAlt === heroSection.imageAlt) {
            log("Hero section is same as current hero section")
            return res.status(409).json({ code: "same_hero", message: "Hero section is same as current hero section" })
        }

        // Update hero section data
        hero.title = heroSection.title
        hero.subtitle = heroSection.subtitle
        hero.description = heroSection.description
        hero.buttonText = heroSection.buttonText
        hero.buttonLink = heroSection.buttonLink
        hero.imageUrl = heroSection.imageUrl
        hero.imageAlt = heroSection.imageAlt
        hero.updatedBy = req.user.id
        hero.version += 1

        await hero.save()

        log("Hero section updated successfully")
        res.status(200).json({ message: "Hero section updated successfully" })

        // Log admin action
        logAdminAction(req.user.id, "update_hero_section")
    } catch (error) {
        errorLog("Error in heroSection controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to update best seller section
export const bestSellerSection = async (req, res) => {
    const { bestSellerSection } = req.body
    if (!bestSellerSection) return res.status(400).json({ code: "!field", message: "All fields are required" }) // if no best seller section is provided
    if (bestSellerSection.length < 5) return res.status(400).json({ code: "!field", message: "Best seller section must have at least 5 items" }) // if best seller section has less than 5 items

    try {
        // Validate input against Joi schema
        await bestSellerSchemaJoi.validateAsync(bestSellerSection)

        const bestSeller = await BestSeller.findById("best_seller")
        if (!bestSeller) { // if best seller is not found
            const newBestSeller = new BestSeller({
                _id: "best_seller",
                products: bestSellerSection,
                updatedBy: req.user.id,
                version: 1
            })
            await newBestSeller.save()
            log("Best seller section created successfully")
            return res.status(201).json({ message: "Best seller section created successfully" })
        }

        // if best seller is same as current best seller section
        if (bestSeller.products.toString() === bestSellerSection.toString()) {
            log("Best seller section is same as current best seller section")
            return res.status(409).json({ code: "same_best_seller", message: "Best seller section is same as current best seller section" })
        }

        // Update best seller section data
        bestSeller.products = bestSellerSection
        bestSeller.updatedBy = req.user.id
        bestSeller.version += 1

        await bestSeller.save()

        log("Best seller section updated successfully")
        res.status(200).json({ message: "Best seller section updated successfully" })

        // Log admin action
        logAdminAction(req.user.id, "update_best_seller_section")
    } catch (error) {
        errorLog("Error in bestSellerSection controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to update contact info
export const contactInfoSection = async (req, res) => {
    const { contactInfoSection } = req.body
    if (!contactInfoSection) return res.status(400).json({ code: "!field", message: "All fields are required" }) // if no contact info section is provided
    try {
        // Validate input against Joi schema
        await contactInfoSchemaJoi.validateAsync(contactInfoSection)

        const contactInfo = await ContactInfo.findById("contact_info")
        if (!contactInfo) { // if contact info is not found
            const newContactInfo = new ContactInfo({
                _id: "contact_info",
                email: contactInfoSection.email,
                phone: contactInfoSection.phone,
                facebookUrl: contactInfoSection.facebookUrl,
                instagramUrl: contactInfoSection.instagramUrl,
                twitterUrl: contactInfoSection.twitterUrl,
                openingHours: contactInfoSection.openingHours,
                address: contactInfoSection.address,
                updatedBy: req.user.id,
                version: 1
            })
            await newContactInfo.save()
            log("Contact info section created successfully")
            return res.status(201).json({ message: "Contact info section created successfully" })
        }

        // if contact info is same as current contact info section
        if (contactInfo.email === contactInfoSection.email &&
            contactInfo.phone === contactInfoSection.phone &&
            contactInfo.facebookUrl === contactInfoSection.facebookUrl &&
            contactInfo.instagramUrl === contactInfoSection.instagramUrl &&
            contactInfo.twitterUrl === contactInfoSection.twitterUrl &&
            contactInfo.openingHours === contactInfoSection.openingHours &&
            contactInfo.address === contactInfoSection.address) {
            log("Contact info section is same as current contact info section")
            return res.status(409).json({ code: "same_contact_info", message: "Contact info section is same as current contact info section" })
        }

        // Update contact info section data
        contactInfo.email = contactInfoSection.email
        contactInfo.phone = contactInfoSection.phone
        contactInfo.facebookUrl = contactInfoSection.facebookUrl
        contactInfo.instagramUrl = contactInfoSection.instagramUrl
        contactInfo.twitterUrl = contactInfoSection.twitterUrl
        contactInfo.openingHours = contactInfoSection.openingHours
        contactInfo.address = contactInfoSection.address
        contactInfo.updatedBy = req.user.id
        contactInfo.version += 1

        await contactInfo.save()

        log("Contact info section updated successfully")
        res.status(200).json({ message: "Contact info section updated successfully" })

        // Log admin action
        logAdminAction(req.user.id, "update_contact_info_section")
    } catch (error) {
        errorLog("Error in contactInfoSection controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

/////////// Logs Controllers ///////////

export const getLogsByQuery = async (req, res) => {
    try {
        const page = Math.max(1, +req.query.page || 1)
        const limit = 20

        const total = await AdminLog.countDocuments()
        const items = await AdminLog.find().populate("adminId", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
        const totalPages = Math.max(1, Math.ceil(total / limit))
        const hasNext = page < totalPages
        const hasPrev = page > 1

        if (page > totalPages) return res.status(404).json({ code: "page_not_found", message: "Page not found" })

        log(`Fetched ${items.length} logs for page ${page}`)
        res.status(200).json({ items, page, total, totalPages, hasNext, hasPrev })
    } catch (error) {
        errorLog("Error in getLogsByQuery controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

/////////// Notification Controllers ///////////

// Controller to get notification emails list
export const getNotificationEmail = async (req, res) => {
    try {
        const emailsList = await AdminSettings.findById("notification_emails").lean()

        // If there are no settings, create a new one
        if (!emailsList) {
            const newEmailsList = await AdminSettings.create({})
            res.status(201).json(newEmailsList.notificationEmails)
            return
        }

        log("Fetched notification emails list")
        res.status(200).json(emailsList.notificationEmails)
    } catch (error) {
        errorLog("Error in getNotificationEmail controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to update notification emails list
export const updateNotificationEmail = async (req, res) => {
    const { emails } = req.body
    if (!Array.isArray(emails)) return res.status(400).json({ code: "!field", message: "All fields are required" })

    try {
        let emailsList = await AdminSettings.findById("notification_emails")

        // If there are no emailsList, create a new one
        if (!emailsList) {
            emailsList = await AdminSettings.create({ _id: "notification_emails", notificationEmails: emails })
        }

        // Check if provided email already exists
        if (emailsList.notificationEmails.some(email => email.toLowerCase() === emails[0])) {
            return res.status(409).json({ code: "exist", message: "Email already exists" })
        }

        // Update notification emails list
        emailsList.notificationEmails = emails
        await emailsList.save()

        log("Notification emails list updated successfully")
        res.status(200).json(emailsList.notificationEmails)

        // Log admin action
        logAdminAction(req.user.id, "update_notification_emails")
    } catch (error) {
        errorLog("Error in updateNotificationEmail controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}
