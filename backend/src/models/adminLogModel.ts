import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        targetId: {
            type: String,
        },
        meta: {
            type: Object,
            default: {}
        }
    },
    { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' fields
)

export const AdminLog = mongoose.model("AdminLog", adminLogSchema)
export default AdminLog