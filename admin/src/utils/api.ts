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
    const token = localStorage.getItem("token")
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.get(`${baseApiUrl}/products`)
    log("Products response:", data)
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

// Function to delete user by ID
export const deleteUserById = async (userId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.delete(`${baseApiUrl}/admin/deleteUserById`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            id: userId
        }
    })

    log("Delete user by id response:", data)
    return data
}

// Function to fetch users from the server
export const fetchUsers = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/users`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Users:", data)
    return data
}

// Function to get user by id
export const getUserById = async (userId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/getUserById?id=${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get user by id response:", data)
    return data
}

// Function to fetch deleted users from the server
export const fetchDeletedUsers = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/deletedUsers`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Users:", data)
    return data
}

// Function to get deleted user by id
export const getDeletedUserById = async (userId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/getDeletedUserById?id=${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get user by id response:", data)
    return data
}

// Function to make admin
export const makeAdmin = async (userId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/makeAdmin`, { id: userId }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Make admin response:", data)
    return data
}

// Function to remove admin
export const removeAdmin = async (userId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/removeAdmin`, { id: userId }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Remove admin response:", data)
    return data
}

// Function to fetch orders from the server
export const fetchOrders = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/orders`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Orders:", data)
    return data
}

// Function to get order by id
export const getOrderById = async (orderId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/getOrderById?id=${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get order by id response:", data)
    return data
}

// Function to gets multiple products by their IDs
export const getProductsByIds = async (productIds: string[]) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.post(`${baseApiUrl}/admin/getProductsByIds`, { ids: productIds }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get products by ids response:", data)
    return data
}

// Function to updates order's status by id
export const updateOrderStatusById = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/updateOrderStatus`, { id: orderId, newStatus }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Update order status by id response:", data)
    return data
}

// Function to get hero section
export const fetchHeroSection = async () => {
    const { data } = await axios.get(`${baseApiUrl}/home`)

    log("Get hero section response:", data)
    return data
}

// Function to update hero section
export const updateHeroSection = async (heroSection: any) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/hero`, { heroSection }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Update hero section response:", data)
    return data
}

// Function to update best seller section
export const updateBestSellerSection = async (bestSellerSection: any) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/bestSeller`, { bestSellerSection }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Update best seller section response:", data)
    return data
}

// Function to find products by search input - limited to 10 results
export const findProductsLimited = async (search: string) => {
    if (!search || search.trim() === "") {
        log("Search input is required")
        return
    }
    const { data } = await axios.post(`${baseApiUrl}/products/search`, { search })
    log("Search results:", data)
    return data
}