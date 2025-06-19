import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar';
import { errorLog, log } from '../utils/log';
import { useCart } from '../utils/CartContext';
import { FiX } from "react-icons/fi"
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import Loading from '../components/Loading';
import { fetchProducts } from '../utils/api';

export default function Cart() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const { cart, removeFromCart, addToCart, clearItem } = useCart()
    const [fullCart, setFullCart] = useState([])
    const [productsList, setProductsList] = useState([])
    const [loading, setLoading] = useState(true)

    const getProducts = async () => {
        setLoading(true)
        try {
            const data = await fetchProducts()
            setProductsList(data)
        } catch (error) {
            errorLog("Error in getProducts", error)
            notyf.error("Something went wrong. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getProducts() // Get products from the server
    }, [])

    useEffect(() => {
        const items = cart.map(cartItem => { // get the product from the localStorage
            const product = productsList.find(item => item._id === cartItem.id)
            return product
                ? {
                    ...product,
                    id: product._id,
                    size: cartItem.size,
                    quantity: cartItem.quantity
                }
                : null
        }).filter(Boolean) // remove null values

        setFullCart(items)

        log(`items:${items}`)
        log(`fullCart:${fullCart}`)
    }, [cart, productsList])

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6]">
            <NavBar />

            <div className="flex-1 w-full max-w-4xl mx-auto py-16 px-4 md:px-12">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] mb-10 tracking-tight">
                    YOUR CART
                </h1>

                {/* Cart Items */}
                <div className="w-full flex flex-col gap-7">
                    {fullCart.length === 0 ? (
                        <div className="bg-white/80 rounded-2xl shadow-md py-12 flex flex-col items-center">
                            <p className="text-2xl text-[#80715a] font-semibold mb-3">Your cart is empty.</p>
                            <button onClick={() => nav("/")} className="px-8 py-3 border border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-white hover:text-black transition rounded-2xl shadow font-semibold text-lg active:scale-95 mt-6 cursor-pointer">
                                Shop Now
                            </button>
                        </div>
                    ) : (fullCart.map(item => (
                        <div key={`${item._id}-${item.size}`} className="flex items-center justify-between gap-8 bg-white/90 rounded-2xl shadow-md p-5">
                            {/* Image + Info */}
                            <div className="flex items-center gap-6">
                                <img src={item.image} alt={item.title} className="w-28 h-28 object-cover rounded-xl border border-[#f2e8db] shadow-sm" />
                                <div>
                                    <h3 className="text-xl font-semibold text-[#1a1a1a] mb-1">{item.title.replace(/\b\w/g, l => l.toUpperCase())}</h3>
                                    <p className="text-sm text-gray-500 mb-1">Size: <span className="font-bold">{item.size?.toUpperCase()}</span></p>
                                    <p className="text-lg font-bold text-[#1a1a1a]">${(+item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                            {/* Remove */}
                            <div className="flex items-center gap-4">
                                {/* Decrease quantity */}
                                <button onClick={() => removeFromCart(item.id, item.size)} className="px-3 py-1 bg-gray-200 rounded cursor-pointer" aria-label="Decrease quantity" title="Decrease">-</button>

                                {/* Quantity */}
                                <span className="font-medium">{item.quantity}</span>

                                {/* Increase quantity */}
                                <button onClick={() => addToCart(item.id, item.size)} className="px-3 py-1 bg-gray-200 rounded cursor-pointer" aria-label="Increase quantity" title="Increase">+</button>

                                {/* Remove from cart */}
                                <button onClick={() => clearItem(item.id, item.size)} className="p-2 hover:bg-[#f5f3ef] rounded-full transition group cursor-pointer" aria-label="Remove from cart" title="Remove">
                                    <FiX className="w-7 h-7 text-gray-400 group-hover:text-[#c1a875] transition" />
                                </button>
                            </div>
                        </div>
                    ))
                    )}
                </div>

                {/* Total */}
                {fullCart.length > 0 && (
                    <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div />
                        <div className="flex flex-col md:items-end gap-2">
                            <div className='flex gap-1 text-xl font-bold'>
                                <p>
                                    Total:
                                </p>
                                <span className="text-[#1a1a1a]">
                                    ${fullCart.reduce((sum, item) => sum + +item.price * item.quantity, 0).toFixed(2)}
                                </span>
                            </div>
                            <button onClick={() => nav("/checkout")} className="w-full md:w-auto px-10 py-4 border border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-white hover:text-black transition rounded-2xl shadow-md font-semibold font-montserrat text-lg active:scale-95 mt-2 cursor-pointer">
                                Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}