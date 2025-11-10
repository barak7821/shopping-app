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

// Function to delete a product by ID
export const deleteProductById = async (productId: number) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.delete(`${baseApiUrl}/admin`, {
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
    const { data } = await axios.post(`${baseApiUrl}/admin`, product,
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
    const { data } = await axios.patch(`${baseApiUrl}/admin`, product, {
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
    const { data } = await axios.delete(`${baseApiUrl}/admin/users`, {
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
export const fetchUsersByQuery = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/users`, {
        params: { ...query }, signal,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get users by query response:", data)
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
export const fetchDeletedUsers = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/deletedUsers`, {
        params: { ...query }, signal,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get deleted users response:", data)
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
export const fetchOrdersByQuery = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/orders`, {
        params: { ...query }, signal,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get orders response:", data)
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
    const { data } = await axios.post(`${baseApiUrl}/admin/getByIds`, { ids: productIds }, {
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

// Function to find products by search input
export const findProductsSearch = async (search: string) => {
    if (!search || search.trim() === "") {
        log("Search input is required")
        return
    }
    const { data } = await axios.post(`${baseApiUrl}/products/search`, { search })
    log("Search results:", data)
    return data
}

// Function to get contact info section
export const fetchContactInfo = async () => {
    const { data } = await axios.get(`${baseApiUrl}/home/contactInfo`)

    log("Get contact info response:", data)
    return data
}

// Function to update contact info section
export const updateContactInfo = async (contactInfoSection: any) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/contactInfo`, { contactInfoSection }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Update contact info response:", data)
    return data
}

// Controller to add note to user
export const addNoteToUser = async (userId: string, note: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const { data } = await axios.patch(`${baseApiUrl}/admin/users`, { id: userId, note }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Add note to user response:", data)
    return data
}

// Function to fetch products by query - pagination
export const fetchProductsByQuery = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }

    const { data } = await axios.get(`${baseApiUrl}/admin`, {
        params: { ...query }, signal,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    log("Get products by query response:", data)
    return data
}