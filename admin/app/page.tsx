"use client"
import SideBar from "./components/SideBar";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                
                {/* Sidebar */}
                <SideBar />

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center">
                    <h1 className="font-prata text-5xl text-[#181818] dark:text-neutral-100 mb-10 text-center tracking-wide">
                        Admin Panel
                    </h1>
                    <p className="text-xl text-[#444] dark:text-neutral-300 mb-14 text-center max-w-2xl">
                        Welcome to the Admin Panel. Here you can manage products, view orders, and handle customer inquiries to keep your online clothing store running smoothly.
                    </p>
                </main>

            </div>
        </div>
    )
}
