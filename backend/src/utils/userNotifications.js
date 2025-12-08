import { notifyAdminOnFailedUserEmail } from "./adminNotifications.js"
import { sendEmail } from "./emailService.js"
import { errorLog } from "./log.js"

export const USER_EMAIL_TYPES = {
    ACCOUNT_CREATED: "account_created",
    ACCOUNT_PASSWORD_CHANGED: "account_password_changed",
    ACCOUNT_EMAIL_CHANGED: "account_email_changed",
    ACCOUNT_DELETED: "account_deleted",
    ORDER_CONFIRMED: "order_confirmed"
}
const sendUserEmail = async ({ to, subject, html, type, meta = {} }) => {
    try {
        await sendEmail({
            to,
            subject,
            html,
            meta: {
                type,
                ...meta
            }
        })
    } catch (error) {
        notifyAdminOnFailedUserEmail({
            to,
            type,
            meta,
            error
        }).catch(error => errorLog("Failed to notify admin on failed user email:", error.message))
    }
}

// Send account created email
export const sendAccountCreatedEmail = async (user) => {
    const to = user.email
    if (!to) return
    const subject = `Welcome to ${process.env.APP_NAME}`

    const html = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
            <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 22px; box-shadow: 0 4px 22px rgba(0,0,0,0.05); padding: 40px 35px; text-align: center;">

                <!-- Title -->
                <h2 style="font-family: 'Prata', serif; font-size: 28px; margin-bottom: 12px; color: #1a1a1a;">
                    Welcome to ${process.env.APP_NAME}!
                </h2>

                <!-- Subtitle -->
                <p style="font-size: 15px; color: #555; margin-bottom: 28px; line-height: 1.6;">
                    Hi ${user.name || ""},<br/>
                    We're excited to have you here. Your account has been created successfully and you can now start exploring everything we offer.
                </p>

                <!-- Decorative Line -->
                <div style="width: 60px; height: 3px; background-color: #c1a875; margin: 0 auto 25px auto; border-radius: 6px;"></div>

                <!-- Info Box -->
                <div style="background-color: #faf8f6; border: 1px solid #c1a875; border-radius: 14px; padding: 20px; margin: 0 auto 25px auto; max-width: 360px; text-align: left;">
                    <p style="margin: 0 0 10px 0; font-size: 15px; color: #1a1a1a;">
                        <strong style="color: #c1a875;">Email:</strong> ${user.email}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #444;">
                        <strong style="color: #c1a875;">Member Since:</strong> ${new Date().toLocaleDateString()}
                    </p>
                </div>

                <!-- Call To Action -->
                <p style="font-size: 15px; color: #444; margin-bottom: 20px;">
                    You can now sign in and manage your orders, wishlist and profile settings.
                </p>

                <a href="${process.env.FRONTEND_URL || "#"}" style="display: inline-block; background-color: #c1a875; color: #fff; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none; margin-bottom: 25px;">
                    Go to My Account
                </a>

                <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />

                <!-- Footer text -->
                <p style="font-size: 12px; color: #aaa; line-height: 1.5;">
                    If you did not create this account, please contact us as soon as possible.<br/>
                    This is an automated message from <span style="color: #c1a875;">${process.env.APP_NAME}</span>.
                </p>
            </div>

            <!-- Gmail fix -->
            <style>
                a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
            </style>
        </div>
        `

    await sendUserEmail({
        to,
        subject,
        html,
        type: USER_EMAIL_TYPES.ACCOUNT_CREATED,
        meta: {
            userId: String(user.id)
        }
    })
}

// Send account password changed email
export const sendAccountPasswordChangedEmail = async user => {
    const to = user.email
    if (!to) return
    const subject = `Your password has been changed`

    const html = `
    <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
        <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 22px; box-shadow: 0 4px 22px rgba(0,0,0,0.05); padding: 40px 35px; text-align: center;">

            <!-- Title -->
            <h2 style="font-family: 'Prata', serif; font-size: 26px; margin-bottom: 10px; color: #1a1a1a;">
                Your password was updated
            </h2>

            <!-- Subtitle -->
            <p style="font-size: 15px; color: #555; margin-bottom: 24px; line-height: 1.6;">
                Hi ${user.name || ""},<br/>
                This is a confirmation that your password for <strong style="color: #c1a875;">${process.env.APP_NAME}</strong> has just been changed.
            </p>

            <!-- Info Box -->
            <div style="background-color: #faf8f6; border: 1px solid #c1a875; border-radius: 14px; padding: 18px; margin: 0 auto 24px auto; max-width: 360px; text-align: left;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #1a1a1a;">
                    <strong style="color: #c1a875;">Account:</strong> ${user.email}
                </p>
                <p style="margin: 0; font-size: 14px; color: #444;">
                    <strong style="color: #c1a875;">Time:</strong> ${new Date().toLocaleString()}
                </p>
            </div>

            <!-- Security message -->
            <p style="font-size: 14px; color: #444; margin-bottom: 18px; line-height: 1.6;">
                If you made this change, no further action is needed.
            </p>
            <p style="font-size: 14px; color: #c0392b; margin-bottom: 22px; line-height: 1.6;">
                If you <strong>did not</strong> change your password, please reset it immediately and contact our support.
            </p>

            <!-- Call to action -->
            <a href="${process.env.FRONTEND_URL || "#"}" style="display: inline-block; background-color: #c1a875; color: #fff; padding: 11px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin-bottom: 26px;">
                Go to my account
            </a>

            <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />

            <!-- Footer -->
            <p style="font-size: 12px; color: #aaa; line-height: 1.5;">
                This message was sent to <strong>${user.email}</strong> because a password update was detected on your account.<br/>
                This is an automated email from <span style="color: #c1a875;">${process.env.APP_NAME}</span>.
            </p>
        </div>

        <!-- Gmail fix -->
        <style>
            a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
        </style>
    </div>
    `

    await sendUserEmail({
        to,
        subject,
        html,
        type: USER_EMAIL_TYPES.ACCOUNT_PASSWORD_CHANGED,
        meta: {
            userId: String(user._id)
        }
    })
}

// Send account email changed email (only to the updated email)
export const sendAccountEmailChangedEmail = async user => {
    const to = user.email
    if (!to) return
    const subject = `Your email address has been updated`

    const html = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
            <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 22px; box-shadow: 0 4px 22px rgba(0,0,0,0.05); padding: 40px 35px; text-align: center;">

                <!-- Title -->
                <h2 style="font-family: 'Prata', serif; font-size: 26px; margin-bottom: 10px; color: #1a1a1a;">
                    Your email has been updated
                </h2>

                <!-- Subtitle -->
                <p style="font-size: 15px; color: #555; margin-bottom: 22px; line-height: 1.6;">
                    Hi ${user?.name || ""},<br/>
                    Your account email was successfully updated.
                </p>

                <!-- CTA -->
                <a href="${process.env.FRONTEND_URL || "#"}" style="display: inline-block; background-color: #c1a875; color: #fff; padding: 11px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin-bottom: 28px;">
                    Go to my account
                </a>

                <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />

                <!-- Footer -->
                <p style="font-size: 12px; color: #aaa; line-height: 1.5;">
                    This is an automated confirmation from
                    <span style="color: #c1a875;">${process.env.APP_NAME}</span>.
                </p>
            </div>

            <style>
                a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
            </style>
        </div>
        `

    await sendUserEmail({
        to,
        subject,
        html,
        type: USER_EMAIL_TYPES.ACCOUNT_EMAIL_CHANGED,
        meta: {
            userId: user?._id ? String(user._id) : undefined,
            newEmail: to
        }
    })
}

