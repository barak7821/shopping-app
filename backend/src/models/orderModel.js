import mongoose from "mongoose";
import Joi from "joi";

export const orderUserSchemaJoi = Joi.object(
    {
        userId: Joi.string().required(),
        orderItems: Joi.array().items(
            Joi.object({
                id: Joi.string().required(),
                price: Joi.number().required(),
                quantity: Joi.number().required(),
                size: Joi.string().required()
            })
        ).required(),
        shippingAddress: Joi.object({
            name: Joi.string().required(),
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
export const orderGuestSchemaJoi = Joi.object(
    {
        userId: Joi.string().valid("guest").default("guest"),
        orderItems: Joi.array().items(
            Joi.object({
                id: Joi.string().required(),
                price: Joi.number().required(),
                quantity: Joi.number().required(),
                size: Joi.string().required()
            })
        ).required(),
        shippingAddress: Joi.object({
            name: Joi.string().required(),
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
        orderItems: [
            {
                id: String,
                price: Number,
                quantity: Number,
                size: String
            }
        ],
        shippingAddress: {
            name: {
                type: String,

            },
            email: {
                type: String,
                lowercase: true, // Converts email to lowercase before saving
                trim: true // Removes space from both ends of the email

            },
            phone: {
                type: String,

            },
            street: {
                type: String,

            },
            city: {
                type: String,

            },
            zip: {
                type: String,

            },
            country: {
                type: String,
            }
        },
        paymentMethod: String,
        isDelivered: {
            type: Boolean,
            default: false
        },
        deliveredAt: Date
    },
    { timestamps: true }  // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const Order = mongoose.model("Order", orderSchema)
export default Order