import axios from "axios"
import { log } from "./log"

const baseApiUrl = `${import.meta.env.VITE_BACKEND_URL}/api`
const token = localStorage.getItem("token")

// Function to fetch products from the server
export const fetchProducts = async () => {
    const { data } = await axios.get(`${baseApiUrl}/products`)
    log("Products:", data)
    return data
}

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

// Function to check if a user is admin
export const checkUserAdmin = async () => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.get(`${baseApiUrl}/admin/check`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Check user admin response:", data.isAdmin)
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

// Function to fetch orders by user ID
export const fetchOrdersById = async () => {
    if (!token) {
        log("No token found")
        return
    }
    const { data } = await axios.get(`${baseApiUrl}/order`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    log("Orders by user ID response:", data)
    return data
}

// Function to find products by search input - limited to 10 results
export const findProductsLimited = async (search) => {
    if (!search || search.trim() === "") {
        log("Search input is required")
        return
    }
    const { data } = await axios.post(`${baseApiUrl}/products/search`, { search })
    log("Search results:", data)
    return data
}

// Function to find products by search query
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