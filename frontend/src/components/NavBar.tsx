import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import type { AuthContextValue } from '../context/AuthContext';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FiUser, FiSearch, FiShoppingCart, FiMenu, FiX } from "react-icons/fi"
import { useCart } from '../context/CartContext';
import Theme from './ThemeSwitcher';
import SearchBar from './SearchBar';

export default function NavBar() {
    const [cartCount, setCartCount] = useState(0)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const { isAuthenticated, isAdmin, provider } = useAuth() as AuthContextValue
    const { cart } = useCart()
    const token = localStorage.getItem("token")

    useEffect(() => {
        if (cart) {
            const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
            setCartCount(totalItems)
        }
    }, [cart])

    const logout = () => {
        localStorage.removeItem('token')
        window.location.reload()
    }

    if (searchOpen) {
        return (
            <SearchBar setSearchOpen={setSearchOpen} />
        )
    }

    return (
        <>
            {/* Big Screen */}
            <div className="w-full bg-white dark:bg-neutral-900 hidden lg:block sticky top-0 z-40 shadow-sm transition-all duration-200">
                <div className="max-w-screen-xl mx-auto grid [grid-template-columns:1fr_auto_1fr] items-center py-4 px-6 min-h-[64px]">
                    {/* Logo */}
                    <img src="https://www.trafongroup.com/wp-content/uploads/2019/04/logo-placeholder.png" alt="Logo" aria-label='Logo' className="h-8" />
                    {/* Navigation */}
                    <ul className='flex justify-center items-center gap-8 font-montserrat font-medium'>
                        {[{ text: "HOME", link: "/", aria: "Home" },
                        { text: "COLLECTION", link: "/collection", aria: "Collection" },
                        { text: "ABOUT", link: "/about", aria: "About" },
                        { text: "CONTACT", link: "/contact", aria: "Contact" }].map((item, index) => (
                            <li key={index}>
                                <NavLink to={item.link} aria-label={item.aria} className={({ isActive }) => isActive
                                    ? "text-neutral-800 dark:text-white border-b border-neutral-800 dark:border-white pb-1"
                                    : "text-neutral-800 dark:text-white"}>
                                    {item.text}
                                </NavLink>
                            </li>
                        ))}
                        {isAdmin && <li>
                            <NavLink to={`${import.meta.env.VITE_ADMIN_PANEL_URL}?token=${token}`} aria-label='Admin' className={({ isActive }) => isActive
                                ? "text-neutral-800 dark:text-white border-b border-neutral-800 dark:border-white pb-1 whitespace-nowrap"
                                : "text-neutral-800 dark:text-white whitespace-nowrap"}>
                                ADMIN PANEL
                            </NavLink>
                        </li>
                        }
                    </ul>

                    {/* Right - Icons */}
                    <div className="flex justify-end items-center gap-8">
                        {/* Search */}
                        <button aria-label="Search" onClick={() => setSearchOpen(true)}>
                            <FiSearch size={20} className="w-5 cursor-pointer text-neutral-800 dark:text-white" />
                        </button>
                        {/* Profile */}
                        {isAuthenticated === true ?
                            <Menu as="div" className="relative inline-block text-left">
                                <MenuButton className="pt-1.5" aria-label='Menu'>
                                    <FiUser size={20} className="w-5 cursor-pointer text-neutral-800 dark:text-white" />
                                </MenuButton>
                                <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-700 ring-opacity-5 focus:outline-none z-50">
                                    {(
                                        provider === "google"
                                            ? [
                                                { text: "My Profile", link: "/profile", aria: "Profile" },
                                                { text: "My Orders", link: "/orders", aria: "Orders" },
                                            ]
                                            : [
                                                { text: "My Profile", link: "/profile", aria: "Profile" },
                                                { text: "My Orders", link: "/orders", aria: "Orders" },
                                                { text: "Change Password", link: "/password", aria: "Change-Password" }
                                            ]
                                    ).map((item, index) => (
                                        <MenuItem key={index} as="div">
                                            <Link to={item.link} aria-label={item.aria} className="block px-4 py-2 text-sm text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-gray-900">
                                                {item.text}
                                            </Link>
                                        </MenuItem>
                                    ))}
                                    <MenuItem as="div">
                                        <button onClick={logout} aria-label='Logout' className="w-full text-left block px-4 py-2 text-sm text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-gray-900 cursor-pointer">
                                            Logout
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                            : <Link to="/login" aria-label='Login'>
                                <FiUser size={20} className="w-5 cursor-pointer text-neutral-800 dark:text-white" />
                            </Link>}
                        {/* Cart */}
                        <Link to="/cart" aria-label='Cart' className='relative'>
                            <FiShoppingCart size={20} className="w-5 min-w-5 text-neutral-800 dark:text-white" />
                            {cartCount > 0 &&
                                <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black dark:bg-neutral-100 text-white dark:text-neutral-900 aspect-square rounded-full text-[8px]">
                                    {cartCount}
                                </p>
                            }
                        </Link>

                        {/* Theme */}
                        <Theme />
                    </div>
                </div >
            </div>

            {/* Mobile Nav */}
            <div className="flex justify-between items-center py-4 px-6 min-h-[64px] lg:hidden bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white">
                {/* Logo */}
                <div className=''>
                    <img src="https://www.trafongroup.com/wp-content/uploads/2019/04/logo-placeholder.png" alt="Logo" className="h-8" />
                </div>
                {/* Right - Icons */}
                <div className="flex items-center gap-4 ml-4">
                    {/* Search */}
                    <button aria-label="Search" onClick={() => setSearchOpen(true)}>
                        <FiSearch size={20} className="w-5 cursor-pointer text-neutral-800 dark:text-white" />
                    </button>
                    {/* Profile */}
                    {isAuthenticated === true ?
                        <Menu as="div" className="relative inline-block">
                            <MenuButton className="pt-1.5" aria-label='Menu'>
                                <FiUser size={20} className="w-5 cursor-pointer text-neutral-800 dark:text-white" />
                            </MenuButton>
                            <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-700 ring-opacity-5 focus:outline-none z-50">
                                {[{ text: "My Profile", link: "/profile", aria: "Profile" },
                                { text: "My Orders", link: "/orders", aria: "Orders" },
                                { text: "Change Password", link: "/password", aria: "Change-Password" }].map((item, index) => (
                                    <MenuItem key={index} as="div">
                                        <Link to={item.link} aria-label={item.aria} className="block px-4 py-2 text-sm text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-gray-900">
                                            {item.text}
                                        </Link>
                                    </MenuItem>
                                ))}
                                <MenuItem as="div">
                                    <button onClick={logout} aria-label='Logout' className="w-full text-left block px-4 py-2 text-sm text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-gray-900 cursor-pointer">
                                        Logout
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                        : <Link to="/login" aria-label='Menu'>
                            <FiUser size={20} className="w-5 cursor-pointer text-neutral-800 dark:text-white" />
                        </Link>}
                    {/* Cart */}
                    <Link to="/cart" aria-label='Cart' className='relative'>
                        <FiShoppingCart size={20} className="w-5 text-neutral-800 dark:text-white" />
                        {cartCount > 0 &&
                            <p className="absolute right-[-5px] bottom-[-5px] w-4 h-4 flex items-center justify-center bg-black dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-full text-[8px]">
                                {cartCount}
                            </p>
                        }
                    </Link>
                    {/* Menu Button */}
                    <button onClick={() => setMobileOpen(true)} aria-label="Open Menu">
                        <FiMenu size={20} className='w-8 cursor-pointer text-neutral-800 dark:text-white' />
                    </button>
                </div>
            </div>

            {/* Drawer / Overlay Menu */}
            {mobileOpen &&
                <div className="fixed inset-0 z-40 bg-black/40 lg:hidden">
                    {/* Drawer */}
                    <div className="relative w-full bg-white dark:bg-neutral-800 h-full shadow-lg flex flex-col z-50 text-neutral-800 dark:text-white">
                        {/* X icon */}
                        <button className="absolute top-4 right-4" onClick={() => setMobileOpen(false)} aria-label="Close Menu">
                            <FiX size={20} className='w-5 cursor-pointer text-neutral-800 dark:text-white' />
                        </button>
                        <nav className="mt-16 flex flex-col gap-2 px-6 font-montserrat font-medium h-full">
                            {[
                                { name: 'HOME', link: '/', label: 'Home' },
                                { name: 'COLLECTION', link: '/collection', label: 'Collection' },
                                { name: 'ABOUT', link: '/about', label: 'About' },
                                { name: 'CONTACT', link: '/contact', label: 'Contact' }
                            ].map((item, index) => (
                                <NavLink key={index} to={item.link} aria-label={item.label} onClick={() => setMobileOpen(false)} className="py-2 border-b text-neutral-800 dark:text-white">{item.name}</NavLink>
                            ))}
                            {/* ADMIN */}
                            {isAuthenticated &&
                                <NavLink to="/admin" aria-label='Admin' onClick={() => setMobileOpen(false)} className="py-2 border-b text-neutral-800 dark:text-white">ADMIN PANEL</NavLink>
                            }
                            <div className='mt-auto mb-6 flex items-center justify-center gap-4'>
                                <Theme />
                            </div>
                        </nav>
                    </div>
                </div>
            }
        </>
    )
}
