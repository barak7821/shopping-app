import axios from "axios";
import { log } from "./log"

// Base API URL
const baseApiUrl = `${import.meta.env.VITE_BACKEND_URL}/api`

// Function to get auth headers - except checkUserAuth function cause it's passive
const authHeaders = () => {
    const token = localStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    return {
        Authorization: `Bearer ${token}`
    }
}

// Function to check if a user is authenticated - logged in or guest
// This is passive authentication before access the admin panel - case of no token isn't error but redirect to home
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

// Function to archive a product by ID
export const archiveProductById = async (productId: string) => {
    const { data } = await axios.post(`${baseApiUrl}/admin/productArchive`, {
        id: productId
    }, { headers: authHeaders() })

    log("Archive product by id response:", data)
    return data
}

// Function to add a new product
export const addProduct = async (product: any) => {
    const { data } = await axios.post(`${baseApiUrl}/admin`, product, { headers: authHeaders() })
    log("Add product response:", data)
    return data
}

// Function to get product by id
export const getProductById = async (productId: string) => {
    const { data } = await axios.get(`${baseApiUrl}/admin/getById?id=${productId}`, { headers: authHeaders() })

    log("Get product by id response:", data)
    return data
}

// Function to update a product by id
export const updateProductById = async (product: any) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin`, product, { headers: authHeaders() })

    log("Update product by id response:", data)
    return data
}

// Function to delete user by ID
export const deleteUserById = async (userId: string) => {
    const { data } = await axios.delete(`${baseApiUrl}/admin/users`, {
        headers: authHeaders(),
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
    const { data } = await axios.get(`${baseApiUrl}/admin/users`, {
        params: { ...query }, signal,
        headers: authHeaders()
    })

    log("Get users by query response:", data)
    return data
}

// Function to get user by id
export const getUserById = async (userId: string) => {
    const { data } = await axios.get(`${baseApiUrl}/admin/getUserById?id=${userId}`, { headers: authHeaders() })

    log("Get user by id response:", data)
    return data
}

// Function to fetch deleted users from the server
export const fetchDeletedUsers = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const { data } = await axios.get(`${baseApiUrl}/admin/deletedUsers`, {
        params: { ...query }, signal,
        headers: authHeaders()
    })

    log("Get deleted users response:", data)
    return data
}

// Function to get deleted user by id
export const getDeletedUserById = async (userId: string) => {
    const { data } = await axios.get(`${baseApiUrl}/admin/getDeletedUserById?id=${userId}`, { headers: authHeaders() })

    log("Get user by id response:", data)
    return data
}

// Function to make admin
export const makeAdmin = async (userId: string) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin/makeAdmin`, { id: userId }, { headers: authHeaders() })

    log("Make admin response:", data)
    return data
}

// Function to remove admin
export const removeAdmin = async (userId: string) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin/removeAdmin`, { id: userId }, { headers: authHeaders() })

    log("Remove admin response:", data)
    return data
}

// Function to fetch orders from the server
export const fetchOrdersByQuery = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const { data } = await axios.get(`${baseApiUrl}/admin/orders`, {
        params: { ...query }, signal,
        headers: authHeaders()
    })

    log("Get orders response:", data)
    return data
}

// Function to get order by order number
export const getOrderByOrderNumber = async (orderNumber: string) => {
    const { data } = await axios.get(`${baseApiUrl}/admin/getOrderByOrderNumber?number=${orderNumber}`, { headers: authHeaders() })

    log("Get order by order number response:", data)
    return data
}

// Function to gets multiple products by their IDs
export const getProductsByIds = async (productIds: string[]) => {
    const { data } = await axios.post(`${baseApiUrl}/admin/getByIds`, { ids: productIds }, { headers: authHeaders() })

    log("Get products by ids response:", data)
    return data
}

// Function to updates order's status by id
export const updateOrderStatusById = async (orderId: string, newStatus: string) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin/updateOrderStatus`, { id: orderId, newStatus }, { headers: authHeaders() })

    log("Update order status by id response:", data)
    return data
}

// Function to resend order receipt
export const resendOrderReceipt = async (orderId: string, email?: string) => {
    const { data } = await axios.post(`${baseApiUrl}/admin/resendReceipt`, { orderId, email }, { headers: authHeaders() })

    log("Resend order receipt response:", data)
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
    const { data } = await axios.patch(`${baseApiUrl}/admin/hero`, { heroSection }, { headers: authHeaders() })

    log("Update hero section response:", data)
    return data
}

// Function to update best seller section
export const updateBestSellerSection = async (bestSellerSection: any) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin/bestSeller`, { bestSellerSection }, { headers: authHeaders() })

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
    const { data } = await axios.patch(`${baseApiUrl}/admin/contactInfo`, { contactInfoSection }, { headers: authHeaders() })

    log("Update contact info response:", data)
    return data
}

// Controller to add note to user
export const addNoteToUser = async (userId: string, note: string) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin/users`, { id: userId, note }, { headers: authHeaders() })

    log("Add note to user response:", data)
    return data
}

// Function to fetch products by query - pagination
export const fetchProductsByQuery = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt

    const { data } = await axios.get(`${baseApiUrl}/admin`, {
        params: { ...query }, signal,
        headers: authHeaders()
    })

    log("Get products by query response:", data)
    return data
}

// Function to fetch archived products by query - pagination
export const fetchArchivedProducts = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const { data } = await axios.get(`${baseApiUrl}/admin/archived`, {
        params: { ...query }, signal,
        headers: authHeaders()
    })

    log("Get archived products response:", data)
    return data
}

// Function to restore product
export const restoreArchivedProduct = async (productId: string) => {
    const { data } = await axios.post(`${baseApiUrl}/admin/archived`, {
        id: productId
    }, { headers: authHeaders() })

    log("Restore product response:", data)
    return data

}

// Function to get archived product by id
export const getArchivedProductById = async (productId: string) => {
    const { data } = await axios.get(`${baseApiUrl}/admin/archivedById?id=${productId}`, { headers: authHeaders() })

    log("Get product by id response:", data)
    return data
}

// Function to fetch activity logs with pagination
export const fetchAdminLogsByQuery = async (query: any, opt: { signal?: AbortSignal } = {}) => {
    const { signal } = opt
    const { data } = await axios.get(`${baseApiUrl}/admin/logs`, {
        params: { ...query }, signal,
        headers: authHeaders()
    })

    log("Get admin logs response:", data)
    return data
}

// Function to get notification emails list
export const getNotificationEmails = async () => {
    const { data } = await axios.get(`${baseApiUrl}/admin/notifications`, { headers: authHeaders() })

    log("Get notification emails response:", data)
    return data
}

// Function to update notification emails list
export const updateNotificationEmails = async (emails: string[]) => {
    const { data } = await axios.patch(`${baseApiUrl}/admin/notifications`, { emails }, { headers: authHeaders() })

    log("Update notification emails response:", data)
    return data
}
