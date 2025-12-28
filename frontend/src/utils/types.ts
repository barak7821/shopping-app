export type ContactInfo = {
    address?: string
    openingHours?: string
    email?: string
    phone?: string
    instagramUrl?: string
    facebookUrl?: string
    twitterUrl?: string
}

export interface Product {
    _id: string
    title: string
    image: string
    price: number
    discountPercent: number
    onSale: boolean
    sizes?: Array<string | { code?: string }>
    description?: string
    availability?: string
}

export type FullCartItem = {
    _id: string
    id: string
    title: string
    image: string
    price: number
    discountPercent: number
    onSale: boolean
    size: string
    quantity: number
    selectedSize?: string | null
    selectedQuantity?: number
}

// Collection page query parameters
export type Query = {
    page: number
    category?: string
    type?: string
    sizes?: string
    sort?: string
}

export type HeroSection = {
    title: string
    subtitle: string
    description: string
    buttonText: string
    imageUrl: string
    imageAlt: string
}

export type OrderItem = {
    itemId: string
    itemTitle: string
    itemPricePerUnit: number
    selectedQuantity: number
    selectedSize?: string | null
    size?: string | null
}

export type Order = {
    _id: string
    orderNumber: string
    createdAt: string
    status: string
    paymentMethod: string
    shippingAddress: {
        name: string
        email: string
        phone: string
        street: string
        city: string
        zip: string
        country: string
    }
    orderItems: OrderItem[]
}

export type PaymentDetails = {
    amount: number
    currency: string
    email: string
    number?: string
    expirationDate?: string
    cvv?: string
    holderName?: string
}

export type UserProfile = {
    name?: string
    email?: string
    phone?: string
    street?: string
    city?: string
    zip?: string
    country?: string
}
