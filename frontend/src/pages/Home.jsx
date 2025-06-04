import NavBar from '../components/NavBar';
import demoData from '../../demoData';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { FiRefreshCw, FiShield, FiHeadphones } from "react-icons/fi"

export default function Home() {
    const nav = useNavigate()

    return (
        <div className='min-h-screen flex flex-col font-montserrat dark:bg-neutral-900'>
            <NavBar />

            <div className='flex-1'>
                {/* Hero Section */}
                <section className="bg-[#faf8f6] w-full flex flex-col lg:flex-row items-center justify-between min-h-[550px] px-6 lg:px-32 py-16 relative overflow-hidden">
                    {/* Text */}
                    <div className="flex-1 flex flex-col justify-center items-start z-10">
                        <h1 className="text-5xl md:text-6xl font-prata font-bold leading-tight text-[#1a1a1a] mb-6">
                            Discover<br />
                            <span className="text-[#c1a875]">Timeless Fashion</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#444] font-montserrat mb-8 max-w-lg">
                            Step into elegance. Shop the latest designer collections crafted for every moment.
                        </p>
                        <button className="px-10 py-4 bg-white border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition rounded-2xl shadow-md font-semibold font-montserrat text-lg">
                            Shop Now
                        </button>
                    </div>

                    {/* Image */}
                    <div className="hidden lg:flex flex-1 items-center justify-center mt-10 lg:mt-0 relative z-10">
                        <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80" alt="Fashion model" className="w-[320px] h-[440px] object-cover rounded-2xl shadow-xl border border-[#eee] transition" />
                        <div className="absolute top-16 right-[-60px] w-[280px] h-[280px] rounded-full bg-[#c1a875]/20 blur-3xl z-[-1]" />
                    </div>
                </section>


                {/* Latest Collections Section */}
                <section className="w-full py-12 md:py-20">
                    {/* Title */}
                    <div className="flex flex-col items-center mb-10 px-3 md:px-0">
                        <h2 className="font-prata text-3xl md:text-5xl text-[#181818] mb-2 tracking-tight">
                            Latest Collections
                        </h2>
                        <p className="text-sm md:text-lg text-[#555] font-montserrat text-center max-w-xs md:max-w-md">
                            Fresh arrivals for the season. Stand out with style.
                        </p>
                    </div>

                    {/* Products */}
                    <div className="w-full max-w-[1280px] mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 px-4 md:px-0">
                            {demoData.map((item) => (
                                <div key={item.id} onClick={() => nav(`/product/${item.id}`)} className="flex flex-col items-center group cursor-pointer">
                                    {/* Image */}
                                    <div className="w-[170px] h-[210px] md:w-[220px] md:h-[280px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
                                        <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6", }} />
                                    </div>
                                    <div className="flex flex-col items-center w-full">
                                        <h3 className="font-prata text-base md:text-lg text-[#232323] mb-1 text-center">
                                            {item.title}
                                        </h3>
                                        <p className="font-bold text-sm md:text-base text-center mb-1 text-[#1a1a1a]">
                                            ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* best sellers section */}
                <section className="w-full py-12 md:py-20">
                    {/* Title */}
                    <div className="flex flex-col items-center mb-10 px-3 md:px-0">
                        <h2 className="font-prata text-3xl md:text-5xl text-[#181818] mb-2 tracking-tight">
                            Best Sellers
                        </h2>
                        <p className="text-sm md:text-lg text-[#555] font-montserrat text-center max-w-xs md:max-w-md">
                            Our most popular products loved by our customers.
                        </p>
                    </div>

                    {/* Products */}
                    <div className="w-full max-w-[1280px] mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 px-4 md:px-0">
                            {demoData.slice(0, 5).map((item) => (
                                <div key={item.id} onClick={() => nav(`/product/${item.id}`)} className="flex flex-col items-center group cursor-pointer">
                                    {/* Image */}
                                    <div className="relative w-[170px] h-[210px] md:w-[220px] md:h-[280px] flex items-center justify-center overflow-hidden mb-4 md:mb-5">
                                        <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 active:scale-95 rounded-2xl" style={{ background: "#faf8f6" }} />
                                        {/* Badge */}
                                        <span className="absolute top-3 left-3 bg-[#c1a875] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wide">
                                            Best Seller
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center w-full">
                                        <h3 className="font-prata text-base md:text-lg text-[#232323] mb-1 text-center">
                                            {item.title}
                                        </h3>
                                        <p className="font-bold text-sm md:text-base text-center mb-1">
                                            ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Policy Section */}
                <section className="w-full py-10 md:py-16">
                    <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between gap-8 md:gap-0">
                        {/* Exchange */}
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="mb-4 text-[#c1a875]">
                                <FiRefreshCw size={38} />
                            </div>
                            <p className="font-semibold text-lg md:text-xl mb-1 text-[#181818]">
                                Easy Exchange Policy
                            </p>
                            <p className="text-gray-500 text-sm md:text-base">
                                We offer a hassle-free exchange within 7 days on all products.
                            </p>
                        </div>
                        {/* Return */}
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="mb-4 text-[#c1a875]">
                                <FiShield size={38} />
                            </div>
                            <p className="font-semibold text-lg md:text-xl mb-1 text-[#181818]">
                                7 Day Return Policy
                            </p>
                            <p className="text-gray-500 text-sm md:text-base">
                                Changed your mind? Return products within 7 days, no questions asked.
                            </p>
                        </div>
                        {/* Customer Support */}
                        <div className="flex flex-col items-center text-center flex-1 px-4">
                            <div className="mb-4 text-[#c1a875]">
                                <FiHeadphones size={38} />
                            </div>
                            <p className="font-semibold text-lg md:text-xl mb-1 text-[#181818]">
                                24/7 Customer Support
                            </p>
                            <p className="text-gray-500 text-sm md:text-base">
                                Our team is here for you anytime — chat, call, or email us for help.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div>
    )
}