import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import axios from 'axios'
import { errorLog, log } from '../utils/log'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import Loading from '../components/Loading';
import { useAuth } from '../utils/AuthContext'
import { getNames } from 'country-list';
import stringSimilarity from 'string-similarity';

export default function Profile() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [street, setStreet] = useState("")
    const [city, setCity] = useState("")
    const [zip, setZip] = useState("")
    const [country, setCountry] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuth()
    const [matchCountry, setMatchCountry] = useState("")
    const countries = getNames() // Get all country names
    const match = stringSimilarity.findBestMatch(country.toLocaleLowerCase(), countries) // find best match between user input and all country names

    // get user data from server on load if user logged in
    const fetchUserData = async () => { // if user not logged in, return
        if (!isAuthenticated) {
            setLoading(false)
            return
        }
        const token = localStorage.getItem("token") // get token from local storage

        try {
            const { data } = await axios.get("http://localhost:3000/api/user", {
                headers: { Authorization: `Bearer ${token}` }
            })
            log("User data:", data) // log user data

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
        fetchUserData()
    }, [isAuthenticated])

    const handleClick = async () => {

        // If country is not valid, show error
        if (match.bestMatch.rating < 0.7) {
            setMatchCountry(match.bestMatch.target)
            notyf.error("Invalid country")
            log("Invalid country")
            return
        } else {
            setMatchCountry("")
        }

    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div>
            {/* NavBar */}
            <NavBar />
            <div className='flex flex-col items-center p-4 min-h-screen'>
                <h1>Profile</h1>

                {/* User Details */}
                <div className="p-7 md:p-12 flex flex-col gap-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <label>Name</label>
                            <input onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, ""))} value={name.replace(/\b\w/g, l => l.toUpperCase())} type="text" placeholder="Full Name" />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label>Email</label>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-2">
                            <label>Phone</label>
                            <input onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" maxLength={10} value={phone} type="tel" placeholder="Phone" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                        {/* Street */}
                        <div className="flex flex-col gap-2">
                            <label>Street</label>
                            <input onChange={(e) => setStreet(e.target.value)} value={street} type="text" placeholder="Street" />
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-2">
                            <label>City</label>
                            <input onChange={(e) => setCity(e.target.value)} value={city} type="text" placeholder="City" />
                        </div>

                        {/* Zip Code */}
                        <div className="flex flex-col gap-2">
                            <label>Zip Code</label>
                            <input onChange={(e) => setZip(e.target.value)} value={zip} type="text" placeholder="Zip Code" />
                        </div>

                        {/* Country */}
                        <div className="flex flex-col gap-2">
                            <label>Country</label>
                            <input onChange={(e) => setCountry(e.target.value)} value={country} type="text" placeholder="Country" />
                            {/* Matched country */}
                            {matchCountry && (
                                <div className="flex gap-2 items-center mt-1">
                                    <p className="text-xs text-[#c1a875]">Did you mean: <span className="font-semibold">{matchCountry}</span>?</p>
                                    <button onClick={() => setCountry(matchCountry)} className="text-xs underline text-[#c1a875]">
                                        Use suggestion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleClick} className='border'>
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}
