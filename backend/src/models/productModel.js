import mongoose from "mongoose";
import Joi from "joi";

export const productSchemaJoi = Joi.object(
    {
        title: Joi.string().min(2).max(30).required(),
        category: Joi.string().min(2).max(20).required(),
        price: Joi.number().required(),
        image: Joi.string().required(),
        description: Joi.string().required(),
        sizes: Joi.array().required(),
        type: Joi.string().valid(
            "t-shirt", "shirt", "hoodie", "dress", "pants",
            "shorts", "skirt", "jacket", "leggings"
        ).required(),
        onSale: Joi.boolean().default(false),
        discountPercent: Joi.number().default(0)
    }
)

export const updateProductSchemaJoi = Joi.object(
    {
        title: Joi.string().min(2).max(30).allow(""),
        category: Joi.string().min(2).max(20).allow(""),
        price: Joi.number().allow(""),
        image: Joi.string().allow(""),
        description: Joi.string().allow(""),
        sizes: Joi.array().allow(""),
        type: Joi.string().valid(
            "t-shirt", "shirt", "hoodie", "dress", "pants",
            "shorts", "skirt", "jacket", "leggings"
        ).allow(""),
        onSale: Joi.boolean().default(false).allow(""),
        discountPercent: Joi.number().default(0).allow("")
    }
)

const productSchema = new mongoose.Schema(
    {
        title: String,
        category: String,
        price: Number,
        image: String,
        description: String,
        sizes: [String],
        type: String,
        onSale: {
            type: Boolean,
            default: false
        },
        discountPercent: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const Product = mongoose.model("Product", productSchema)
export default Product