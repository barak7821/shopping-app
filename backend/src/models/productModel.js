import mongoose from "mongoose";
import Joi from "joi";
import mongooseLeanVirtuals from "mongoose-lean-virtuals"

export const productSchemaJoi = Joi.object(
    {
        title: Joi.string().min(2).max(30).required(),
        category: Joi.string().min(2).max(20).required(),
        price: Joi.number().required(),
        image: Joi.string().required(),
        description: Joi.string().required(),
        sizes: Joi.array().items(
            Joi.object({
                code: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "XXXL", "4", "6", "8", "10").required(),
                stock: Joi.number().min(0).required()
            })
        ).min(1).required(),
        type: Joi.string().valid(
            "t-shirt", "shirt", "hoodie", "dress", "pants",
            "shorts", "skirt", "jacket", "leggings"
        ).required(),
        onSale: Joi.boolean().default(false),
        discountPercent: Joi.number().default(0),
        active: Joi.boolean().default(true),
        lowStockThreshold: Joi.number().default(3)
    }
)

export const updateProductSchemaJoi = Joi.object(
    {
        title: Joi.string().min(2).max(30).allow(""),
        category: Joi.string().min(2).max(20).allow(""),
        price: Joi.number().allow(""),
        image: Joi.string().allow(""),
        description: Joi.string().allow(""),
        sizes: Joi.array().items(
            Joi.object({
                code: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "XXXL", "4", "6", "8", "10").required(),
                stock: Joi.number().min(0).required()
            })
        ).min(1).allow(""),
        type: Joi.string().valid(
            "t-shirt", "shirt", "hoodie", "dress", "pants",
            "shorts", "skirt", "jacket", "leggings"
        ).allow(""),
        onSale: Joi.boolean().default(false).allow(""),
        discountPercent: Joi.number().default(0).allow(""),
        active: Joi.boolean().default(true).allow(""),
        lowStockThreshold: Joi.number().default(3).allow("")
    }
)

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 30,
            required: true
        },
        category: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 20,
            required: true
        },
        price: {
            type: Number,
            min: 0,
            required: true
        },
        image: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        sizes: {
            type: [
                {
                    code: {
                        type: String,
                        enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4", "6", "8", "10"],
                        required: true
                    },
                    stock: {
                        type: Number,
                        min: 0,
                        default: 0
                    }
                }
            ],
            required: true
        },
        type: {
            type: String,
            enum: [
                "t-shirt", "shirt", "hoodie", "dress", "pants",
                "shorts", "skirt", "jacket", "leggings"
            ],
            required: true
        },
        onSale: {
            type: Boolean,
            default: false
        },
        discountPercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        active: {
            type: Boolean,
            default: true
        },
        lowStockThreshold: {
            type: Number,
            min: 0,
            default: 3
        }
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

productSchema.index({ category: 1 })
productSchema.index({ type: 1 })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ "sizes.code": 1 })
productSchema.index({ category: 1, type: 1, price: 1 })
productSchema.index({ category: 1, type: 1, createdAt: -1 })
productSchema.index({ title: "text" })

productSchema.virtual("totalStock").get(function () { // Calculate total stock
    if (!this.sizes || !Array.isArray(this.sizes)) return 0
    return this.sizes.reduce((sum, size) => {
        return sum + (size.stock || 0)
    }, 0)
})

productSchema.virtual("availability").get(function () { // Check stock availability
    const totalStock = this.totalStock

    if (totalStock <= 0) return "out"
    if (totalStock <= this.lowStockThreshold) return "low"
    if (totalStock <= this.lowStockThreshold * 3) return "medium"
    return "available"
})

productSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret) {
        delete ret.lowStockThreshold
        delete ret.__v
        delete ret.updatedAt
        return ret
    }
})

productSchema.plugin(mongooseLeanVirtuals) // Use lean virtuals

export const Product = mongoose.model("Product", productSchema)
export default Product