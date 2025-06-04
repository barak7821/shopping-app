import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import demoData from '../../demoData'
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { log } from '../utils/log';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { useCart } from '../utils/CartContext';

export default function Product() {
    const { productId } = useParams()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [size, setSize] = useState("")
    const [activeTab, setActiveTab] = useState("description")
    const item = demoData.find(item => item.id === productId) // Find product by id
    const { addToCart } = useCart()

    const handleClick = () => {
        if (!size) {
            notyf.error("Please select a size")
            errorLog("Please select a size")
            return
        }


        // Add to cart
        addToCart(item.id, size)
        log("Add to cart clicked")
    }

    return (
        <div className='min-h-screen'>
            <NavBar />
            <div className='flex justify-center py-10 gap-10 lg:flex-row flex-col'>

                {/* Image section */}
                <div className='flex flex-col items-center'>
                    <img src={item.image} alt={item.title} className="w-[400px] h-[550px] object-cover rounded-2xl shadow-xl" />
                </div>

                {/* Details section */}
                <div className='flex flex-col max-w-md pl-5 justify-center'>
                    <h1 className='text-4xl font-bold mb-4'>{item.title}</h1>
                    <p className='text-gray-700'>⭐⭐⭐⭐⭐ ({item.rating})</p>
                    <div className='flex flex-col py-5'>
                        <p className="text-gray-800 font-[#1a1a1a] font-bold text-3xl">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-gray-600 mb-10">{item.description}
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem eum maxime rerum quibusdam eius qui suscipit eligendi corrupti unde perferendis deserunt provident, quas consectetur molestias, pariatur porro ratione. Accusantium, sint.
                    </p>

                    {/* Size */}
                    <p className='text-gray-700'>Select Size</p>
                    <div className='flex gap-2 py-2'>
                        <button onClick={e => setSize(e.target.value)} value={"xs"} className={`bg-gray-200 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === "xs" ? "bg-gray-500" : ""}`}>XS</button>
                        <button onClick={e => setSize(e.target.value)} value={"s"} className={`bg-gray-200 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === "s" ? "bg-gray-500" : ""}`}>S</button>
                        <button onClick={e => setSize(e.target.value)} value={"m"} className={`bg-gray-200 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === "m" ? "bg-gray-500" : ""}`}>M</button>
                        <button onClick={e => setSize(e.target.value)} value={"l"} className={`bg-gray-200 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === "l" ? "bg-gray-500" : ""}`}>L</button>
                        <button onClick={e => setSize(e.target.value)} value={"xl"} className={`bg-gray-200 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === "xl" ? "bg-gray-500" : ""}`}>XL</button>
                        <button onClick={e => setSize(e.target.value)} value={"xxl"} className={`bg-gray-200 px-3 py-1 rounded transition-colors duration-300 ease-in-out cursor-pointer ${size === "xxl" ? "bg-gray-500" : ""}`}>XXL</button>
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
            <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow flex flex-col">
                <div className="flex gap-2 mb-6 border-b border-gray-200 bg-white relative">
                    <button onClick={e => setActiveTab(e.target.value)} value="description" className={`group relative px-6 py-3 text-xl font-semibold focus:outline-none transition-all cursor-pointer ${activeTab === "description" ? "text-[#c1a875]" : "text-gray-500 hover:text-[#c1a875]"}`} style={{ minWidth: 120 }}>
                        Description
                        {activeTab === "description" &&
                            <span className="absolute left-4 right-4 bottom-[-2px] h-[3px] bg-[#c1a875] rounded-full" style={{ zIndex: 2 }} />
                        }
                    </button>
                    <button onClick={e => setActiveTab(e.target.value)} value="reviews" className={`roup relative px-6 py-3 text-xl font-semibold focus:outline-none transition-all cursor-pointer ${activeTab === "reviews" ? "text-[#c1a875]" : "text-gray-500 hover:text-[#c1a875]"}`} style={{ minWidth: 120 }}>
                        Reviews
                        {activeTab === "reviews" &&
                            <span className="absolute left-4 right-4 bottom-[-2px] h-[3px] bg-[#c1a875] rounded-full" style={{ zIndex: 2 }} />
                        }
                    </button>
                </div>

                <div className='flex'>
                    {activeTab === "description"
                        ? <p className="text-gray-700 mb-6">{item.description}
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat assumenda, numquam optio eaque minus explicabo. Ducimus hic doloremque praesentium molestias amet, cum provident magnam alias odio eveniet maiores rem laudantium.
                        </p>
                        : <div className="space-y-4 w-full my-5">
                            {/* Example reviews, replace with real data if available */}
                            <div className="border-b pb-2">
                                <p className="font-semibold">Jane Doe <span className="text-yellow-500">★★★★★</span></p>
                                <p className="text-gray-600">Great product! Highly recommend.</p>
                            </div>
                            <div className="border-b pb-2">
                                <p className="font-semibold">John Smith <span className="text-yellow-500">★★★★☆</span></p>
                                <p className="text-gray-600">Good quality, but shipping was slow.</p>
                            </div>
                            <div>
                                <p className="font-semibold">Alice <span className="text-yellow-500">★★★★★</span></p>
                                <p className="text-gray-600">Exactly as described. Will buy again!</p>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <AboutCard />
            <Footer />
        </div>
    )
}