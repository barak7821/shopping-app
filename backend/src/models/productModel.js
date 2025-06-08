import mongoose from "mongoose";
import Joi from "joi";

export const productSchemaJoi = Joi.object(
    {
        title: Joi.string().min(2).max(20).required(),
        category: Joi.string().min(2).max(20).required(),
        price: Joi.number().required(),
        image: Joi.string().required(),
        description: Joi.string().required(),
        sizes: Joi.array().required()
    }
)

const productSchema = new mongoose.Schema(
    {
        title: String,
        category: String,
        price: Number,
        image: String,
        description: String,
        sizes: [ String ]
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const Product = mongoose.model("Product", productSchema)
export default Product