import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { errorLog, log } from '../lib/logger.js';
import Loading from '../components/Loading.js';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar.js';
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useEffect } from 'react';
import { handleRegister } from '../api/apiClient';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import { useNotyf } from '../hooks/useNotyf';

export default function Home() {
  const notyf = useNotyf()
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
  const { handleApiError } = useApiErrorHandler()

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
      notyf?.error("All fields are required")
      errorLog("All fields are required")
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

    // Check if password contains at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
    if (!passwordRegex.test(password)) {
      errorLog("Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long")
      setError(true)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
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

      notyf?.success("Registration successful!")
      log("Registration response:", data)
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      nav("/") // Redirect to home page after successful registration
      window.location.reload()
    } catch (error) {
      setError(true)
      handleApiError(error, "handleRegister")
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
    <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7 items-center">

          {/* Title */}
          <h1 className="font-prata font-bold text-4xl text-[#181818] dark:text-neutral-100 mb-2 tracking-tight">
            Register
          </h1>

          {/* Name */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="name" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Full Name {error && name.length < 3 && <span className="text-red-500">*</span>}</label>
            <input id="name" onChange={e => setName(e.target.value)} value={name} type="text" placeholder="Name..." className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
            {error && name && name.length < 3 ?
              <p className="text-xs text-red-500 pl-1 mt-1">Name must be at least 3 characters long</p>
              : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter your full name. It should be at least 3 characters long.</p>
            }
          </div>

          {/* Email */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Email {error && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) && <span className="text-red-500">*</span>}</label>
            <input id="email" onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder="Email..." className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
            {error && email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) ?
              <p className="text-xs text-red-500 pl-1 mt-1">Invalid email format</p>
              : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please enter a valid email address.</p>
            }
          </div>

          {/* Password */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="password" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Password {error && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password) && <span className="text-red-500">*</span>}</label>
            <div className="relative">
              <input id="password" onChange={e => setPassword(e.target.value)} value={password} type={showPassword ? "text" : "password"} autoComplete='off' placeholder="Password..." className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
              {password &&
                <button className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                </button>
              }
            </div>
            {error && password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password) ?
              password.length < 6 ?
                <p className="text-xs text-red-500 pl-1 mt-1">Password must be at least 6 characters long</p>
                : <p className="text-xs text-red-500 pl-1 mt-1">Password must contain at least one uppercase letter, one lowercase letter, and one number</p>
              : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Your password should be at least 6 characters and include upper & lower case letters and a number.</p>
            }
          </div>

          {/* Confirm Password */}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Confirm Password {error && password !== confirmPassword && <span className="text-red-500">*</span>}</label>
            <div className="relative">
              <input id="confirmPassword" onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} type={showConfirmPassword ? "text" : "password"} autoComplete="off" placeholder="Confirm Password..." className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100" />
              {confirmPassword &&
                <button className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                </button>
              }
            </div>
            {error && confirmPassword && confirmPassword !== password
              ? <p className="text-xs text-red-500 pl-1 mt-1">Passwords do not match</p>
              : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please confirm your password.</p>
            }
          </div>

          {/* Submit Button */}
          <button onClick={handleClick} className="w-full py-3 mt-2 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
            Register
          </button>

          {/* Link to Login */}
          <Link to="/login" className="text-sm text-[#80715a] hover:text-[#c1a875] hover:underline transition mt-1">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}
