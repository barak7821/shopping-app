import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar';
import { useCart } from '../utils/CartContext';
import { errorLog, log } from '../utils/log';
import { FaCreditCard, FaPaypal, FaApplePay, FaGooglePay } from "react-icons/fa6"
import AboutCard from '../components/AboutCard';
import Footer from '../components/Footer';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../utils/AuthContext';
import { fetchProducts, handleGuestOrder, handleOrder } from '../utils/api';

export default function Payment() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const { cart, address, setCart } = useCart()
    const [fullCart, setFullCart] = useState([])
    const [paymentMethod, setPaymentMethod] = useState("creditCard")
    const [shippingPrice, setShippingPrice] = useState(10)
    const [creditCardNumber, setCreditCardNumber] = useState("")
    const [creditCardExpirationDate, setCreditCardExpirationDate] = useState("")
    const [creditCardCVV, setCreditCardCVV] = useState("")
    const [creditCardHolderName, setCreditCardHolderName] = useState("")
    const [loading, setLoading] = useState(false)
    const [demoPayment, setDemoPayment] = useState({})
    const { isAuthenticated } = useAuth()
    const [productsList, setProductsList] = useState([])

    // Get products from server
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

    // Verify there is shipping address before continue with payment page - shipping address is required!
    useEffect(() => {
        setLoading(true)
        if (!address || Object.keys(address).length === 0) {
            notyf.error("Please add shipping address first")
            log("Please add shipping address first")
            nav("/checkout")
            return
        } else {
            setLoading(false)
        }

        log(address)

        getProducts() // get products from server
    }, [address])

    useEffect(() => {
        const items = cart.map(cartItem => { // get the product from the localStorage
            const product = productsList.find(item => item._id === cartItem.id) // find the product by id in the server
            return product
                ? {
                    ...product,
                    selectedSize: cartItem.size,
                    selectedQuantity: cartItem.quantity
                }
                : null
        }).filter(Boolean) // remove null values

        setFullCart(items)
        log("fullCart updated", fullCart)
    }, [cart, productsList])

    // Format credit card number with spaces
    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, "") // remove non-numeric characters
        return cleaned.replace(/(.{4})/g, "$1 ").trim() // add spaces
    }

    // Automatically add a / to the credit card expiration date
    const handleExpirationDate = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, "") // remove non-numeric characters
        if (value.length > 4) value = value.slice(0, 4) // limit to 4 digits

        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2)
        }

        setCreditCardExpirationDate(value)
    }

    const handleClick = async () => {
        if (!paymentMethod) {
            notyf.error("Please select a payment method")
            return
        }

        if (paymentMethod === "creditCard" && (!creditCardNumber || !creditCardExpirationDate || !creditCardCVV || !creditCardHolderName)) {
            notyf.error("Please fill in all credit card details")
            return
        }

        if (paymentMethod === "creditCard") {
            if (creditCardNumber.length < 13 || creditCardNumber.length > 19) {
                notyf.error("Credit card number length is invalid")
                return
            }
            let sum = 0
            let alt = false
            for (let i = creditCardNumber.length - 1; i >= 0; i--) {
                let n = parseInt(creditCardNumber[i])
                if (alt) n *= 2
                if (n > 9) n -= 9
                sum += n
                alt = !alt
            }
            if (sum % 10 !== 0) {
                notyf.error("Credit card number is invalid")
                return
            }
        }

        // Check if credit card number is 13-19 digits
        if (paymentMethod === "creditCard" && creditCardNumber.length < 13 || creditCardNumber.length > 19) {
            notyf.error("Credit card number must be between 13 and 19 digits")
            return
        }

        if (paymentMethod === "creditCard" && creditCardCVV.length > 4) {
            notyf.error("Credit card CVV must be 4 digits")
            return
        }

        if (paymentMethod === "creditCard" && creditCardExpirationDate.length !== 5) {
            notyf.error("Credit card expiration date must be 5 digits")
            return
        }

        if (paymentMethod === "creditCard" && creditCardExpirationDate.slice(0, 2) > 12) {
            notyf.error("Credit card expiration month must be between 01 and 12")
            return
        }

        // If all validations pass, set loading state and proceed with demo payment and send order details to backend 
        setLoading(true)

        // Simulate payment API call
        if (paymentMethod === "creditCard") {
            const paymentDetails = {
                number: creditCardNumber,
                expirationDate: creditCardExpirationDate,
                cvv: creditCardCVV,
                holderName: creditCardHolderName,
                amount: fullCart.reduce((acc, item) => acc + item.price * item.quantity, 0) + +shippingPrice.toFixed(2),
                currency: "USD",
                email: address.email
            }
            setDemoPayment(paymentDetails) // update state with payment details
            log(demoPayment)

            // Simulate credit card payment API call
            log("Calling credit card payment API", paymentDetails)
        } else {
            const paymentDetails = {
                amount: fullCart.reduce((acc, item) => acc + item.price, 0) + +shippingPrice.toFixed(2),
                currency: "USD",
                email: address.email
            }
            setDemoPayment(paymentDetails) // update state with payment details
            log(demoPayment)

            // Simulate paypal payment API call
            if (paymentMethod === "paypal") {
                log("Calling paypal payment API", paymentDetails)
            }

            // Simulate apple pay payment API call
            if (paymentMethod === "applePay") {
                log("Calling apple pay payment API", paymentDetails)
            }

            // Simulate google pay payment API call
            if (paymentMethod === "googlePay") {
                log("Calling google pay payment API", paymentDetails)
            }
        }

        // Prepare order details
        const orderDetails = {
            orderItems: fullCart.map(item => ({
                itemId: item._id,
                itemPricePerUnit: item.price,
                selectedQuantity: item.selectedQuantity,
                selectedSize: item.selectedSize
            })),
            shippingAddress: address,
            paymentMethod: paymentMethod,
        }

        log("orderDetails:", orderDetails)

        // Send order details to backend
        try {
            // check if user is authenticated, to set route
            const data = isAuthenticated
                ? await handleOrder(orderDetails)
                : await handleGuestOrder(orderDetails)

            // clear cart and redirect to order success page
            localStorage.removeItem("cart")
            setCart([]) // clear cart

            notyf.success("Order created successfully!")
            nav("/orderSuccess")
        } catch (error) {
            errorLog("Error in creating new order", error)
            notyf.error("An error occurred while processing your request. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6]">
            <NavBar />

            <div className="flex-1 py-14">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 px-4 md:px-8 items-start">
                    {/* Payment Section */}
                    <section className="w-full">
                        <h1 className="text-3xl font-bold mb-7 font-prata text-[#181818]">Select Payment Method</h1>
                        {/* Payment Methods */}
                        <div className="flex flex-wrap gap-4 mb-7">
                            {[
                                { method: "creditCard", label: "Credit Card", icon: <FaCreditCard size={24} /> },
                                { method: "paypal", label: "PayPal", icon: <FaPaypal size={24} /> },
                                { method: "applePay", label: "Apple Pay", icon: <FaApplePay size={40} /> },
                                { method: "googlePay", label: "Google Pay", icon: <FaGooglePay size={40} /> },
                            ].map(({ method, label, icon }) => (
                                <button key={method} onClick={() => setPaymentMethod(method)} className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition ${paymentMethod === method
                                    ? "bg-[#c1a875]/10 border-[#c1a875] text-[#1a1a1a] font-bold shadow"
                                    : "border-gray-300 text-gray-500 hover:border-[#c1a875] hover:text-[#c1a875]"}`}
                                    style={{ minWidth: 140 }}>
                                    {icon} <span className="text-sm">{label}</span>
                                </button>
                            ))}
                        </div>
                        {/* Payment Form */}
                        <div className="flex flex-col gap-5 mb-10">
                            {paymentMethod === "creditCard" &&
                                <>
                                    <input onChange={e => setCreditCardNumber(e.target.value.replace(/[^0-9]/g, ""))} value={formatCardNumber(creditCardNumber)} type="text" inputMode="numeric" autoComplete="cc-number" maxLength={23} placeholder="Card Number" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 w-full md:flex-[2] min-w-0" />
                                    <div className="flex gap-4">
                                        <input onChange={handleExpirationDate} value={creditCardExpirationDate} type="text" inputMode="numeric" maxLength={5} autoComplete="cc-exp" placeholder="MM/YY" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 w-full md:flex-1 min-w-0" />
                                        <input onChange={e => setCreditCardCVV(e.target.value.replace(/[^0-9]/g, ""))} value={creditCardCVV} type="text" inputMode="numeric" maxLength={4} autoComplete="cc-csc" placeholder="CVV" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 w-full md:flex-1 min-w-0" />
                                    </div>
                                    <input onChange={e => setCreditCardHolderName(e.target.value.replace(/[^A-Za-z\s'-]/g, ""))} value={creditCardHolderName.replace(/\b\w/g, l => l.toUpperCase())} type="text" autoComplete="cc-name" placeholder="Name on Card" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 w-full" />
                                </>
                            }
                            {(paymentMethod === "paypal" || paymentMethod === "applePay" || paymentMethod === "googlePay") && (
                                <div className="text-gray-500 text-sm py-6 text-center">
                                    You will be redirected to complete your payment.
                                </div>
                            )}
                            {/* Pay Button */}
                            <button onClick={handleClick} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95">
                                {paymentMethod === "creditCard" && "Pay Now"}
                                {paymentMethod === "paypal" && "Pay with PayPal"}
                                {paymentMethod === "applePay" && "Pay with Apple Pay"}
                                {paymentMethod === "googlePay" && "Pay with Google Pay"}
                            </button>
                        </div>
                    </section>

                    {/* Order Summary */}
                    <section className="w-full">
                        <h1 className="text-3xl font-bold mb-7 font-prata text-[#181818]">Order Summary</h1>
                        <div className="bg-white/80 rounded-2xl shadow-sm px-8 py-7 flex flex-col gap-4">
                            {fullCart.map(item =>
                                <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-7 border-b border-gray-200 pb-4 last:border-b-0">
                                    <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl border border-[#f2e8db] shadow-sm" />
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-semibold text-lg text-[#1a1a1a]">{item.title.replace(/\b\w/g, l => l.toUpperCase())}</h3>
                                        <p className="text-sm text-gray-500">Size: <span className="font-bold">{item.selectedSize?.toUpperCase()}</span></p>
                                        <p className="font-base text-sm text-gray-500">Quantity: <span className="font-bold">{item.selectedQuantity}</span></p>
                                        <p className="text-base font-black text-[#1a1a1a]">${(+item.price * item.selectedQuantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="pt-5 flex flex-col gap-2 text-lg">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-[#1a1a1a]">
                                        ${(+fullCart.reduce((acc, item) => acc + item.price * item.selectedQuantity, 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-bold text-[#1a1a1a]">${shippingPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl pt-2">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-[#1a1a1a]">
                                        ${(fullCart.reduce((acc, item) => acc + item.price * item.selectedQuantity, 0) + +shippingPrice).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>

    )
}