import { errorLog } from "./logger.js"
import AdminLog from "../models/adminLogModel.js"
import { getErrorMessage } from "./errorUtils.js"

const logAdminAction = async (adminId: string | null, action: string, targetId: unknown | null = null, meta: Record<string, unknown> = {}) => {
    try {
        await AdminLog.create({
            adminId,
            action,
            targetId: targetId == null ? null : String(targetId),
            meta
        })
    } catch (error) {
        errorLog("Error in logAdminAction:", getErrorMessage(error))
    }
}

export default logAdminAction
