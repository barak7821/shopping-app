import { useState } from 'react'
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { errorLog, log } from '../utils/log.js';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../utils/AuthContext.jsx';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useEffect } from 'react';
import { handleRegister } from '../utils/api.js';

export default function Home() {
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const nav = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { setIsAuthenticated, isAuthenticated } = useAuth()

  // if user already logged in then redirect to home
  useEffect(() => {
    setLoading(true)
    if (isAuthenticated) {
      nav("/")
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const handleClick = async () => {
    log(name, email, password, confirmPassword)

    // Input validation
    if (!name || !email || !password || !confirmPassword) {
      notyf.error("All fields are required")
      errorLog("All fields are required")
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

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      notyf.error("Password must be at least 6 characters long")
      errorLog("Password must be at least 6 characters long")
      setError(true)
      return
    }

    // Check if password contains at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/
    if (!passwordRegex.test(password)) {
      notyf.error("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      errorLog("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      setError(true)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      notyf.error("Passwords do not match")
      errorLog("Passwords do not match")
      setError(true)
      return
    }

    const userData = {
      name,
      email,
      password
    }

    // If all validations pass, set loading state and proceed with registration
    setLoading(true)
    try {
      const data = await handleRegister(userData)

      localStorage.setItem("token", data.token) // Save the token in local storage
      setIsAuthenticated(true) // Update authentication state

      notyf.success("Registration successful!")
      log("Registration response:", data)
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      nav("/") // Redirect to home page after successful registration
    } catch (error) {
      setError(true)
      if (error.response && error.response.status === 400 && error.response.data.code === "exist") {
        notyf.error("An account with this email already exists.")
        errorLog("An account with this email already exists.")
        return
      }
      errorLog("Error during registration:", error)
      notyf.error("An error occurred while processing your request. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7 items-center">

          {/* Title */}
          <h1 className="font-prata font-bold text-4xl text-[#181818] mb-2 tracking-tight">
            Register
          </h1>

          {/* Name */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="name" className="font-semibold text-[#232323] text-sm mb-1">Full Name</label>
            <input id="name" onChange={e => setName(e.target.value)} value={name} type="text" placeholder="Name..." className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
            {error && name && name.length < 3 ?
              <p className="text-xs text-red-500 pl-1 mt-1">Name must be at least 3 characters long</p>
              : <p className="text-xs text-gray-500 pl-1 mt-1">Please enter your full name. It should be at least 3 characters long.</p>
            }
          </div>

          {/* Email */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold text-[#232323] text-sm mb-1">Email</label>
            <input id="email" onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder="Email..." className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
            {error && email && !email.includes("@") ?
              <p className="text-xs text-red-500 pl-1 mt-1">Invalid email format</p>
              : <p className="text-xs text-gray-500 pl-1 mt-1">Please enter a valid email address.</p>
            }
          </div>

          {/* Password */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="password" className="font-semibold text-[#232323] text-sm mb-1">Password</label>
            <div className="relative">
              <input id="password" onChange={e => setPassword(e.target.value)} value={password} type={showPassword ? "text" : "password"} autoComplete='off' placeholder="Password..." className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
              {password &&
                <button className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              }
            </div>
            {error && password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password) ?
              password.length < 6 ?
                <p className="text-xs text-red-500 pl-1 mt-1">Password must be at least 6 characters long</p>
                : <p className="text-xs text-red-500 pl-1 mt-1">Password must contain at least one uppercase letter, one lowercase letter, and one number</p>
              : <p className="text-xs text-gray-500 pl-1 mt-1">Your password should be at least 6 characters and include upper & lower case letters and a number.</p>
            }
          </div>

          {/* Confirm Password */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="font-semibold text-[#232323] text-sm mb-1">Confirm Password</label>
            <div className="relative">
              <input id="confirmPassword" onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} type={showConfirmPassword ? "text" : "password"} autoComplete="off" placeholder="Confirm Password..." className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50" />
              {confirmPassword &&
                <button className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              }
            </div>
            {error && confirmPassword && confirmPassword !== password ?
              <p className="text-xs text-red-500 pl-1 mt-1">Passwords do not match</p>
              : <p className="text-xs text-gray-500 pl-1 mt-1">Please confirm your password.</p>
            }
          </div>

          {/* Submit Button */}
          <button onClick={handleClick} className="w-full py-3 mt-2 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
            Register
          </button>

          {/* Link to Login */}
          <Link to="/login" className="text-sm text-[#80715a] hover:text-[#c1a875] underline transition mt-1">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}
