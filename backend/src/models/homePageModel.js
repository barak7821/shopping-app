import Joi from "joi"
import mongoose from "mongoose"

export const heroSchemaJoi = Joi.object(
    {
        title: Joi.string().required(),
        subtitle: Joi.string().required(),
        description: Joi.string().required(),
        buttonText: Joi.string().required(),
        buttonLink: Joi.string().required(),
        imageUrl: Joi.string().required(),
        imageAlt: Joi.string().required()
    }
)

export const bestSellerSchemaJoi = Joi.array().items(
    Joi.object({
        _id: Joi.string().required(),
    }).unknown(true)
).length(5).required()

const heroSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: "hero_section" // Fixed ID for the hero section
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        buttonText: {
            type: String,
            required: true,
            trim: true
        },
        buttonLink: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            default: ""
        },
        imageAlt: {
            type: String,
            default: ""
        },
        version: {
            type: Number,
            default: 1
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true,
        collection: "HomePage"
    }
)

export const Hero = mongoose.model("Hero", heroSchema)

const bestSellerSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: "best_seller" // Fixed ID for the best seller section
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            }
        ],
        version: {
            type: Number,
            default: 1
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    }, {
    timestamps: true,
    collection: "HomePage"
}
)

export const BestSeller = mongoose.model("BestSeller", bestSellerSchema)