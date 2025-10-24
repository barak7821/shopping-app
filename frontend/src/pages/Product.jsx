import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { errorLog, log } from '../utils/log';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { useCart } from '../utils/CartContext';
import Loading from '../components/Loading';
import { fetchProducts } from '../utils/api';

export default function Product() {
    const { productId } = useParams()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const { addToCart } = useCart()
    const [size, setSize] = useState("")
    const [activeTab, setActiveTab] = useState("description")
    const [item, setItem] = useState({})
    const [loading, setLoading] = useState(true)

    const getProducts = async () => {
        setLoading(true)
        try {
            const data = await fetchProducts()
            const item = data.find(item => item._id === productId) // Find product by id
            setItem(item)
            log("Product:", item)
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

    // Function to add the product to the cart
    const handleClick = () => {
        if (!size) { // Check if size is selected
            notyf.error("Please select a size")
            errorLog("Please select a size")
            return
        }

        // Add to cart
        addToCart(item._id, size)
        log("Add to cart clicked")
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6] dark:bg-neutral-900">
            <NavBar />
            <div className='flex justify-center py-10 gap-10 lg:flex-row flex-col'>

                {/* Image section */}
                <div className='flex flex-col items-center'>
                    <img src={item.image} alt={item.title} className="w-[400px] h-[550px] object-cover rounded-2xl shadow-xl" />
                </div>

                {/* Details section */}
                <div className='flex flex-col max-w-md pl-5 justify-center'>
                    <h1 className='text-4xl font-bold mb-4 text-nowrap text-[#181818] dark:text-neutral-100'>
                        {item.title.replace(/\b\w/g, l => l.toUpperCase())}
                    </h1>
                    <div className='flex flex-col py-5'>
                        <p className="text-gray-800 dark:text-neutral-200 font-[#1a1a1a] font-bold text-3xl">${item.price}</p>
                    </div>
                    <p className="text-gray-600 dark:text-neutral-300 mb-10">{item.description}</p>

                    {/* Size */}
                    <p className='text-gray-700 dark:text-neutral-300'>Select Size</p>
                    <div className='flex flex-wrap gap-2 py-2 items-center'>
                        {item.sizes.includes("outOfStock")
                            ? <p className="text-red-600 dark:text-red-400 font-semibold text-sm flex items-center gap-2">
                                Currently out of stock
                            </p>
                            : item.sizes.map((item, index) => (
                                <button key={index} onClick={e => setSize(e.target.value)} value={item} className={`bg-gray-200 dark:bg-neutral-600 dark:text-neutral-100 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === item ? "bg-gray-500 dark:bg-neutral-800" : ""}`}>
                                    {item}
                                </button>
                            )
                            )}
                    </div>

                    {/* Add to cart */}
                    <div className='pt-10'>
                        <button onClick={handleClick} className="px-10 py-4 border bg-[#1a1a1a] text-white hover:bg-white hover:text-[#1a1a1a] transition rounded-2xl shadow-md font-semibold font-montserrat text-lg active:scale-95 cursor-pointer">
                            Add to Cart
                        </button>
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
                        ? <p className="text-gray-700 dark:text-neutral-300">{item.description}</p>
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