import { NavLink } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

            <div className="flex flex-1 w-full max-w-7xl mx-auto gap-12 pt-8 pb-20 px-4">

                {/* Sidebar */}
                <aside className="lg:flex flex-col shrink-0 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl p-6 h-full self-start mt-8">
                    <div className="flex items-center justify-center mb-6 border-b border-gray-200 dark:border-neutral-700 pb-3">
                        <h2 className="text-2xl font-bold text-[#181818] dark:text-neutral-100">
                            Admin Panel
                        </h2>
                    </div>

                    <nav className="flex-1">
                        <ul className="space-y-4">
                            {[
                                { text: "Dashboard", link: "/", aria: "Dashboard" },
                                { text: "Products", link: "/", aria: "Products" },
                                { text: "Orders", link: "/", aria: "Orders" },
                                { text: "Customers", link: "/", aria: "Customers" }
                            ].map((item, index) => (
                                <li key={index}>
                                    <NavLink
                                        to={item.link}
                                        aria-label={item.aria}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "text-[#c1a875] font-semibold"
                                                : "text-neutral-800 dark:text-neutral-100 hover:text-[#c1a875]"
                                        }>
                                        {item.text}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

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
