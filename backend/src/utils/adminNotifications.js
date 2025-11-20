import { sendEmail } from "./emailService.js"

const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_USER

const canNotify = () => Boolean(ADMIN_ALERT_EMAIL)

const formatAvailability = availability => {
    if (availability === "available") return "Available"
    if (availability === "medium") return "Medium stock"
    if (availability === "low") return "Low stock"
    if (availability === "out") return "Out of stock"
    return availability
}

export const notifyAdminOnCurrentStockStatus = async product => {
    if (!canNotify()) return

    const availability = product.availability
    if (!availability || availability === "available") return

    const subject = `Stock status: ${product.title} – ${formatAvailability(availability)}`

    const html = `<div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
            <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 40px 30px; text-align: center;">

                <!-- Title -->
                <h2 style="font-family: 'Prata', serif; font-size: 26px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px;">
                Current Stock Status
                </h2>

                <!-- Subtitle -->
                <p style="font-size: 15px; color: #555; margin-bottom: 25px; line-height: 1.6; mso-line-height-rule: exactly;">
                Here is the updated stock information for the following product:
                </p>

                <!-- Product Card -->
                <div style="background-color: #faf8f6; border: 1px solid #c1a875; border-radius: 12px; padding: 20px; text-align: left; margin: 20px auto; max-width: 380px;">
                <p style="margin: 0; font-size: 16px; color: #1a1a1a;">
                    <strong style="color: #c1a875;">Product:</strong> ${product.title}
                </p>
                <p style="margin: 8px 0 0; font-size: 15px; color: #444;">
                    <strong style="color: #c1a875;">ID:</strong> ${product._id}
                </p>
                <p style="margin: 8px 0 0; font-size: 15px; color: #444;">
                    <strong style="color: #c1a875;">Status:</strong> ${formatAvailability(availability)}
                </p>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

                <!-- Footer -->
                <p style="font-size: 12px; color: #aaa; line-height: 1.4;">
                This is an automated message from the
                <span style="color: #c1a875; font-weight: 600;">${process.env.APP_NAME}</span> system.<br/>
                No action is required.
                </p>
            </div>

        <!-- Force link color reset for Gmail -->
        <style>
            a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
        </style>
    </div>`

    await sendEmail({
        to: ADMIN_ALERT_EMAIL,
        subject,
        html,
        meta: {
            type: "admin_stock_alert",
            productId: String(product._id),
            availability,
            totalStock: product.totalStock
        }
    })
}
