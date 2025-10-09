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
import { useAuth } from '../utils/AuthContext';
import Loading from '../components/Loading';
import { fetchUserData } from '../utils/api';

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
  const countries = getNames() // Get all country names
  const match = stringSimilarity.findBestMatch(country.toLocaleLowerCase(), countries) // find best match between user input and all country names
  const { setAddress, cart } = useCart()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // get user data from server on load if user logged in
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

  // Verify there is cart before continue with checkout page
  useEffect(() => {
    setLoading(true)
    if (!cart || Object.keys(cart).length === 0) {
      notyf.error("Please add placeholder something about add to cart")
      log("Please add shipping address first")
      nav("/")
      return
    } else {
      setLoading(false)
    }

    log(cart)
  }, [cart])

  const handleClick = () => {
    // Input validation
    if (!name || !email || !phone || !street || !city || !zip || !country) {
      notyf.error("All fields are required")
      log("All fields are required")
      return
    }

    // If country is not valid, show error
    if (match.bestMatch.rating < 0.7) {
      setMatchCountry(match.bestMatch.target)
      setError(true)
      log("Invalid country")
      return
    } else {
      setMatchCountry("")
    }

    // Check if name is less than 3 characters
    if (name.length < 3) {
      setError(true)
      log("Full name must be at least 4 characters long")
      return
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError(true)
      log("Invalid email format")
      return
    }

    // Check if phone number is valid
    if (!/^\d{10}$/.test(phone)) {
      setError(true)
      log("Invalid phone number format")
      return
    }

    if (!street.trim()) {
      setError(true)
      log("Street name is required")
      return
    }
    if (!city.trim()) {
      setError(true)
      log("City name is required")

    }

    // Check if zip code is valid
    if (zip.length < 4) {
      setError(true)
      log("Invalid zip code format")
      return
    }

    // Save address to local storage
    const address = {
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      street: street.toLowerCase(),
      city: city.toLowerCase(),
      zip: zip.toLocaleLowerCase(),
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

  return (
    <div className="min-h-screen flex flex-col font-montserrat bg-[#faf8f6] dark:bg-neutral-900">
      <NavBar />

      {!isAuthenticated && (
        <div className="flex justify-center">
          <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-md flex items-center gap-4 px-6 py-3 mt-8 mb-2 max-w-md">
            <span className="text-[#232323] dark:text-neutral-100 font-medium text-base">
              Already have an account?
            </span>
            <button onClick={() => nav("/login?redirect=/checkout")} className="border border-[#1a1a1a] text-[#1a1a1a] dark:text-neutral-100 dark:border-neutral-400 rounded-xl px-5 py-2 bg-white dark:bg-neutral-700 font-semibold text-base hover:bg-[#1a1a1a] hover:text-white transition active:scale-95 cursor-pointer">
              Login
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {/* Title */}
        <div className="max-w-2xl mx-auto py-12 px-4 md:px-12">
          <h1 className="text-4xl md:text-5xl mb-10 font-prata font-bold text-[#1a1a1a] dark:text-neutral-100 tracking-tight">
            DELIVERY INFORMATION
          </h1>

          <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor='name' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">
                  Name {error && name && name.length < 3 && <span className="text-red-500">*</span>}</label>
                <input onChange={e => setName(e.target.value.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, ""))} value={name.replace(/\b\w/g, l => l.toUpperCase())} id='name' type="text" placeholder="Full Name" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                {error && name && name.length < 3 ?
                  <p className="text-xs text-red-500 pl-1 mt-1">Name must be at least 3 characters long</p>
                  : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter your full name. It should be at least 3 characters long.</p>
                }
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor='email' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">
                  Email {error && email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) && <span className="text-red-500">*</span>}</label>
                <input onChange={e => setEmail(e.target.value)} value={email} id='email' type="email" placeholder="Email" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                {error && email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) ?
                  <p className="text-xs text-red-500 pl-1 mt-1">Invalid email format</p>
                  : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a valid email address.</p>
                }
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label htmlFor='phone' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">
                  Phone {error && phone && !/^\d{10}$/.test(phone) && <span className="text-red-500">*</span>}
                </label>
                <input onChange={e => (setPhone(e.target.value.replace(/[^0-9]/g, "")))} id='phone' inputMode="numeric" maxLength={10} value={phone} type="tel" placeholder="Phone" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                {error && phone && !/^\d{10}$/.test(phone)
                  ? <p className="text-xs text-red-500 pl-1 mt-1">Invalid phone number format</p>
                  : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a valid phone number.</p>
                }
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {/* Street */}
              <div className="flex flex-col gap-2">
                <label htmlFor='street' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Street {error && !street && !street.trim() && <span className="text-red-500">*</span>}</label>
                <input onChange={(e) => setStreet(e.target.value)} value={street} id='street' type="text" placeholder="Street" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                {error && !street && !street.trim()
                  ? <p className="text-xs text-red-500 pl-1 mt-1">Invalid street address</p>
                  : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter your street address.</p>
                }
              </div>

              {/* City */}
              <div className="flex flex-col gap-2">
                <label htmlFor='city' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">City {error && !city && !street.trim() && <span className="text-red-500">*</span>}</label>
                <input onChange={(e) => setCity(e.target.value.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, ""))} value={city.replace(/\b\w/g, l => l.toUpperCase())} id='city' type="text" placeholder="City" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                {error && !city && !city.trim()
                  ? <p className="text-xs text-red-500 pl-1 mt-1">Invalid city name</p>
                  : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter your city.</p>
                }
              </div>

              {/* Zip Code */}
              <div className="flex flex-col gap-2">
                <label htmlFor='zip' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Zip Code {error && zip && zip.length < 4 && <span className="text-red-500">*</span>}</label>
                <input onChange={(e) => setZip(e.target.value)} value={zip} id='zip' type="text" placeholder="Zip Code" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
                {error && zip && zip.length < 4
                  ? <p className="text-xs text-red-500 pl-1 mt-1">Invalid zip code format</p>
                  : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a zip code number.</p>
                }
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <label htmlFor='country' className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Country {error && country && match.bestMatch.rating < 0.7 && <span className="text-red-500">*</span>}</label>
                <input onChange={(e) => setCountry(e.target.value.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, ""))} value={country.replace(/[^A-Za-z\u0590-\u05FF\s׳'-]/g, "")} id='country' type="text" placeholder="Country" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />

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

            {/* Payment */}
            <button onClick={handleClick} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold cursor-pointer text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95">
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