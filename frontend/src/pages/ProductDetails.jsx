import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { errorLog, log } from '../utils/log';
import { useCart } from '../utils/CartContext';
import Loading from '../components/Loading';
import { fetchProductById } from '../utils/api';
import NotFound from './NotFound';
import { useApiErrorHandler } from '../utils/useApiErrorHandler';

export default function ProductDetails() {
    const { productId } = useParams()
    const { addToCart } = useCart()
    const [size, setSize] = useState("")
    const [activeTab, setActiveTab] = useState("description")
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const { handleApiError } = useApiErrorHandler()
    const sizes = Array.isArray(product?.sizes)
        ? product.sizes
            .map(size => {
                if (typeof size === "string") return size
                if (size && typeof size === "object" && typeof size.code === "string") return size.code
                return ""
            })
            .filter(Boolean)
        : []

    const getProducts = async () => {
        setLoading(true)
        try {
            const data = await fetchProductById(productId)
            setProduct(data)
        } catch (error) {
            handleApiError(error, "getProducts")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getProducts()
    }, [productId])

    // Function to add the product to the cart
    const handleClick = () => {
        if (!size) { // Check if size is selected
            setError("size")
            errorLog("Please select a size")
            return
        }

        // Add to cart
        addToCart(product._id, size)
        log("Add to cart clicked")
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    if (!product) {
        return (
            <NotFound />
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6] dark:bg-neutral-900">
            <NavBar />
            <div className='flex justify-center py-10 gap-10 lg:flex-row flex-col'>

                {/* Image section */}
                <div className='relative flex flex-col items-center'>
                    <img src={product.image} alt={product.title} className="w-[400px] h-[550px] object-cover rounded-2xl shadow-xl" />
                </div>

                {/* Details section */}
                <div className='flex flex-col max-w-md pl-5 justify-center'>
                    <h1 className='text-4xl font-bold mb-4 text-nowrap text-[#181818] dark:text-neutral-100'>
                        {product.title.replace(/\b\w/g, l => l.toUpperCase())}
                    </h1>
                    <div className='flex flex-col py-5'>

                        {/* Sale */}
                        {product.onSale == true
                            ? <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[#c1a875] dark:text-[#d3b988] font-bold text-3xl">${(product.price * (1 - product.discountPercent / 100)).toFixed(2)}</p>
                                    <p className="text-gray-500 dark:text-neutral-400 font-semibold text-xl line-through">${product.price}</p>
                                </div>
                                <span className="text-sm font-semibold text-[#c1a875] dark:text-[#d3b988] tracking-wide mt-1">{product.discountPercent}% OFF</span>
                            </div>
                            : <p className="text-gray-800 dark:text-neutral-200 font-[#1a1a1a] font-bold text-3xl">${product.price}</p>
                        }
                    </div>

                    <p className="text-gray-600 dark:text-neutral-300 mb-10">{product.description}</p>

                    {product.availability === "low" &&
                        <div className="mb-8 inline-flex items-center gap-2 text-sm text-[#8a6b3b] bg-[#c1a875]/15 border border-[#c1a875]/30 px-3 py-1.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                                <path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm0 3a1 1 0 01.993.883L13 6v6l3.293 3.293a1 1 0 01-1.32 1.497l-.094-.083-3.5-3.5A1 1 0 0111 12.5V6a1 1 0 011-1z" />
                            </svg>
                            <span>Hurry — low stock</span>
                        </div>
                    }


                    {/* Size */}
                    <p className={`text-gray-700 dark:text-neutral-300 ${!size && error === "size" && "text-red-500"}`}>Select Size {!size && error === "size" && <span className="text-red-500">*</span>}</p>
                    <div className='flex flex-wrap gap-2 py-2 items-center'>
                        {sizes.map((item, index) =>
                            <button key={index} onClick={e => setSize(e.target.value)} value={item} className={`bg-gray-200 dark:bg-neutral-600 dark:text-neutral-100 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === item ? "bg-gray-500 dark:bg-neutral-800" : ""} disabled:cursor-not-allowed disabled:opacity-50`} disabled={product.availability === "out"}>
                                {item}
                            </button>
                        )}
                    </div>

                    {/* Add to cart */}
                    <div className='pt-10'>
                        {product.availability === "out"
                            ? <p className="text-red-600 dark:text-red-400 font-semibold text-xl flex items-center gap-2">
                                Currently out of stock
                            </p>
                            : <button onClick={handleClick} disabled={product.availability === "out"} className="px-10 py-4 border bg-[#1a1a1a] text-white hover:bg-white hover:text-[#1a1a1a] transition rounded-2xl shadow-md font-semibold font-montserrat text-lg active:scale-95 cursor-pointer disabled:bg-neutral-600 disabled:text-neutral-100 disabled:cursor-not-allowed disabled:active:scale-100">
                                Add to Cart
                            </button>}
                    </div>
                </div>
            </div>

            {/* description and reviews */}
            <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-neutral-800 rounded shadow flex flex-col">
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 relative">
                    <button onClick={e => setActiveTab(e.target.value)} value="description" className={`group relative px-6 py-3 text-xl font-semibold focus:outline-none transition-all cursor-pointer ${activeTab === "description" ? "text-[#c1a875]" : "text-gray-500 dark:text-neutral-300 hover:text-[#c1a875]"}`} style={{ minWidth: 120 }}>
                        Description
                        {activeTab === "description" &&
                            <span className="absolute left-4 right-4 bottom-[-2px] h-[3px] bg-[#c1a875] rounded-full" style={{ zIndex: 2 }} />
                        }
                    </button>
                    <button onClick={e => setActiveTab(e.target.value)} value="reviews" className={`group relative px-6 py-3 text-xl font-semibold focus:outline-none transition-all cursor-pointer ${activeTab === "reviews" ? "text-[#c1a875]" : "text-gray-500 dark:text-neutral-300 hover:text-[#c1a875]"}`} style={{ minWidth: 120 }}>
                        Reviews
                        {activeTab === "reviews" &&
                            <span className="absolute left-4 right-4 bottom-[-2px] h-[3px] bg-[#c1a875] rounded-full" style={{ zIndex: 2 }} />
                        }
                    </button>
                </div>

                <div className='flex'>
                    {activeTab === "description"
                        ? <p className="text-gray-700 dark:text-neutral-300">{product.description}</p>
                        : <div className="space-y-4 w-full my-5">
                            <div className="border-b pb-2 dark:border-neutral-700">
                                <p className="font-semibold dark:text-neutral-100">Jane Doe <span className="text-yellow-500">★★★★★</span></p>
                                <p className="text-gray-600 dark:text-neutral-300">Great product! Highly recommend.</p>
                            </div>
                            <div className="border-b pb-2 dark:border-neutral-700">
                                <p className="font-semibold dark:text-neutral-100">John Smith <span className="text-yellow-500">★★★★☆</span></p>
                                <p className="text-gray-600 dark:text-neutral-300">Good quality, but shipping was slow.</p>
                            </div>
                            <div>
                                <p className="font-semibold dark:text-neutral-100">Alice <span className="text-yellow-500">★★★★★</span></p>
                                <p className="text-gray-600 dark:text-neutral-300">Exactly as described. Will buy again!</p>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}
