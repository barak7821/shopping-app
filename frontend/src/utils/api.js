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
    log("Check user auth response:", data.exist)
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
