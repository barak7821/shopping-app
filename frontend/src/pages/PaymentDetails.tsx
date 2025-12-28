import { useEffect, useState, type ChangeEvent } from 'react'
import NavBar from '../components/NavBar';
import { useCart } from '../context/CartContext';
import { log } from '../lib/logger';
import { FaCreditCard, FaPaypal, FaApplePay, FaGooglePay } from "react-icons/fa6"
import AboutCard from '../components/AboutInfoCard';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProductsByIds, handleGuestOrder, handleOrder } from '../api/apiClient';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import { useNotyf } from '../hooks/useNotyf';
import type { FullCartItem, Product, PaymentDetails } from '../types/types';

export default function Payment() {
    const nav = useNavigate()
    const notyf = useNotyf()
    const { cart, address, setCart, removeFromCart } = useCart()
    const [fullCart, setFullCart] = useState<FullCartItem[]>([])
    const [paymentMethod, setPaymentMethod] = useState("creditCard")
    const [shippingPrice, setShippingPrice] = useState(0)
    const [creditCardNumber, setCreditCardNumber] = useState("")
    const [creditCardExpirationDate, setCreditCardExpirationDate] = useState("")
    const [creditCardCVV, setCreditCardCVV] = useState("")
    const [creditCardHolderName, setCreditCardHolderName] = useState("")
    const [loading, setLoading] = useState(false)
    const [demoPayment, setDemoPayment] = useState<PaymentDetails | null>(null)
    const { isAuthenticated } = useAuth()
    const { handleApiError } = useApiErrorHandler()

    // Get products from server
    const getProductsByIds = async () => {
        setLoading(true)
        try {
            const data = await fetchProductsByIds(cart.map(item => item.id)) as Product[]

            const items = cart.map(cartItem => {
                const product = data.find(productItem => productItem._id === cartItem.id)
                if (product) {
                    return {
                        ...product,
                        selectedSize: cartItem.size,
                        selectedQuantity: cartItem.quantity
                    }
                } else {
                    removeFromCart(cartItem.id, cartItem.size) // remove the item from the cart if it doesn't exist in the server
                    return null
                }
            }).filter(Boolean) as FullCartItem[] // remove null values

            setFullCart(items)
        } catch (error) {
            handleApiError(error, "getProductsByIds")
        } finally {
            setLoading(false)
        }
    }

    // Verify there is shipping address before continue with payment page - shipping address is required!
    useEffect(() => {
        setLoading(true)
        if (!address || Object.keys(address).length === 0) {
            notyf?.error("Please add shipping address first")
            log("Please add shipping address first")
            nav("/checkout")
            return
        } else {
            setLoading(false)
        }

        log("Address", address)
        log("Cart", cart)
        getProductsByIds() // get products from server
    }, [address, cart])

    // Format credit card number with spaces
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, "") // remove non-numeric characters
        return cleaned.replace(/(.{4})/g, "$1 ").trim() // add spaces
    }

    // Automatically add a / to the credit card expiration date
    const handleExpirationDate = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, "") // remove non-numeric characters
        if (value.length > 4) value = value.slice(0, 4) // limit to 4 digits

        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2)
        }

        setCreditCardExpirationDate(value)
    }

    const handleClick = async () => {
        if (fullCart.length === 0) {
            notyf?.error("Please add something to cart")
            log("Please add something to cart")
            return
        }

        if (!paymentMethod) {
            notyf?.error("Please select a payment method")
            return
        }

        if (paymentMethod === "creditCard" && (!creditCardNumber || !creditCardExpirationDate || !creditCardCVV || !creditCardHolderName)) {
            notyf?.error("Please fill in all credit card details")
            return
        }

        if (paymentMethod === "creditCard") {
            if (creditCardNumber.length < 13 || creditCardNumber.length > 19) {
                notyf?.error("Credit card number length is invalid")
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
                notyf?.error("Credit card number is invalid")
                return
            }
        }

        // Check if credit card number is 13-19 digits
        if (paymentMethod === "creditCard" && creditCardNumber.length < 13 || creditCardNumber.length > 19) {
            notyf?.error("Credit card number must be between 13 and 19 digits")
            return
        }

        if (paymentMethod === "creditCard" && creditCardCVV.length > 4) {
            notyf?.error("Credit card CVV must be 4 digits")
            return
        }

        if (paymentMethod === "creditCard" && creditCardExpirationDate.length !== 5) {
            notyf?.error("Credit card expiration date must be 5 digits")
            return
        }

        if (paymentMethod === "creditCard" && Number(creditCardExpirationDate.slice(0, 2)) > 12) {
            notyf?.error("Credit card expiration month must be between 01 and 12")
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
                itemTitle: item.title,
                itemPricePerUnit: item.price * (1 - item.discountPercent / 100),
                selectedQuantity: item.selectedQuantity ?? item.quantity,
                selectedSize: item.selectedSize ?? item.size ?? null
            })),
            shippingAddress: address,
            paymentMethod: paymentMethod,
        }

        log("orderDetails:", orderDetails)

        // Send order details to backend
        try {
            // check if user is authenticated, to set route
            isAuthenticated
                ? await handleOrder(orderDetails)
                : await handleGuestOrder(orderDetails)

            // clear cart and redirect to order success page
            localStorage.removeItem("cart")
            setCart([]) // clear cart

            notyf?.success("Order created successfully!")
            nav("/orderSuccess")
        } catch (error) {
            handleApiError(error, "handleAddProduct")
        } finally {
            setLoading(false)
        }
    }

    const skeletonOrder = ( // loading state for order summary
        <div className="flex items-center gap-7 border-b border-gray-200 dark:border-neutral-700 pb-4 last:border-b-0 animate-pulse">
            <div className="w-24 h-24 bg-gray-200 dark:bg-neutral-700 rounded-xl border border-[#f2e8db] dark:border-neutral-600 shadow-sm" />
            <div className="flex flex-col gap-1">
                <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-700 rounded mb-1" />
                <div className="h-4 w-20 bg-gray-100 dark:bg-neutral-600 rounded mb-1" />
                <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-600 rounded mb-1" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-neutral-700 rounded" />
            </div>
        </div>
    )

    const skeletonTotals = ( // loading state for totals
        <div className="pt-5 flex flex-col gap-2 text-lg animate-pulse">
            <div className="flex justify-between items-center">
                <span className="w-20 h-5 bg-gray-100 dark:bg-neutral-600 rounded" />
                <span className="w-16 h-5 bg-gray-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="flex justify-between items-center">
                <span className="w-20 h-5 bg-gray-100 dark:bg-neutral-600 rounded" />
                <span className="w-16 h-5 bg-gray-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="flex justify-between items-center text-xl pt-2">
                <span className="w-20 h-6 bg-gray-200 dark:bg-neutral-700 rounded" />
                <span className="w-20 h-6 bg-gray-300 dark:bg-neutral-600 rounded" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6] dark:bg-neutral-900">
            <NavBar />

            <div className="flex-1 py-14">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 px-4 md:px-8 items-start">
                    {/* Payment Section */}
                    <section className="w-full">
                        <h1 className="text-3xl font-bold mb-7 font-prata text-[#181818] dark:text-neutral-100">
                            Select Payment Method
                        </h1>
                        {/* Payment Methods */}
                        <div className="flex flex-wrap gap-4 mb-7">
                            {[
                                { method: "creditCard", label: "Credit Card", icon: <FaCreditCard size={24} /> },
                                { method: "paypal", label: "PayPal", icon: <FaPaypal size={24} /> },
                                { method: "applePay", label: "Apple Pay", icon: <FaApplePay size={40} /> },
                                { method: "googlePay", label: "Google Pay", icon: <FaGooglePay size={40} /> },
                            ].map(({ method, label, icon }) =>
                                <button key={method} onClick={() => setPaymentMethod(method)} className={`flex items-center text-center justify-center gap-1 px-2 py-2 rounded-xl border transition cursor-pointer ${paymentMethod === method
                                    ? "bg-[#c1a875]/10 border-[#c1a875] text-[#1a1a1a] dark:text-neutral-100 font-bold shadow"
                                    : "border-gray-300 dark:border-neutral-600 text-gray-500 dark:text-neutral-300 hover:border-[#c1a875] hover:text-[#c1a875]"}`}
                                    style={{ minWidth: 140 }}>
                                    {icon} <span className="text-sm">{label}</span>
                                </button>
                            )}
                        </div>
                        {/* Payment Form */}
                        <div className="flex flex-col gap-5 mb-10">
                            {paymentMethod === "creditCard" &&
                                <>
                                    <input onChange={e => setCreditCardNumber(e.target.value.replace(/[^0-9]/g, ""))} value={formatCardNumber(creditCardNumber)} type="text" inputMode="numeric" autoComplete="cc-number" maxLength={23} placeholder="Card Number" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 w-full md:flex-[2] min-w-0" />
                                    <div className="flex gap-4">
                                        <input onChange={handleExpirationDate} value={creditCardExpirationDate} type="text" inputMode="numeric" maxLength={5} autoComplete="cc-exp" placeholder="MM/YY" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 w-full md:flex-1 min-w-0" />
                                        <input onChange={e => setCreditCardCVV(e.target.value.replace(/[^0-9]/g, ""))} value={creditCardCVV} type="text" inputMode="numeric" maxLength={4} autoComplete="cc-csc" placeholder="CVV" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 w-full md:flex-1 min-w-0" />
                                    </div>
                                    <input onChange={e => setCreditCardHolderName(e.target.value.replace(/[^A-Za-z\s'-]/g, ""))} value={creditCardHolderName.replace(/\b\w/g, l => l.toUpperCase())} type="text" autoComplete="cc-name" placeholder="Name on Card" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 w-full" />
                                </>
                            }
                            {(paymentMethod === "paypal" || paymentMethod === "applePay" || paymentMethod === "googlePay") && (
                                <div className="text-gray-500 dark:text-neutral-300 text-sm py-6 text-center">
                                    You will be redirected to complete your payment.
                                </div>
                            )}
                            {/* Pay Button */}

                            {/* Apple Pay Button */}
                            {paymentMethod === "applePay" &&
                                <button onClick={handleClick} className="w-full mt-4 rounded-2xl bg-[#1a1a1a] text-white border font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer flex justify-center">
                                    <FaApplePay size={64} />
                                </button>
                            }

                            {/* Google Pay Button */}
                            {paymentMethod === "googlePay" &&
                                <button onClick={handleClick} className="w-full mt-4 rounded-2xl bg-[#1a1a1a] text-white border font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer flex justify-center group">
                                    <svg className='fill-white group-hover:fill-black' height="64px" width="64px" viewBox="0 0 2387.3 948">
                                        <path d="M1129.1,463.2V741h-88.2V54.8h233.8c56.4-1.2,110.9,20.2,151.4,59.4c41,36.9,64.1,89.7,63.2,144.8 c1.2,55.5-21.9,108.7-63.2,145.7c-40.9,39-91.4,58.5-151.4,58.4L1129.1,463.2L1129.1,463.2z M1129.1,139.3v239.6h147.8 c32.8,1,64.4-11.9,87.2-35.5c46.3-45,47.4-119.1,2.3-165.4c-0.8-0.8-1.5-1.6-2.3-2.3c-22.5-24.1-54.3-37.3-87.2-36.4L1129.1,139.3 L1129.1,139.3z M1692.5,256.2c65.2,0,116.6,17.4,154.3,52.2c37.7,34.8,56.5,82.6,56.5,143.2V741H1819v-65.2h-3.8 c-36.5,53.7-85.1,80.5-145.7,80.5c-51.7,0-95-15.3-129.8-46c-33.8-28.5-53-70.7-52.2-115c0-48.6,18.4-87.2,55.1-115.9 c36.7-28.7,85.7-43.1,147.1-43.1c52.3,0,95.5,9.6,129.3,28.7v-20.2c0.2-30.2-13.2-58.8-36.4-78c-23.3-21-53.7-32.5-85.1-32.1 c-49.2,0-88.2,20.8-116.9,62.3l-77.6-48.9C1545.6,286.8,1608.8,256.2,1692.5,256.2L1692.5,256.2z M1578.4,597.3 c-0.1,22.8,10.8,44.2,29.2,57.5c19.5,15.3,43.7,23.5,68.5,23c37.2-0.1,72.9-14.9,99.2-41.2c29.2-27.5,43.8-59.7,43.8-96.8 c-27.5-21.9-65.8-32.9-115-32.9c-35.8,0-65.7,8.6-89.6,25.9C1590.4,550.4,1578.4,571.7,1578.4,597.3L1578.4,597.3z M2387.3,271.5L2093,948h-91l109.2-236.7l-193.6-439.8h95.8l139.9,337.3h1.9l136.1-337.3L2387.3,271.5z" />
                                        <path fill="#4285F4" d="M772.8,403.2c0-26.9-2.2-53.7-6.8-80.2H394.2v151.8h212.9c-8.8,49-37.2,92.3-78.7,119.8v98.6h127.1 C729.9,624.7,772.8,523.2,772.8,403.2L772.8,403.2z" />
                                        <path fill="#34A853" d="M394.2,788.5c106.4,0,196-34.9,261.3-95.2l-127.1-98.6c-35.4,24-80.9,37.7-134.2,37.7 c-102.8,0-190.1-69.3-221.3-162.7H42v101.6C108.9,704.5,245.2,788.5,394.2,788.5z" />
                                        <path fill="#FBBC04" d="M172.9,469.7c-16.5-48.9-16.5-102,0-150.9V217.2H42c-56,111.4-56,242.7,0,354.1L172.9,469.7z" />
                                        <path fill="#EA4335" d="M394.2,156.1c56.2-0.9,110.5,20.3,151.2,59.1L658,102.7C586.6,35.7,492.1-1.1,394.2,0 C245.2,0,108.9,84.1,42,217.2l130.9,101.6C204.1,225.4,291.4,156.1,394.2,156.1z" />
                                    </svg>
                                </button>
                            }

                            {/* PayPal Button */}
                            {paymentMethod === "paypal" &&
                                <button onClick={handleClick} className="w-full mt-4 rounded-2xl bg-[#1a1a1a] text-white border font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer flex justify-center items-center gap-8">

                                    <svg viewBox="-23 0 302 302" width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" className='scale-100 mb-2'>
                                        <path d="M217.168 23.507C203.234 7.625 178.046.816 145.823.816h-93.52A13.393 13.393 0 0 0 39.076 12.11L.136 259.077c-.774 4.87 2.997 9.28 7.933 9.28h57.736l14.5-91.971-.45 2.88c1.033-6.501 6.593-11.296 13.177-11.296h27.436c53.898 0 96.101-21.892 108.429-85.221.366-1.873.683-3.696.957-5.477-1.556-.824-1.556-.824 0 0 3.671-23.407-.025-39.34-12.686-53.765" fill="#27346A"></path>
                                        <path d="M102.397 68.84a11.737 11.737 0 0 1 5.053-1.14h73.318c8.682 0 16.78.565 24.18 1.756a101.6 101.6 0 0 1 6.177 1.182 89.928 89.928 0 0 1 8.59 2.347c3.638 1.215 7.026 2.63 10.14 4.287 3.67-23.416-.026-39.34-12.687-53.765C203.226 7.625 178.046.816 145.823.816H52.295C45.71.816 40.108 5.61 39.076 12.11L.136 259.068c-.774 4.878 2.997 9.282 7.925 9.282h57.744L95.888 77.58a11.717 11.717 0 0 1 6.509-8.74z" fill="#27346A"></path>
                                        <path d="M228.897 82.749c-12.328 63.32-54.53 85.221-108.429 85.221H93.024c-6.584 0-12.145 4.795-13.168 11.296L61.817 293.621c-.674 4.262 2.622 8.124 6.934 8.124h48.67a11.71 11.71 0 0 0 11.563-9.88l.474-2.48 9.173-58.136.591-3.213a11.71 11.71 0 0 1 11.562-9.88h7.284c47.147 0 84.064-19.154 94.852-74.55 4.503-23.15 2.173-42.478-9.739-56.054-3.613-4.112-8.1-7.508-13.327-10.28-.283 1.79-.59 3.604-.957 5.477z" fill="#2790C3"></path>
                                        <path d="M216.952 72.128a89.928 89.928 0 0 0-5.818-1.49 109.904 109.904 0 0 0-6.177-1.174c-7.408-1.199-15.5-1.765-24.19-1.765h-73.309a11.57 11.57 0 0 0-5.053 1.149 11.683 11.683 0 0 0-6.51 8.74l-15.582 98.798-.45 2.88c1.025-6.501 6.585-11.296 13.17-11.296h27.444c53.898 0 96.1-21.892 108.428-85.221.367-1.873.675-3.688.958-5.477-3.122-1.648-6.501-3.072-10.14-4.279a83.26 83.26 0 0 0-2.77-.865" fill="#1F264F"></path>
                                    </svg>

                                    <svg viewBox="0 0 780 501" width="64px" height="64px" xmlns="http://www.w3.org/2000/svg" className='scale-200'>
                                        <path fill="#003087" d="M168.379,169.853c-8.399-5.774-19.359-8.668-32.88-8.668H83.153c-4.145,0-6.435,2.073-6.87,6.215 L55.018,300.883c-0.221,1.311,0.107,2.51,0.981,3.6c0.869,1.092,1.962,1.635,3.271,1.635h24.864c4.361,0,6.758-2.068,7.198-6.215 l5.888-35.986c0.215-1.744,0.982-3.162,2.291-4.254c1.308-1.09,2.944-1.803,4.907-2.13c1.963-0.324,3.814-0.487,5.562-0.487 c1.743,0,3.814,0.11,6.217,0.327c2.397,0.218,3.925,0.324,4.58,0.324c18.756,0,33.478-5.285,44.167-15.866 c10.684-10.577,16.032-25.243,16.032-44.004C180.976,184.96,176.774,175.636,168.379,169.853z M141.389,209.933 c-1.094,7.635-3.926,12.649-8.506,15.049c-4.581,2.403-11.124,3.598-19.629,3.598l-10.797,0.327l5.563-35.007 c0.434-2.397,1.851-3.597,4.252-3.597h6.218c8.72,0,15.049,1.257,18.975,3.761C141.389,196.574,142.698,201.865,141.389,209.933z"></path>
                                        <path fill="#009CDE" d="M720.794,161.185h-24.208c-2.405,0-3.821,1.2-4.253,3.6l-21.267,136.099l-0.328,0.654 c0,1.096,0.437,2.127,1.311,3.109c0.868,0.98,1.963,1.471,3.27,1.471h21.595c4.138,0,6.429-2.068,6.871-6.215l21.265-133.813 v-0.325C725.049,162.712,723.627,161.185,720.794,161.185z"></path>
                                        <path fill="#003087" d="M428.31,213.856c0-1.088-0.439-2.126-1.306-3.106c-0.875-0.981-1.858-1.474-2.945-1.474h-25.192 c-2.404,0-4.366,1.096-5.889,3.271l-34.679,51.04l-14.395-49.075c-1.095-3.487-3.492-5.236-7.197-5.236h-24.541 c-1.093,0-2.074,0.492-2.941,1.474c-0.875,0.98-1.309,2.019-1.309,3.106c0,0.44,2.127,6.871,6.379,19.303 c4.252,12.435,8.832,25.849,13.74,40.245c4.908,14.393,7.469,22.031,7.688,22.898c-17.886,24.43-26.826,37.517-26.826,39.259 c0,2.838,1.416,4.254,4.253,4.254h25.192c2.398,0,4.36-1.088,5.889-3.27l83.427-120.399 C428.092,215.713,428.31,214.953,428.31,213.856z"></path>
                                        <path fill="#009CDE" d="M662.887,209.276h-24.866c-3.055,0-4.904,3.6-5.558,10.798c-5.677-8.721-16.031-13.088-31.083-13.088 c-15.704,0-29.066,5.89-40.077,17.668c-11.016,11.778-16.521,25.631-16.521,41.551c0,12.871,3.761,23.121,11.285,30.752 c7.525,7.639,17.612,11.451,30.266,11.451c6.323,0,12.757-1.311,19.3-3.926c6.544-2.617,11.665-6.105,15.379-10.469 c0,0.219-0.222,1.199-0.655,2.943c-0.44,1.748-0.655,3.059-0.655,3.926c0,3.494,1.414,5.234,4.254,5.234h22.576 c4.138,0,6.541-2.068,7.194-6.215l13.415-85.39c0.215-1.309-0.112-2.507-0.982-3.599 C665.284,209.823,664.196,209.276,662.887,209.276z M620.193,273.729c-5.562,5.453-12.268,8.178-20.12,8.178 c-6.328,0-11.449-1.742-15.377-5.234c-3.927-3.484-5.89-8.283-5.89-14.395c0-8.065,2.726-14.886,8.18-20.447 c5.447-5.562,12.214-8.343,20.285-8.343c6.101,0,11.173,1.8,15.212,5.397c4.032,3.6,6.054,8.563,6.054,14.889 C628.536,261.625,625.754,268.279,620.193,273.729z"></path>
                                        <path fill="#003087" d="M291.231,209.276h-24.865c-3.058,0-4.908,3.6-5.563,10.798c-5.889-8.721-16.25-13.088-31.081-13.088 c-15.704,0-29.065,5.89-40.078,17.668c-11.016,11.778-16.521,25.631-16.521,41.551c0,12.871,3.763,23.121,11.288,30.752 c7.525,7.639,17.61,11.451,30.262,11.451c6.104,0,12.433-1.311,18.975-3.926c6.543-2.617,11.778-6.105,15.704-10.469 c-0.875,2.617-1.309,4.908-1.309,6.869c0,3.494,1.417,5.234,4.253,5.234h22.574c4.141,0,6.543-2.068,7.198-6.215l13.413-85.39 c0.215-1.309-0.111-2.507-0.981-3.599C293.627,209.823,292.537,209.276,291.231,209.276z M248.535,273.891 c-5.563,5.35-12.382,8.016-20.447,8.016c-6.329,0-11.4-1.742-15.214-5.234c-3.819-3.484-5.726-8.283-5.726-14.395 c0-8.065,2.725-14.886,8.18-20.447c5.449-5.562,12.211-8.343,20.284-8.343c6.104,0,11.175,1.8,15.214,5.397 c4.032,3.6,6.052,8.563,6.052,14.889C256.878,261.844,254.097,268.553,248.535,273.891z"></path>
                                        <path fill="#009CDE" d="M540.036,169.853c-8.398-5.774-19.356-8.668-32.879-8.668h-52.019c-4.365,0-6.765,2.073-7.198,6.215 l-21.265,133.483c-0.221,1.311,0.106,2.51,0.981,3.6c0.866,1.092,1.962,1.635,3.271,1.635h26.826c2.617,0,4.361-1.416,5.235-4.252 l5.89-37.949c0.216-1.744,0.98-3.162,2.29-4.254c1.309-1.09,2.943-1.803,4.908-2.13c1.962-0.324,3.813-0.487,5.562-0.487 c1.743,0,3.814,0.11,6.214,0.327c2.399,0.218,3.93,0.324,4.58,0.324c18.759,0,33.479-5.285,44.168-15.866 c10.687-10.577,16.031-25.243,16.031-44.004C552.632,184.96,548.431,175.636,540.036,169.853z M506.502,223.673 c-4.799,3.271-11.997,4.906-21.592,4.906l-10.47,0.327l5.563-35.007c0.432-2.397,1.849-3.597,4.252-3.597h5.887 c4.797,0,8.614,0.218,11.454,0.653c2.831,0.439,5.561,1.799,8.178,4.089c2.619,2.29,3.926,5.618,3.926,9.979 C513.7,214.185,511.298,220.399,506.502,223.673z"></path>
                                    </svg>


                                </button>
                            }

                            {paymentMethod === "creditCard" &&
                                <button onClick={handleClick} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer">
                                    Pay Now
                                </button>
                            }
                        </div>
                    </section>

                    {/* Order Summary */}
                    <section className="w-full">
                        <h1 className="text-3xl font-bold mb-7 font-prata text-[#181818] dark:text-neutral-100">
                            Order Summary
                        </h1>
                        <div className="bg-white/80 dark:bg-neutral-800/80 rounded-2xl shadow-sm px-8 py-7 flex flex-col gap-4">
                            {loading
                                ? skeletonOrder
                                : fullCart.map(item =>
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-7 border-b border-gray-200 dark:border-neutral-700 pb-4 last:border-b-0">
                                        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl border border-[#f2e8db] dark:border-neutral-600 shadow-sm" />
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-semibold text-lg text-[#1a1a1a] dark:text-neutral-100">{item.title.replace(/\b\w/g, l => l.toUpperCase())}</h3>
                                            <p className="text-sm text-gray-500 dark:text-neutral-400">Size: <span className="font-bold">{item.selectedSize?.toUpperCase()}</span></p>
                                            <p className="font-base text-sm text-gray-500 dark:text-neutral-400">Quantity: <span className="font-bold">{item.selectedQuantity}</span></p>

                                            {/* Sale */}
                                            {item.onSale == true
                                                ? <div className="flex flex-col text-center gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[#c1a875] dark:text-[#d3b988] font-bold text-base md:text-lg">${(+item.price * (item.selectedQuantity ?? item.quantity) * (1 - item.discountPercent / 100)).toFixed(2)}</p>
                                                        <p className="text-gray-500 dark:text-neutral-400 font-semibold line-through text-xs md:text-sm">${(+item.price * (item.selectedQuantity ?? item.quantity)).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                : <p className="text-base font-black text-[#1a1a1a] dark:text-neutral-200">${(+item.price * (item.selectedQuantity ?? item.quantity)).toFixed(2)}</p>

                                            }
                                        </div>
                                    </div>
                                )}

                            {/* Totals */}
                            {loading
                                ? skeletonTotals
                                : <div className="pt-5 flex flex-col gap-2 text-lg">
                                    <div className="flex justify-between">
                                        <span className="dark:text-neutral-300">Subtotal</span>
                                        <span className="font-bold text-[#1a1a1a] dark:text-neutral-200">
                                            ${(+fullCart.reduce((acc, item) => acc + item.price * (item.selectedQuantity ?? item.quantity) * (1 - item.discountPercent / 100), 0)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="dark:text-neutral-300">Shipping</span>
                                        <span className="font-bold text-[#1a1a1a] dark:text-neutral-200">${shippingPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl pt-2">
                                        <span className="font-bold dark:text-neutral-300">Total</span>
                                        <span className="font-bold text-[#1a1a1a] dark:text-neutral-200">
                                            ${(fullCart.reduce((acc, item) => acc + item.price * (item.selectedQuantity ?? item.quantity) * (1 - item.discountPercent / 100), 0) + +shippingPrice).toFixed(2)}
                                        </span>
                                    </div>
                                </div>}
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
