import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { errorLog, log } from '../utils/log'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import Loading from '../components/Loading';
import { useAuth } from '../utils/AuthContext'
import { getNames } from 'country-list';
import stringSimilarity from 'string-similarity';
import AboutCard from '../components/AboutCard';
import Footer from '../components/Footer';
import { FiX } from "react-icons/fi"
import { fetchUserData, handleUpdateUser, verifyPassword } from '../utils/api'

export default function Profile() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
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
    const [errorPassword, setErrorPassword] = useState("")


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
            notyf.error("Something went wrong. Please try again later.")
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
                notyf.error("Wrong password!")
                setLoading(false)
                return
            }
            setVerifyByPassword(false)
            setPassword("")
            await handleClick()
        } catch (error) {
            errorLog("Error in handlePasswordConfirm", error)
            notyf.error("Something went wrong. Please try again.")
            setErrorPassword("Something went wrong. Please try again.")
        }
        setLoading(false)
    }


    // Function to update user data in server
    const handleClick = async () => {
        log("Updating user data", name, email, phone, street, city, zip, country)

        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        // Check if name is less than 3 characters
        if (name.length < 3) {
            notyf.error("Name must be at least 3 characters long")
            errorLog("Name must be at least 3 characters long")
            setError(true)
            return
        }

        // Check if email is valid
        if (!email.includes("@")) {
            notyf.error("Invalid email format")
            errorLog("Invalid email format")
            setError(true)
            return
        }

        // If phone number is provided, check if it is valid
        if (phone && phone.length !== 10) {
            notyf.error("Invalid phone number format")
            log("Invalid phone number format")
            return
        }

        if (phone && !phone.match(/^[0-9]+$/)) {
            notyf.error("Invalid phone number format")
            log("Invalid phone number format")
            return
        }

        // If zip code is provided, check if it is valid
        if (zip && zip.length < 4) {
            notyf.error("Invalid zip code format")
            log("Invalid zip code format")
            return
        }

        // If country is provided, check if it is valid
        if (country && match.bestMatch.rating < 0.7) {
            setMatchCountry(match.bestMatch.target)
            notyf.error("Invalid country")
            log("Invalid country")
            return
        } else {
            setMatchCountry("")
        }

        // Set object to update user data
        const userData = {}

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
            const data = await handleUpdateUser(userData)
            notyf.success("User data updated successfully!")
            log("User data updated successfully", userData)
        } catch (error) {
            errorLog("Failed to update user data", error)
            notyf.error("Something went wrong. Please try again later.")
        }
    }

    // Function to remove saved address
    const removeAddress = () => {
        setStreet("")
        setCity("")
        setZip("")
        setCountry("")

        log("Removing address")
        setAddress(prev => !prev)
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen bg-[#faf8f6] flex flex-col font-montserrat">
            <NavBar />
            <div className="flex-1 flex flex-col items-center py-12">
                <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] mb-10 tracking-tight">
                    Profile
                </h1>

                {/* User Details */}
                <div className="bg-white/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7 max-w-2xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-[#232323] text-sm">Name</label>
                            <input onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, ""))} value={name.replace(/\b\w/g, l => l.toUpperCase())} type="text" placeholder="Full Name" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-[#232323] text-sm">Email</label>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-[#232323] text-sm">Phone</label>
                            <div className="flex items-center gap-3">
                                <input onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" maxLength={10} value={phone} type="tel" placeholder="Phone" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 flex-1" />

                                {/* Remove Phone Button */}
                                {phone &&
                                    <button onClick={() => setPhone("")} className="flex items-center pl-5 pr-6 py-2 rounded-xl border border-red-300 bg-red-50 text-red-500 font-medium shadow-sm transition hover:bg-red-100 active:scale-95 gap-2.5">
                                        <FiX className="w-5 h-5" />
                                        Remove
                                    </button>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Address Button */}
                    {!Address && (
                        <button onClick={() => setAddress(prev => !prev)} className="mx-auto mt-4 px-6 py-2 rounded-xl border border-[#c1a875] bg-white text-[#c1a875] font-medium transition hover:bg-[#c1a875]/10 hover:text-[#1a1a1a] shadow-sm">
                            {street || city || zip || country ? "Update Shipping Address" : "Add Shipping Address"}
                        </button>
                    )}

                    {/* Address */}
                    {Address &&
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            {/* Street */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-[#232323] text-sm">Street</label>
                                <input onChange={(e) => setStreet(e.target.value)} value={street.replace(/\b\w/g, l => l.toUpperCase())} type="text" placeholder="Street" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
                            </div>

                            {/* City */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-[#232323] text-sm">City</label>
                                <input onChange={(e) => setCity(e.target.value)} value={city.replace(/\b\w/g, l => l.toUpperCase())} type="text" placeholder="City" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
                            </div>

                            {/* Zip Code */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-[#232323] text-sm">Zip Code</label>
                                <input onChange={(e) => setZip(e.target.value)} value={zip} type="text" placeholder="Zip Code" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
                            </div>

                            {/* Country */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-[#232323] text-sm">Country</label>
                                <input onChange={(e) => setCountry(e.target.value)} value={country.replace(/\b\w/g, l => l.toUpperCase())} type="text" placeholder="Country" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />

                                {/* Matched country */}
                                {matchCountry && (
                                    <div className="flex gap-2 items-center mt-1">
                                        <p className="text-xs text-[#c1a875]">
                                            Did you mean: <span className="font-semibold">{matchCountry}</span>?
                                        </p>
                                        <button onClick={() => setCountry(matchCountry)} className="text-xs underline text-[#c1a875]">
                                            Use suggestion
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Remove Address Button */}
                            <button onClick={removeAddress} className="flex items-center pl-5 pr-6 py-2 rounded-xl border border-red-300 bg-red-50 text-red-500 font-medium shadow-sm transition hover:bg-red-100 active:scale-95 gap-2.5 whitespace-nowrap">
                                <FiX className="w-5 h-5" />
                                Delete Shipping Address
                            </button>
                        </div>
                    }

                    {/* Update Button */}
                    <button onClick={() => setVerifyByPassword(true)} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95">
                        Update
                    </button>
                </div>
            </div>

            {/*  Modal for password verification */}
            {verifyByPassword &&
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full flex flex-col p-8 gap-5 animate-fadeIn">
                        <h2 className="text-2xl font-prata font-bold text-[#232323] mb-2 text-center">
                            Confirm Your Password
                        </h2>
                        <p className="text-base text-[#666] text-center mb-2">
                            For security, please enter your password to update your details.
                        </p>
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 text-base font-montserrat bg-neutral-50 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" autoFocus />
                        {errorPassword && (
                            <p className='text-sm text-red-500 text-center'>
                                {errorPassword}
                            </p>
                        )}

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setVerifyByPassword(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold transition hover:bg-gray-100 hover:text-black active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordConfirm}
                                className="flex-1 py-3 rounded-xl bg-[#c1a875] text-white font-semibold shadow-sm border border-[#c1a875] transition hover:bg-[#a68c5a] hover:text-white active:scale-95"
                            >
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
