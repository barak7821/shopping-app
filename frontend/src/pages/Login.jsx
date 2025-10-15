import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import Loading from '../components/Loading';
import { useAuth } from '../utils/AuthContext';
import NavBar from '../components/NavBar';
import { FiEye, FiEyeOff } from "react-icons/fi"
import { handleGoogle, handleLogin } from '../utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import { useApiErrorHandler } from '../utils/useApiErrorHandler';

export default function Login() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const nav = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { setIsAuthenticated, isAuthenticated } = useAuth()
    const params = new URLSearchParams(location.search) // Parse the query parameters
    const redirect = params.get("redirect") // Get the redirect parameter
    const { handleApiError } = useApiErrorHandler()

    // If user already logged in → redirect away from login page
    useEffect(() => {
        setLoading(true)
        if (isAuthenticated) {
            redirect ? nav(redirect) : nav("/")
        } else {
            setLoading(false)
        }
    }, [isAuthenticated])

    // Google OAuth handler
    const login = useGoogleLogin({
        onSuccess: async (TokenResponse) => {
            setLoading(true)
            try {
                const data = await handleGoogle(TokenResponse.access_token)

                localStorage.setItem("token", data.token) // Save the token in local storage
                notyf.success("Logged in successfully!")
                log("User logged in successfully", data)
                setIsAuthenticated(true) // Update authentication state

                if (redirect) {
                    nav(redirect) // Navigate to the specified route
                    window.location.reload()
                    return
                } else {
                    nav("/") // Navigate to home page
                    window.location.reload()
                    return
                }
            } catch (error) {
                errorLog("Google login error:", error)
                notyf.error("Google login failed. Please try again.")
            } finally {
                setLoading(false)
            }
        },
        onError: () => {
            notyf.error("Google login was cancelled or failed.")
        }
    })

    // Handle email/password login
    const handleClick = async () => {
        // Ensure all required fields are filled
        if (!email || !password) {
            notyf.error("All fields are required")
            errorLog("All fields are required")
            setError("empty")
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            setError("email")
            log("Invalid email format")
            return
        }

        setLoading(true) // Set loading state to true
        try {
            // Call login API
            const data = await handleLogin(email, password)

            localStorage.setItem("token", data.token) // Save the token in local storage
            setIsAuthenticated(true) // Update authentication state
            notyf.success("Logged in successfully!")
            log("User logged in successfully", data)

            setEmail("") // Clear email input
            setPassword("") // Clear password input

            if (redirect) {
                nav(redirect) // Navigate to the specified route
                window.location.reload()
                return
            } else {
                nav("/") // Navigate to home page
                window.location.reload()
                return
            }
        } catch (error) {
            const { code } = handleApiError(error, "handleLogin")

            if (["invalid_pass"].includes(code)) setError("password")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <>
                <NavBar />
                <Loading />
            </>
        )
    }

    return (
        <div className='min-h-screen bg-[#faf8f6] dark:bg-neutral-900'>
            <NavBar />
            <div className='flex justify-center items-center min-h-screen'>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7 items-center">

                    {/* Title */}
                    <h1 className='font-prata font-bold text-4xl text-[#181818] dark:text-neutral-100 mb-4 tracking-tight'>Login</h1>

                    {/* Email */}
                    <div className="w-full flex flex-col gap-1">
                        <label htmlFor="email" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Email{error && email && error === "email" && <span className="text-red-500">*</span>}</label>
                        <input id="email" onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email...' className='w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100' />
                        {error && email && error === "email" &&
                            <p className='text-xs text-red-500 pl-1 mt-1'>Invalid email format</p>
                        }
                    </div>

                    {/* Password */}
                    <div className="w-full flex flex-col gap-1">
                        <label htmlFor="password" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Password  {error && password && error === "password" && <span className="text-red-500">*</span>}</label>
                        <div className='relative'>
                            <input id="password" onChange={e => setPassword(e.target.value)} value={password} type={showPassword ? "text" : "password"} autoComplete='off' placeholder='Password...' className='w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100' />
                            {password &&
                                <button className='absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                                </button>
                            }
                        </div>
                        {error && password && error === "password" &&
                            <p className='text-xs text-red-500 pl-1 mt-1'>Invalid password</p>
                        }
                    </div>

                    {/* Error */}
                    {error === "empty" &&
                        <p className='text-xs text-red-500'>All fields are required</p>
                    }

                    {/* Login */}
                    <button onClick={handleClick} className='w-full py-3 mt-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer'>
                        Login
                    </button>

                    {/* Login with Google */}
                    <button onClick={() => login()} className="w-full flex items-center justify-center gap-3 py-3 mt-3 rounded-xl font-semibold text-base border border-gray-300 bg-white text-[#1a1a1a] hover:bg-[#faf8f6] transition shadow-md cursor-pointer dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700">

                        <svg width="22px" height="22px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                            <g>
                                <path fill="#4285F4" d="M255.878,133.451C255.878,122.717 255.007,114.884 253.122,106.761L130.55,106.761L130.55,155.209L202.497,155.209C201.047,167.249 193.214,185.381 175.807,197.565L214.318,229.21C241.662,206.704 255.878,173.196 255.878,133.451"></path>
                                <path fill="#34A853" d="M130.55,261.1C165.798,261.1 195.389,249.495 217.003,229.478L175.807,197.565C164.783,205.253 149.987,210.62 130.55,210.62C96.027,210.62 66.726,187.847 56.281,156.37L14.452,187.687C35.393,231.798 79.49,261.1 130.55,261.1"></path>
                                <path fill="#FBBC05" d="M56.281,156.37C53.525,148.247 51.93,139.543 51.93,130.55C51.93,121.556 53.525,112.853 56.136,104.73L15.26,71.312C5.077,89.644 0,109.517 0,130.55C0,151.583 5.077,171.455 13.925,189.152L56.281,156.37"></path>
                                <path fill="#EB4335" d="M130.55,50.479C155.064,50.479 171.6,61.068 181.029,69.917L217.873,33.943C195.245,12.91 165.798,0 130.55,0C79.49,0 35.393,29.301 13.925,71.947L56.136,104.73C66.726,73.253 96.027,50.479 130.55,50.479"></path>
                            </g>
                        </svg>
                        Continue with Google
                    </button>

                    {/* Reset Password */}
                    <Link to={"/resetPassword"} className='text-sm text-[#80715a] hover:text-[#c1a875] hover:underline transition mt-1'>
                        Forgot your password?
                    </Link>

                    {/* Register */}
                    <Link to={"/register"} className='text-sm text-[#80715a] hover:text-[#c1a875] hover:underline transition mt-1'>
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
        </div>
    )
}
