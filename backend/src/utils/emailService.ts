import { transporter } from "./emailTransporter.js";
import logAdminAction from "./adminLogger.js";
import { errorLog } from "./logger.js";
import { SendEmailParams } from "./types.js";
import { getErrorMessage } from "./errorUtils.js";

// Function to send an email
export const sendEmail = async ({ to, subject, html, text, attachments = [], meta = {} }: SendEmailParams) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text,
            attachments
        })
    } catch (error) {
        logAdminAction(null, "email_failed", null, {
            to,
            subject,
            error: getErrorMessage(error),
            ...meta
        })

        errorLog("Email failed:", getErrorMessage(error))
        throw new Error(`Failed to send email to ${to}: ${getErrorMessage(error)}`)
    }
}
