import axios from "axios";
import { log } from "./log"

const baseApiUrl = `${import.meta.env.VITE_BACKEND_URL}/api`

// Function to check if a user is authenticated - logged in or guest
export const checkUserAuth = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.get(`${baseApiUrl}/auth`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Check user auth response:", data)
    return data
}

// Function to fetch products from the server
export const fetchProducts = async () => {
    const { data } = await axios.get(`${baseApiUrl}/products`)
    log("Products:", data)
    return data
}

// Function to delete a product by ID
export const deleteProductById = async (productId: number) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.delete(`${baseApiUrl}/admin/deleteById`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            id: productId
        }
    })
    log(`Delete product by ID (${productId}) response:`, data)
    return data
}

// Function to add a new product
export const addProduct = async (product: any) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.post(`${baseApiUrl}/admin/`, product,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    log("Add product response:", data)
    return data
}

// Function to get product by id
export const getProductById = async (productId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }

    const { data } = await axios.get(`${baseApiUrl}/admin/getById?id=${productId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get product by id response:", data)
    return data
}

// Function to update a product by id
export const updateProductById = async (product: any) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }

    const { data } = await axios.patch(`${baseApiUrl}/admin/updateById`, product, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Update product by id response:", data)
    return data
}