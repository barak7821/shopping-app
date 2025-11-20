import { transporter } from "./emailTransporter.js";
import logAdminAction from "./adminLogger.js";
import { errorLog } from "./log.js";

// Function to send an email
export const sendEmail = async ({ to, subject, html, text, meta = {} }) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text
        })
    } catch (error) {
        logAdminAction(null, "email_failed", null, {
            to,
            subject,
            error: error.message,
            ...meta
        })

        errorLog("Email failed:", error.message)
        throw new Error(`Failed to send email to ${to}: ${error.message}`)
    }
}