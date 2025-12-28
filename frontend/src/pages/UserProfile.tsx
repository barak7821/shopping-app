import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { errorLog, log } from '../lib/logger'
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext'
import { getNames } from 'country-list';
import stringSimilarity from 'string-similarity';
import AboutCard from '../components/AboutInfoCard';
import Footer from '../components/Footer';
import { fetchUserData, handleDeleteUser, handleUpdateUser, verifyPassword } from '../api/apiClient'
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useNotyf } from '../hooks/useNotyf'
import type { UserProfile } from '../types/types'

export default function Profile() {
    const notyf = useNotyf()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [street, setStreet] = useState("")
    const [city, setCity] = useState("")
    const [zip, setZip] = useState("")
    const [country, setCountry] = useState("")
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuth()
    const [matchCountry, setMatchCountry] = useState("")
    const countries = getNames() // Get all country names
    const match = stringSimilarity.findBestMatch(country.toLocaleLowerCase(), countries) // find best match between user input and all country names
    const [Address, setAddress] = useState(false)
    const [verifyByPassword, setVerifyByPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [errorPassword, setErrorPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(false)
    const [isDeleteBtn, setIsDeleteBtn] = useState(false)


    // get user data from server on load
    const getUserData = async () => { // if user not logged in, return
        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        try {
            const data = await fetchUserData()

            // Update states with fetched data
            setName(data?.name || "")
            setEmail(data?.email || "")
            setPhone(data?.phone || "")
            setStreet(data?.street || "")
            setCity(data?.city || "")
            setZip(data?.zip || "")
            setCountry(data?.country || "")

            setLoading(false)
        } catch (error) {
            errorLog("Failed to fetch user data", error)
            notyf?.error("Something went wrong. Please try again later.")
            setLoading(false)
        }
    }

    // fetch user data on load
    useEffect(() => {
        setLoading(true)
        getUserData()
    }, [isAuthenticated])

    const handlePasswordConfirm = async () => {
        setLoading(true)
        try {
            const valid = await verifyPassword(password)
            if (!valid) {
                notyf?.error("Wrong password!")
                setLoading(false)
                return
            }
            setVerifyByPassword(false)
            setPassword("")

            // Check if delete button is clicked
            isDeleteBtn === true
                ? await handleDeleteAccountBtn() // If delete button is clicked, delete user
                : await handleUpdateUserInfo() // If update button is clicked, update user

        } catch (error) {
            errorLog("Error in handlePasswordConfirm", error)
            setErrorPassword(true)
        } finally {
            setLoading(false)
        }
    }


    // Function to update user data in server
    const handleUpdateUserInfo = async () => {
        log("Updating user data", name, email, phone, street, city, zip, country)

        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        // Set object to update user data
        const userData: UserProfile = {}

        // Only update fields that are provided
        if (name) userData.name = name
        if (email) userData.email = email
        if (phone || phone === "") userData.phone = phone
        if (street || street === "") userData.street = street.toLowerCase()
        if (city || city === "") userData.city = city.toLowerCase()
        if (zip || zip === "") userData.zip = zip
        if (country || country === "") userData.country = country.toLowerCase()

        // Update user data
        try {
            await handleUpdateUser(userData)
            notyf?.success("User data updated successfully!")
            log("User data updated successfully", userData)
        } catch (error) {
            errorLog("Failed to update user data", error)
            notyf?.error("Something went wrong. Please try again later.")
        }
    }

    const closeModal = () => {
        setVerifyByPassword(false)
        setPassword("")
        setErrorPassword(false)
        setError(false)
    }

    const handleUpdateBtn = () => {

        // Input validation
        if (!name || !email) {
            notyf?.error("Name and Email are required")
            setError(true)
            errorLog("Name and Email are required")
            return
        }

        // Check if name is less than 3 characters
        if (name.length < 3) {
            errorLog("Name must be at least 3 characters long")
            setError(true)
            return
        }

        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            setError(true)
            log("Invalid email format")
            return
        }

        // If phone number is provided, check if it is valid
        if (phone && !/^\d{10}$/.test(phone)) {
            setError(true)
            log("Invalid phone number format")
            return
        }

        // If zip code is provided, check if it is valid
        if (zip && zip.length < 4) {
            setError(true)
            log("Invalid zip code format")
            return
        }

        // If country is provided, check if it is valid
        if (country && match.bestMatch.rating < 0.7) {
            setMatchCountry(match.bestMatch.target)
            setError(true)
            log("Invalid country")
            return
        } else {
            setMatchCountry("")
        }

        setVerifyByPassword(true)
    }

    const handleDeleteAccountBtn = async () => {
        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        try {
            log("Deleting account")
            const data = await handleDeleteUser()
            notyf?.success("Account deleted successfully!")
            log("Account deleted successfully", data)
            window.location.reload()
        } catch (error) {
            errorLog("Error in handleDeleteAccount", error)
            notyf?.error("Something went wrong. Please try again.")
            setLoading(false)
        }

    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex flex-col font-montserrat">
            <NavBar />
            <div className="flex-1 flex flex-col items-center py-12">
                <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] dark:text-neutral-100 mb-10 tracking-tight">Profile</h1>

                {/* User Details */}
                <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7 max-w-2xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor='name' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Name {error && name.length < 3 && <span className="text-red-500">*</span>}</label>
                            <input onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, ""))} value={name.replace(/\b\w/g, l => l.toUpperCase())} id='name' type="text" placeholder="Full Name" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                            {error && name.length < 3 ?
                                <p className="text-xs text-red-500 pl-1 mt-1">Name must be at least 3 characters long</p>
                                : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter your full name. It should be at least 3 characters long.</p>
                            }
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor='email' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Email {error && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) && <span className="text-red-500">*</span>}</label>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} id='email' type="email" placeholder="Email" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                            {error && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) ?
                                <p className="text-xs text-red-500 pl-1 mt-1">Invalid email format</p>
                                : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a valid email address.</p>
                            }
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor='phone' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Phone
                                {error && phone && !/^\d{10}$/.test(phone)
                                    ? <span className="text-red-500">* <span className="font-normal italic text-black dark:text-white"> - Optional</span></span>
                                    : <span className="font-normal italic"> - Optional</span>
                                }</label>
                            <input onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))} id='phone' inputMode="numeric" maxLength={10} value={phone} type="tel" placeholder="Phone" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 flex-1" />
                            {error && phone && !/^\d{10}$/.test(phone)
                                ? <p className="text-xs text-red-500 pl-1 mt-1">Invalid phone number format</p>
                                : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a valid phone number.</p>
                            }
                        </div>
                    </div>

                    {/* Address Button */}
                    {!Address && (
                        <button onClick={() => setAddress(prev => !prev)} className="mx-auto mt-4 px-6 py-2 rounded-xl border border-[#c1a875] text-[#c1a875] font-medium transition bg-white dark:bg-neutral-700 dark:text-[#c1a875] hover:bg-[#c1a875]/10 hover:text-[#1a1a1a] dark:hover:bg-[#c1a875]/20 shadow-sm cursor-pointer">
                            {street || city || zip || country ? "Update Shipping Address" : "Add Shipping Address"}
                        </button>
                    )}

                    {/* Address */}
                    {Address &&
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            {/* Street */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor='street' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Street <span className="font-normal italic"> - Optional</span></label>
                                <input onChange={(e) => setStreet(e.target.value)} value={street.replace(/\b\w/g, l => l.toUpperCase())} id='street' type="text" placeholder="Street" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                            </div>

                            {/* City */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor='city' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">City <span className="font-normal italic"> - Optional</span></label>
                                <input onChange={(e) => setCity(e.target.value)} value={city.replace(/\b\w/g, l => l.toUpperCase())} id='city' type="text" placeholder="City" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                            </div>

                            {/* Zip Code */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor='zip' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Zip Code
                                    {error && zip && zip.length < 4
                                        ? <span className="text-red-500">* <span className="font-normal italic text-black dark:text-white"> - Optional</span></span>
                                        : <span className="font-normal italic"> - Optional</span>
                                    }
                                </label>
                                <input onChange={(e) => setZip(e.target.value)} value={zip} id='zip' type="text" placeholder="Zip Code" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                                {error && zip && zip.length < 4
                                    ? <p className="text-xs text-red-500 pl-1 mt-1">Invalid zip code format</p>
                                    : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a zip code number.</p>
                                }
                            </div>

                            {/* Country */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor='country' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Country
                                    {error && country && match.bestMatch.rating < 0.7
                                        ? <span className="text-red-500">* <span className="font-normal italic text-black dark:text-white"> - Optional</span></span>
                                        : <span className="font-normal italic"> - Optional</span>
                                    }
                                </label>
                                <input onChange={(e) => setCountry(e.target.value)} value={country.replace(/\b\w/g, l => l.toUpperCase())} id='country' type="text" placeholder="Country" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />

                                {/* Matched country */}
                                {matchCountry &&
                                    <div className="flex gap-2 items-center mt-1">
                                        <p className="text-xs text-[#c1a875]">
                                            Did you mean: <span className="font-semibold">{matchCountry}</span>?
                                        </p>
                                        <button onClick={() => setCountry(matchCountry)} className="text-xs underline text-[#c1a875] cursor-pointer hover:text-[#7d6d4d] ">Use suggestion</button>
                                    </div>
                                }
                            </div>
                        </div>
                    }

                    {/* Update Button */}
                    <button onClick={handleUpdateBtn} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer">
                        Update
                    </button>

                    {/* Delete Account Button */}
                    <button onClick={() => { setVerifyByPassword(true); setIsDeleteBtn(true) }} className="w-full mt-4 py-4 rounded-2xl border border-red-500 text-red-600 font-semibold text-lg shadow-md transition hover:bg-red-500 hover:text-white active:scale-95 cursor-pointer">
                        Delete Account
                    </button>
                </div>
            </div>

            {/*  Modal for password verification */}
            {verifyByPassword &&
                <div onClick={closeModal} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col p-8 gap-5 animate-fadeIn">
                        <h2 className="text-2xl font-prata font-bold text-[#232323] dark:text-neutral-100 mb-2 text-center">
                            Confirm Your Password
                        </h2>
                        <p className="text-base text-[#666] dark:text-neutral-300 text-center mb-2">
                            For security, please enter your password to update your details.
                        </p>

                        <div className='relative'>
                            <input type={showPassword ? "text" : "password"} placeholder='Password...' value={password} onChange={e => setPassword(e.target.value)} autoComplete='off' className="border border-gray-200 dark:border-neutral-700 rounded-xl w-full px-4 py-3 text-base font-montserrat bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" autoFocus />
                            {password &&
                                <button className='absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                                </button>
                            }
                        </div>

                        {errorPassword && (
                            <p className='text-sm text-red-500 text-center'>Something went wrong. Please try again.</p>
                        )}

                        <div className="flex gap-4 mt-4">
                            <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700 text-gray-700 dark:text-neutral-100 font-semibold transition hover:bg-gray-100 dark:hover:bg-neutral-600 hover:text-black active:scale-95 cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handlePasswordConfirm} className="flex-1 py-3 rounded-xl bg-[#c1a875] text-white font-semibold shadow-sm border border-[#c1a875] transition hover:bg-[#a68c5a] hover:text-white active:scale-95 cursor-pointer">
                                Confirm & Update
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* About Section */}
            <AboutCard />

            {/* Footer */}
            <Footer />
        </div >
    )
}
