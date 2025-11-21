import mongoose from "mongoose"

const adminSettingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: "notification_emails" // Fixed ID for the admin settings
    },
    notificationEmails: {
        type: [String],
        default: []
    }
})

const AdminSettings = mongoose.model("AdminSettings", adminSettingsSchema)
export default AdminSettings