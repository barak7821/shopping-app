"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Theme from "./ThemeSwitcher";

export default function SideBar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:block">
            <aside className="lg:flex sticky top-8 max-h-[calc(100vh-8rem)] h-screen flex-col shrink-0 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl p-6 self-start overflow-y-auto">
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
                            { text: "Customers", link: "/customers", aria: "Customers" },
                            { text: "Archived Products", link: "/archivedProducts", aria: "Archived Products" },
                            { text: "Deleted Customers", link: "/deletedCustomers", aria: "Deleted Customers" },
                            { text: "Hero Section Editor", link: "/hero", aria: "Hero" },
                            { text: "Best Sellers Editor", link: "/bestSeller", aria: "Best Sellers" },
                            { text: "Contact Info Editor", link: "/contact", aria: "Contact Info" },
                            { text: "Activity Logs", link: "/logs", aria: "Activity Logs" },
                            { text: "Notification Emails", link: "/notifications", aria: "Notification Emails" },
                        ].map((item, index) => {
                            const isActive = pathname === item.link;

                            return (
                                <li key={index}>
                                    <Link href={item.link} aria-label={item.aria} className={
                                        isActive
                                            ? "text-[#c1a875] font-semibold"
                                            : "text-neutral-800 dark:text-neutral-100 hover:text-[#c1a875]"
                                    }>
                                        {item.text}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-3">
                    {/* Logout button */}
                    <button onClick={() => { localStorage.removeItem("token"), window.location.reload() }} className="px-8 py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
                        Logout
                    </button>

                    {/* Theme */}
                    <Theme />
                </div>

            </aside>
        </div>
    )
}
