"use client"
import { createContext, useContext, useEffect, useState } from "react";
import type { CartContextType } from "../types/types"


const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState(() => {
        try {
            const localCart = localStorage.getItem("cart")
            return localCart ? JSON.parse(localCart) : []
        } catch (error) {
            return []
        }
    })
    const [address, setAddress] = useState(() => {
        try {
            const localAddress = localStorage.getItem("address")
            return localAddress ? JSON.parse(localAddress) : {}
        } catch (error) {
            return {}
        }
    })

    // get cart from local storage and set it to cart
    useEffect(() => {
        const localCart = localStorage.getItem("cart")
        if (localCart) {
            setCart(JSON.parse(localCart))
        }
    }, [])

    // function to add an item to the cart
    const addToCart = (productId: string, size: string) => { // prevCart: { id: string; size: string; quantity: number }[]
        setCart((prevCart: any[]) => {
            const existingIndex = prevCart.findIndex(item => item.id === productId && item.size === size) // check if the item already exists in the cart

            if (existingIndex !== -1) { // if the item already exists
                const updated = [...prevCart] // create a copy of the cart
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1 // increment the quantity
                }
                localStorage.setItem("cart", JSON.stringify(updated)) // update the cart in local storage
                return updated
            }
            const newCart = [ // if the item doesn't exist
                ...prevCart,
                { id: productId, size, quantity: 1 }
            ]
            localStorage.setItem("cart", JSON.stringify(newCart)) // update the cart in local storage
            return newCart
        })
    }

    // function to remove/decrement an item from the cart
    const removeFromCart = (productId: string, size: string) => { // prevCart: { id: string; size: string; quantity: number }[]
        setCart((prevCart: any[]) => {
            const existingIndex = prevCart.findIndex(item => item.id === productId && item.size === size) // check if the item already exists in the cart

            if (existingIndex === -1) { // if the item doesn't exist
                return prevCart
            }

            const updated = [...prevCart] // create a copy of the cart
            const currentQuantity = updated[existingIndex].quantity // get the current quantity

            if (currentQuantity > 1) { // if the quantity is greater than 1
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: currentQuantity - 1 // decrement the quantity
                }
            } else {
                updated.splice(existingIndex, 1) // remove the item
            }
            localStorage.setItem("cart", JSON.stringify(updated)) // update the cart in local storage
            return updated
        })
    }

    // function to remove completely
    const clearItem = (productId: string, size: string) => { // prevCart: { id: string; size: string; quantity: number }[]
        setCart((prevCart: any[]) => {
            const updated = prevCart.filter(
                item => !(item.id === productId && item.size === size)
            )
            localStorage.setItem("cart", JSON.stringify(updated))
            return updated
        })
    }

    // update local storage whenever address changes
    useEffect(() => {
        localStorage.setItem("address", JSON.stringify(address))
    }, [address])

    return (
        <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, address, setAddress, clearItem } as CartContextType}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
