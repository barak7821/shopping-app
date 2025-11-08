import { Hero, BestSeller } from "../models/homePageModel.js";
import Product from "../models/productModel.js";
import { errorLog, log } from "../utils/log.js";

// Controller to get hero section
export const getHeroSection = async (req, res) => {
    try {
        const hero = await Hero.findById("hero_section")
        if (!hero) return res.status(404).json({ code: "not_found", message: "Hero section not found" })

        log("Hero section found successfully")
        res.status(200).json(hero)
    } catch (error) {
        errorLog("Error in getHeroSection controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}

// Controller to get best seller section
export const getBestSellers = async (req, res) => {
    try {
        const bestSeller = await BestSeller.findById("best_seller")
        if (!bestSeller) return res.status(404).json({ code: "not_found", message: "Best seller section not found" })

        log("Best seller section found successfully")

        const products = await Product.find({ _id: { $in: bestSeller.products } })
        bestSeller.products = products

        log("Best seller products found successfully")
        res.status(200).json(products)
    } catch (error) {
        errorLog("Error in getBestSellers controller", error.message)
        return res.status(500).json({ code: "server_error", message: "server_error" })
    }
}