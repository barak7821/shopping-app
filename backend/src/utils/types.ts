import type { Attachment } from "nodemailer/lib/mailer";
import type { Request, Response } from "express";

export type AdminNotificationProduct = {
    availability?: string
    title: string
    _id: unknown
    totalStock?: number
}

export type FailedUserEmailNotification = {
    to: string
    type: string
    meta?: { orderNumber?: string; userId?: string;[key: string]: unknown }
    error?: unknown
}

export type SendEmailParams = {
    to: string | string[]
    subject: string
    html?: string
    text?: string
    attachments?: Attachment[]
    meta?: Record<string, unknown>
}

export type ReceiptOrderItem = {
    selectedQuantity: number | string
    itemPricePerUnit: number | string
    itemTitle?: string | null
    selectedSize?: string | null
}

export type ReceiptShippingAddress = {
    street?: string | null
    city?: string | null
    zip?: string | null
    country?: string | null
    name?: string | null
    email?: string | null
    phone?: string | null
}

export type ReceiptOrder = {
    orderNumber: string | number
    createdAt: string | number | Date
    shippingAddress?: ReceiptShippingAddress
    userName?: string | null
    userEmail?: string | null
    orderItems?: ReceiptOrderItem[]
}

export type NotificationUser = {
    email?: string | null
    name?: string | null
    id?: unknown
    _id?: unknown
}

export type OrderNotificationItem = {
    selectedSize?: string | null
    selectedQuantity?: number | null
    itemPricePerUnit?: number | null
    itemTitle?: string | null
}

export type OrderNotificationShippingAddress = {
    name?: string | null
    street?: string | null
    city?: string | null
    zip?: string | null
    country?: string | null
    phone?: string | null
    email?: string | null
}

export type OrderNotificationOrder = {
    orderNumber: string | number
    createdAt?: string | number | Date
    orderItems?: OrderNotificationItem[]
    shippingAddress?: OrderNotificationShippingAddress | null
    userName?: string | null
    userEmail?: string | null
    userId?: unknown
}

export type OrderItemInput = {
    itemId: string
    selectedSize?: string | null
    selectedQuantity: number
}

export const USER_EMAIL_TYPES = {
    ACCOUNT_CREATED: "account_created",
    ACCOUNT_PASSWORD_CHANGED: "account_password_changed",
    ACCOUNT_EMAIL_CHANGED: "account_email_changed",
    ACCOUNT_DELETED: "account_deleted",
    ORDER_CONFIRMED: "order_confirmed"
} as const

export type UserEmailType = (typeof USER_EMAIL_TYPES)[keyof typeof USER_EMAIL_TYPES]

export type SendUserEmailParams = {
    to: string
    subject: string
    html: string
    attachments?: Attachment[]
    type: UserEmailType
    meta?: Record<string, unknown>
}

export type AuthUser = {
    id: string
    role?: string
    provider?: string
    aud?: string
    mfa?: boolean
}

export type AuthRequest = Request & {
    user?: AuthUser
    header(name: string): string | undefined
}

export type AuthenticatedRequest = Request & {
    user: AuthUser
    header(name: string): string | undefined
}


export type AdminAuthRequest = AuthRequest & { user: AuthUser }

export type AdminHandler = (req: AdminAuthRequest, res: Response) => Promise<Response | void>

export type UpdateProductFields = {
    title?: string
    category?: string
    price?: number
    image?: string
    description?: string
    sizes?: Array<{ stock?: number } & Record<string, unknown>>
    active?: boolean
    type?: string
    onSale?: boolean
    discountPercent?: number
}

export type HomeHandler = (req: Request, res: Response) => Promise<Response | void>

export type AuthHandler = (req: AuthRequest, res: Response) => Promise<Response | void>

export type UserIdLike = string | number | { toString(): string }

export type OrderHandler = (req: AuthRequest, res: Response) => Promise<Response | void>

export type AuthenticatedOrderHandler = (req: AuthenticatedRequest, res: Response) => Promise<Response | void>

export type ProductHandler = (req: Request, res: Response) => Promise<Response | void>

export type UserHandler = (req: AuthenticatedRequest, res: Response) => Promise<Response | void>

export type UpdateUserFields = {
    name?: string
    email?: string
    phone?: string
    street?: string
    city?: string
    zip?: string
    country?: string
}