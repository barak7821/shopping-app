import axios from "axios"
import { log } from "./log"

const baseApiUrl = `${import.meta.env.VITE_BACKEND_URL}/api`
const token = localStorage.getItem("token")

// Function to send order details to the server - logged in user only
export const handleOrder = async (orderDetails) => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.post(`${baseApiUrl}/order`, { orderDetails }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Order response:", data)
    return data
}

// Function to send order details to the server - guest user only
export const handleGuestOrder = async (orderDetails) => {
    const { data } = await axios.post(`${baseApiUrl}/order/guest`, { orderDetails })
    log("Order response:", data)
    return data
}

// Function to login the user
export const handleLogin = async (email, password) => {
    const { data } = await axios.post(`${baseApiUrl}/auth/login`, { email, password })
    log("Login response:", data)
    return data
}

// Function to register a new user
export const handleRegister = async (userData) => {
    const { data } = await axios.post(`${baseApiUrl}/auth`, userData)
    log("Register response:", data)
    return data
}

// Function to check if a user is authenticated - logged in or guest
export const checkUserAuth = async () => {
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

// Function to fetch user data from the server
export const fetchUserData = async () => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.get(`${baseApiUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("User data:", data)
    return data
}

// Function to update user data in the server
export const handleUpdateUser = async (userData) => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.patch(`${baseApiUrl}/user`, userData, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Update user response:", data)
    return data
}

// Function to change password
export const handleChangePassword = async (userData) => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.patch(`${baseApiUrl}/user/password`, userData, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Change password response:", data)
    return data
}

// Function to verify password
export const verifyPassword = async (password) => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.post(`${baseApiUrl}/user/password`, { password }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Verify password response:", data)
    return data
}

// Function to fetch order by ID
export const fetchOrderById = async (id) => {
    if (!token) {
        log("No token found")
        return
    }

    if (!id) {
        log("Product id is required")
        return
    }

    const { data } = await axios.get(`${baseApiUrl}/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })

    log("Get order by id response:", data)
    return data
}

// Function to find products by search input
export const findProductsSearch = async (search) => {
    if (!search || search.trim() === "") {
        log("Search input is required")
        return
    }
    const { data } = await axios.post(`${baseApiUrl}/products/search`, { search })
    log("Search results:", data)
    return data
}

// Function to find products by search query - Search Results Page
export const findProductsQuery = async (query) => {
    if (!query || query.trim() === "") {
        log("Query is required")
        return
    }

    const { data } = await axios.get(`${baseApiUrl}/products/query`, { params: { search: query } })

    log("Search results:", data)
    return data
}

// Function to delete the user
export const handleDeleteUser = async () => {
    if (!token) {
        log("No token found")
        return
    }

    const { data } = await axios.delete(`${baseApiUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Delete user response:", data)
    return data
}

// Function to send Otp
export const handleSendOtp = async (email) => {
    const { data } = await axios.post(`${baseApiUrl}/auth/otp`, { email })
    log("Otp response:", data)
    return data
}

// Function to verify Otp
export const handleVerifyOtp = async (email, otp) => {
    const { data } = await axios.post(`${baseApiUrl}/auth/verifyOtp`, { email, otp })
    log("Verify otp response:", data)
    return data
}

// Function to reset password
export const handleResetPassword = async (email, otp, newPassword) => {
    const { data } = await axios.post(`${baseApiUrl}/auth/resetPassword`, { email, otp, newPassword })
    log("Reset password response:", data)
    return data
}

// Function to register/login with Google
export const handleGoogle = async (token) => {
    const { data } = await axios.post(`${baseApiUrl}/auth/google`, { token })
    log("Google response:", data)
    return data
}

// Function to get hero section
export const fetchHeroSection = async () => {
    const { data } = await axios.get(`${baseApiUrl}/home`)

    log("Get hero section response:", data)
    return data
}

// Function to get 10 latest products
export const fetchLatestProducts = async () => {
    const { data } = await axios.get(`${baseApiUrl}/products/latest`)

    log("Get latest products response:", data)
    return data
}

// Function to get best sellers
export const fetchBestSellers = async () => {
    const { data } = await axios.get(`${baseApiUrl}/home/bestSellers`)

    log("Get best sellers response:", data)
    return data
}

// Function to get contact info section
export const fetchContactInfo = async () => {
    const { data } = await axios.get(`${baseApiUrl}/home/contactInfo`)

    log("Get contact info response:", data)
    return data
}

// Function to gets multiple products by their IDs
export const fetchProductsByIds = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        log("Product ids are required")
        return
    }

    const { data } = await axios.post(`${baseApiUrl}/products/getProductsByIds`, { ids })

    log("Get products by ids response:", data)
    return data
}

// Function to fetch products by query - pagination
export const fetchProductsByQuery = async (query, opt = {}) => {
    const { signal } = opt
    const { data } = await axios.get(`${baseApiUrl}/products/`, { params: { ...query }, signal })

    log("Get products by query response:", data)
    return data
}

// Function to get product by ID - one product
export const fetchProductById = async (id) => {
    if (!id) {
        log("Product id is required")
        return
    }

    const { data } = await axios.get(`${baseApiUrl}/products/${id}`)

    log("Get product by id response:", data)
    return data
}

// Function to fetch order by query - pagination
export const fetchOrdersByQuery = async (query, opt = {}) => {
    const { signal } = opt
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.get(`${baseApiUrl}/order/`, {
        params: { ...query }, signal,
        headers: { Authorization: `Bearer ${token}` }
    })

    log("Get order by query response:", data)
    return data
}