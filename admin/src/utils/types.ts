export interface Product {
  _id: number
  image: string
  title: string
  price: number
  category: string
  discountPercent: number
  onSale: boolean
  stock: number
}

export interface ContactInfo {
  email: string
  address: string
  phone: string
  facebookUrl: string
  instagramUrl: string
  twitterUrl: string
  openingHours: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: string
  lastLogin: string
  updatedAt: string
  deletedAt: string
  createdAt: string
  note: string
  provider: string
  city: string
  country: string
  zip: string
  phone: string
  street: string
}

export type Category = "men" | "women" | "kids"

export interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  imageAlt: string;
}

export interface Order {
  userId: string
  _id: string
  userEmail: string
  orderItems: {
    _id: string
    itemId: string
    selectedSize: string
    selectedQuantity: number
    itemPricePerUnit: number
  }[]
  paymentMethod: string
  shippingAddress: { name: string, email: string, phone: string, street: string, city: string, zip: string, country: string }
  status: string
  createdAt: string
  updatedAt: string
}

export type SizeOptions = Record<Exclude<Category, "">, string[]>

export const sizeOptions: SizeOptions = {
  men: ["XS", "S", "M", "L", "XL", "XXL"],
  women: ["XS", "S", "M", "L", "XL"],
  kids: ["4", "6", "8", "10"],
}

export interface ProductFormData {
  title: string
  category: Category | ""
  price: string
  image: string
  description: string
  sizes: string[]
  type: string
  discountPercent: string
  onSale: boolean
  stock: string
}