import NavBar from "../components/NavBar"
import AboutCard from "../components/AboutCard"
import Footer from "../components/Footer"

export default function About() {
    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            <NavBar />
            <div className="flex-1 w-full max-w-6xl mx-auto pt-12 pb-20 flex flex-col items-center">
                <h1 className="font-prata text-5xl text-[#181818] dark:text-neutral-100 mb-10 text-center tracking-wide">About Us</h1>
                <p className="text-xl text-[#444] dark:text-neutral-300 mb-14 text-center max-w-2xl">
                    Welcome to our designer-inspired clothing store! We believe fashion should be accessible, unique, and sustainable.<br />
                    Browse our handpicked collection of trends and timeless classics for everyone.
                </p>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-[#c1a875]">Our Mission</h2>
                        <p className="text-base text-[#555] dark:text-neutral-300 text-center">
                            To provide a premium shopping experience with high-quality clothing, fast shipping, and friendly support.
                        </p>
                    </section>
                    <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-[#c1a875]">Why Shop With Us?</h2>
                        <ul className="list-disc pl-4 text-[#555] dark:text-neutral-300 space-y-2 text-base text-left">
                            <li>Trending & classic styles</li>
                            <li>Inclusive sizes</li>
                            <li>Easy-to-use filters</li>
                            <li>Fast & secure checkout</li>
                            <li>Friendly support</li>
                        </ul>
                    </section>
                    <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-[#c1a875]">Contact Us</h2>
                        <p className="text-base text-[#555] dark:text-neutral-300 text-center">
                            Have questions or feedback?<br />
                            Reach out via our <span className="underline">Contact</span> page.
                        </p>
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