// Send account deleted email
export const sendAccountDeletedEmail = async user => {
    const to = user.email
    const subject = `Your account has been deleted`

    const html = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
            <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 22px; box-shadow: 0 4px 22px rgba(0,0,0,0.05); padding: 40px 35px; text-align: center;">

                <!-- Title -->
                <h2 style="font-family: 'Prata', serif; font-size: 26px; margin-bottom: 10px; color: #1a1a1a;">
                    Your account has been deleted
                </h2>

                <!-- Subtitle -->
                <p style="font-size: 15px; color: #555; margin-bottom: 22px; line-height: 1.6;">
                    Hi ${user.name || ""},<br/>
                    This email confirms that your account on <strong style="color: #c1a875;">${process.env.APP_NAME}</strong> has been deleted.
                </p>

                <!-- Optional note -->
                <p style="font-size: 14px; color: #444; margin-bottom: 26px; line-height: 1.6;">
                    Thank you for being with us. You are always welcome to come back and create a new account in the future.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />

                <!-- Footer -->
                <p style="font-size: 12px; color: #aaa; line-height: 1.5;">
                    This is an automated confirmation from
                    <span style="color: #c1a875;">${process.env.APP_NAME}</span>.
                </p>
            </div>

            <style>
                a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
            </style>
        </div>
    `

    await sendUserEmail({
        to,
        subject,
        html,
        type: USER_EMAIL_TYPES.ACCOUNT_DELETED,
        meta: {
            userId: String(user._id)
        }
    })
}

// Send order confirmation email
export const sendOrderConfirmationEmail = async ({ user, order }) => {
    const to = user?.email || order?.shippingAddress?.email || order?.userEmail
    if (!to) return
    const subject = `Thank you for your order – #${order._id}`

    const formatPrice = amount => {
        if (amount == null || Number.isNaN(+amount)) return "-"
        return `${(+amount).toFixed(2)} $`
    }

    const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : new Date().toLocaleString()

    const items = order.orderItems || []
    const itemsHtml = items
        .map(item => {
            const size = item.selectedSize || "N/A"
            const qty = item.selectedQuantity || 1
            const lineTotal = item.itemPricePerUnit != null ? item.itemPricePerUnit * qty : null

            return `
                <tr>
                    <td style="padding: 8px 0; font-size: 14px;">
                        ${item.itemTitle || "Product"}
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: center;">
                        ${size}
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: center;">
                        ${qty}
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right;">
                        ${formatPrice(lineTotal)}
                    </td>
                </tr>
            `
        })
        .join("")

    const subtotal = items.reduce(
        (sum, item) => sum + ((item.itemPricePerUnit || 0) * (item.selectedQuantity || 0)),
        0
    )

    const shippingAddress = order.shippingAddress

    const html = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
            <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 22px; box-shadow: 0 4px 22px rgba(0,0,0,0.05); padding: 40px 35px;">

                <!-- Title -->
                <h2 style="font-family: 'Prata', serif; font-size: 26px; margin: 0 0 10px; color: #1a1a1a;">
                    Thank you for your order
                </h2>

                <!-- Intro -->
                <p style="font-size: 15px; color: #555; margin: 0 0 18px; line-height: 1.6;">
                    Hi ${user?.name || shippingAddress?.name || ""},<br/>
                    Your order has been received and is now being processed.
                </p>

                <!-- Order meta -->
                <p style="font-size: 14px; color: #444; margin: 0 0 4px;">
                    <strong style="color: #c1a875;">Order ID:</strong> ${order._id}
                </p>
                <p style="font-size: 14px; color: #444; margin: 0 0 8px;">
                    <strong style="color: #c1a875;">Date:</strong> ${createdAt}
                </p>
                ${order.paymentMethod ? `
                <p style="font-size: 14px; color: #444; margin: 0 0 14px;">
                    <strong style="color: #c1a875;">Payment:</strong> ${order.paymentMethod}
                </p>` : `
                <p style="margin: 0 0 14px;"></p>
                `}

                <!-- Divider -->
                <div style="width: 60px; height: 3px; background-color: #c1a875; border-radius: 6px; margin: 0 0 18px 0;"></div>

                <!-- Items -->
                <h3 style="font-size: 15px; margin: 0 0 10px; color: #1a1a1a;">
                    Order summary
                </h3>

                <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
                    <thead>
                        <tr>
                            <th style="text-align: left; font-size: 13px; padding-bottom: 6px; color: #777;">Product</th>
                            <th style="text-align: center; font-size: 13px; padding-bottom: 6px; color: #777;">Size</th>
                            <th style="text-align: center; font-size: 13px; padding-bottom: 6px; color: #777;">Qty</th>
                            <th style="text-align: right; font-size: 13px; padding-bottom: 6px; color: #777;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Totals -->
                <div style="margin-top: 18px; border-top: 1px solid #eee; padding-top: 10px; font-size: 14px;">
                    <p style="margin: 2px 0;">
                        <strong style="color: #c1a875;">Subtotal:</strong>
                        <span style="float: right;">${formatPrice(subtotal)}</span>
                    </p>
                    <p style="margin: 8px 0 0; font-size: 15px;">
                        <strong style="color: #c1a875;">Total paid:</strong>
                        <span style="float: right;">${formatPrice(subtotal)}</span>
                    </p>
                </div>

                <!-- Shipping address (optional) -->
                ${shippingAddress ? `
                <div style="margin-top: 18px; font-size: 14px;">
                    <p style="margin: 0 0 4px; color: #1a1a1a;">
                        <strong style="color: #c1a875;">Shipping address:</strong>
                    </p>
                    <p style="margin: 0; color: #555; line-height: 1.5;">
                        ${shippingAddress.name || ""}<br/>
                        ${shippingAddress.street || ""}<br/>
                        ${shippingAddress.city || ""}${shippingAddress.zip ? ", " + shippingAddress.zip : ""}<br/>
                        ${shippingAddress.country || ""}${shippingAddress.phone ? "<br/>" + shippingAddress.phone : ""}
                    </p>
                </div>
                ` : ""}

                <!-- Button -->
                <div style="text-align: center; margin-top: 24px;">
                    <a href="${process.env.FRONTEND_URL ? process.env.FRONTEND_URL + "/orders/" + order._id : "#"}"
                    style="display: inline-block; background-color: #c1a875; color: #ffffff; padding: 11px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
                        View order
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0 16px 0;" />

                <!-- Footer -->
                <p style="font-size: 12px; color: #aaa; line-height: 1.5; margin: 0;">
                    This is an automated confirmation from
                    <span style="color: #c1a875;">${process.env.APP_NAME}</span>.<br/>
                    You can keep this email as a record of your purchase.
                </p>
            </div>

            <!-- Gmail fix -->
            <style>
                a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
            </style>
        </div>
    `

    await sendUserEmail({
        to,
        subject,
        html,
        type: USER_EMAIL_TYPES.ORDER_CONFIRMED,
        meta: {
            userId: user?._id ? String(user._id) : String(order.userId || ""),
            orderId: String(order._id),
            total: subtotal
        }
    })
}