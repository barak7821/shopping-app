import { Hero, BestSeller, ContactInfo } from "../models/homePageModel.js";
import Product from "../models/productModel.js";
import { getErrorMessage } from "../utils/errorUtils.js";
import { errorLog, log } from "../utils/logger.js";
import { HomeHandler } from "../utils/types.js";

// Controller to get hero section
export const getHeroSection: HomeHandler = async (req, res) => {
    try {
        const hero = await Hero.findById("hero_section").select("-__v -createdAt -updatedAt -version -updatedBy -_id").lean()
        if (!hero) return res.status(404).json({ code: "not_found", message: "Hero section not found" })

        log("Hero section found successfully")
        res.status(200).json(hero)
    } catch (error) {
        errorLog("Error in getHeroSection controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get best seller section
export const getBestSellers: HomeHandler = async (req, res) => {
    try {
        const bestSeller = await BestSeller.findById("best_seller") // get best seller section
        if (!bestSeller) return res.status(404).json({ code: "not_found", message: "Best seller section not found" })

        log("Best seller section found successfully")

        const products = await Product.find({ _id: { $in: bestSeller.products }, active: true }).select("-__v -createdAt -updatedAt -description -sizes -type -category").lean() // get products from best seller section
        if (products.length !== bestSeller.products.length) return res.status(404).json({ code: "not_found", message: "One or more products not found" })

        log("Best seller products found successfully")
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getBestSellers controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get contact info section
export const getContactInfoSection: HomeHandler = async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findById("contact_info").select("-__v -createdAt -updatedAt -version -updatedBy").lean()
        if (!contactInfo) return res.status(404).json({ code: "not_found", message: "Contact info section not found" })

        log("Contact info section found successfully")
        res.status(200).json(contactInfo)
    } catch (error) {
        errorLog("Error in getContactInfoSection controller", getErrorMessage(error))
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}
