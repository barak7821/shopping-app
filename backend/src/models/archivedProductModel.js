import mongoose from "mongoose";

const archivedProductSchema = new mongoose.Schema(
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
        sizes: [String],
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
        stock: {
            type: Number,
            default: 0
        },
        lowStockThreshold: {
            type: Number,
            min: 0,
            default: 3
        }
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

archivedProductSchema.index({ category: 1 })
archivedProductSchema.index({ type: 1 })
archivedProductSchema.index({ price: 1 })
archivedProductSchema.index({ createdAt: -1 })
archivedProductSchema.index({ sizes: 1 })
archivedProductSchema.index({ category: 1, type: 1, price: 1 })
archivedProductSchema.index({ category: 1, type: 1, createdAt: -1 })
archivedProductSchema.index({ title: "text" })

export const ArchivedProduct = mongoose.model("ArchivedProduct", archivedProductSchema)
export default ArchivedProduct