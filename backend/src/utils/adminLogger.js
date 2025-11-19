import { errorLog } from "./log.js"
import AdminLog from "../models/adminLogModel.js"

const logAdminAction = async (adminId, action, targetId = null, meta = {}) => {
    try {
        await AdminLog.create({
            adminId,
            action,
            targetId,
            meta
        })
    } catch (error) {
        errorLog("Error in logAdminAction:", error.message)
    }
}

export default logAdminAction