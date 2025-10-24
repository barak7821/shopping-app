import { NavLink } from "react-router-dom";

export default function SideBar() {
    return (
        <div className="hidden lg:block">
            <aside className="lg:flex flex-col shrink-0 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl p-6 h-full self-start">
                <div className="flex items-center justify-center mb-6 border-b border-gray-200 dark:border-neutral-700 pb-3">
                    <h2 className="text-2xl font-bold text-[#181818] dark:text-neutral-100">
                        Admin Panel
                    </h2>
                </div>

                <nav className="flex-1">
                    <ul className="space-y-4">
                        {[
                            { text: "Dashboard", link: "/", aria: "Dashboard" },
                            { text: "Products", link: "/products", aria: "Products" },
                            { text: "Orders", link: "/orders", aria: "Orders" },
                            { text: "Customers", link: "/customers", aria: "Customers" }
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
        </div>
    )
}
