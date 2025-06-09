import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import AboutCard from '../components/AboutCard';
import { useNavigate } from 'react-router-dom';
import { errorLog, log } from '../utils/log';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { getNames } from 'country-list';
import stringSimilarity from 'string-similarity';
import { useCart } from '../utils/CartContext';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import Loading from '../components/Loading';

export default function Checkout() {
  const nav = useNavigate()
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [country, setCountry] = useState("")
  const [matchCountry, setMatchCountry] = useState("")
  const { setAddress } = useCart()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

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

  const handleClick = () => {
    // Input validation
    if (!name || !email || !phone || !street || !city || !zip || !country) {
      notyf.error("All fields are required")
      log("All fields are required")
      return
    }

    // Check if name is less than 3 characters
    if (name.length < 3) {
      notyf.error("Full name must be at least 4 characters long")
      log("Full name must be at least 4 characters long")
      return
    }

    // Check if email is valid
    if (!email.includes("@")) {
      notyf.error("Invalid email format")
      log("Invalid email format")
      return
    }

    // Check if phone number is valid
    if (phone.length !== 10) {
      notyf.error("Invalid phone number format")
      log("Invalid phone number format")
      return
    }

    if (!phone.match(/^[0-9]+$/)) {
      notyf.error("Invalid phone number format")
      log("Invalid phone number format")
      return
    }

    // Check if zip code is valid
    if (zip.length < 4) {
      notyf.error("Invalid zip code format")
      log("Invalid zip code format")
      return
    }

    const countries = getNames() // Get all country names
    const match = stringSimilarity.findBestMatch(country.toLocaleLowerCase(), countries) // find best match between user input and all country names

    // If country is not valid, show error
    if (match.bestMatch.rating < 0.7) {
      setMatchCountry(match.bestMatch.target)
      notyf.error("Invalid country")
      log("Invalid country")
      return
    } else {
      setMatchCountry("")
    }

    // Save address to local storage
    const address = {
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      street: street.toLowerCase(),
      city: city.toLowerCase(),
      zip,
      country: country.toLowerCase()
    }
    setAddress(address)
    log(address)

    // Redirect to payment page
    nav("/payment")
  }

  if (loading) {
    return (
      <Loading />
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen select-none touch-none dark:bg-neutral-900 bg-neutral-100">
        <span className="mt-4 font-medium tracking-wide animate-pulse">Something went wrong. Please try again later.</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6]">
      <NavBar />

      {!isAuthenticated && (
        <div className="flex justify-center">
          <div className="bg-white/90 rounded-2xl shadow-md flex items-center gap-4 px-6 py-3 mt-8 mb-2 max-w-md">
            <span className="text-[#232323] font-medium text-base">
              Already have an account?
            </span>
            <button onClick={() => nav("/login?redirect=/checkout")} className=" border border-[#1a1a1a] text-[#1a1a1a] rounded-xl px-5 py-2 bg-white font-semibold text-base hover:bg-[#1a1a1a] hover:text-white active:scale-95 transition">
              Login
            </button>
          </div>
        </div>
      )}


      <div className="flex-1">
        {/* Title */}
        <div className="max-w-2xl mx-auto py-12 px-4 md:px-12">
          <h1 className="text-4xl md:text-5xl mb-10 font-prata font-bold text-[#1a1a1a] tracking-tight">
            DELIVERY INFORMATION
          </h1>

          <div className="bg-white/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7">
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
                <input onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" maxLength={10} value={phone} type="tel" placeholder="Phone" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

              {/* Street */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-[#232323] text-sm">Street</label>
                <input onChange={(e) => setStreet(e.target.value)} value={street} type="text" placeholder="Street" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
              </div>

              {/* City */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-[#232323] text-sm">City</label>
                <input onChange={(e) => setCity(e.target.value)} value={city} type="text" placeholder="City" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
              </div>

              {/* Zip Code */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-[#232323] text-sm">Zip Code</label>
                <input onChange={(e) => setZip(e.target.value)} value={zip} type="text" placeholder="Zip Code" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-[#232323] text-sm">Country</label>
                <input onChange={(e) => setCountry(e.target.value)} value={country} type="text" placeholder="Country" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
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

            {/* Payment */}
            <button onClick={handleClick} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95">
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <AboutCard />

      {/* Footer */}
      <Footer />
    </div>
  )
}
