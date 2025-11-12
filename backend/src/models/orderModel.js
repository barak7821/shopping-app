import mongoose from "mongoose";
import Joi from "joi";

export const orderUserSchemaJoi = Joi.object(
    {
        userId: Joi.string().required(),
        orderItems: Joi.array().items(
            Joi.object({
                itemId: Joi.string().required(),
                itemTitle: Joi.string().required(),
                itemPricePerUnit: Joi.number().required(),
                selectedQuantity: Joi.number().required(),
                selectedSize: Joi.string().required()
            })
        ).required(),
        shippingAddress: Joi.object({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(/^[0-9]+$/).required(),
            street: Joi.string().required(),
            city: Joi.string().required(),
            zip: Joi.string().required(),
            country: Joi.string().required()
        }).required(),
        paymentMethod: Joi.string().required()
    }
)
export const orderGuestSchemaJoi = Joi.object(
    {
        userId: Joi.string().valid("guest").default("guest"),
        orderItems: Joi.array().items(
            Joi.object({
                itemId: Joi.string().required(),
                itemTitle: Joi.string().required(),
                itemPricePerUnit: Joi.number().required(),
                selectedQuantity: Joi.number().required(),
                selectedSize: Joi.string().required()
            })
        ).required(),
        shippingAddress: Joi.object({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().min(10).max(10).pattern(/^[0-9]+$/).required(),
            street: Joi.string().required(),
            city: Joi.string().required(),
            zip: Joi.string().required(),
            country: Joi.string().required()
        }).required(),
        paymentMethod: Joi.string().required()
    }
)

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.Mixed,
            ref: "User"
        },
        userEmail: {
            type: String,
            lowercase: true, // Converts email to lowercase before saving
            trim: true // Removes space from both ends of the email
        },
        userName: String,
        orderItems: [
            {
                itemId: String,
                itemTitle: String,
                itemPricePerUnit: Number,
                selectedQuantity: Number,
                selectedSize: String
            }
        ],
        shippingAddress: {
            name: String,
            email: {
                type: String,
                lowercase: true, // Converts email to lowercase before saving
                trim: true // Removes space from both ends of the email
            },
            phone: String,
            street: String,
            city: String,
            zip: String,
            country: String,

        },
        paymentMethod: String,
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        deliveredAt: Date
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const Order = mongoose.model("Order", orderSchema)
export default Order