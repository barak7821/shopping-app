import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import Loading from '../components/Loading';
import { useAuth } from '../utils/AuthContext';
import NavBar from '../components/NavBar';
import { FiEye, FiEyeOff } from "react-icons/fi"
import { handleLogin } from '../utils/api';

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

    // if user already logged in then redirect to home
    useEffect(() => {
        setLoading(true)
        if (isAuthenticated) {
            redirect ? nav(redirect) : nav("/")
        } else {
            setLoading(false)
        }
    }, [isAuthenticated])

    const handleClick = async () => {
        // Input validation
        if (!email || !password) {
            notyf.error("All fields are required")
            errorLog("All fields are required")
            setError("empty")
            return
        }

        // Check if email is valid
        if (!email.includes("@")) {
            notyf.error("Invalid email format")
            errorLog("Invalid email format")
            setError("email")
            return
        }

        // If all validations pass, proceed with login
        setLoading(true)
        try {
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
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.code === "!exist") {
                notyf.error("User does not exist. Please register first.")
                errorLog("User does not exist", error)
                return
            }
            if (error.response && error.response.status === 400 && error.response.data.code === "invalid_pass") {
                notyf.error("Invalid password. Please try again.")
                errorLog("Invalid password", error)
                setError("password")
                return
            }
            errorLog("Error during login", error)
            notyf.error("Login failed. Please check your credentials and try again.")
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
        <div className='min-h-screen bg-[#faf8f6] dark:bg-neutral-900'>
            <NavBar />
            <div className='flex justify-center items-center min-h-screen'>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7 items-center">

                    {/* Title */}
                    <h1 className='font-prata font-bold text-4xl text-[#181818] dark:text-neutral-100 mb-4 tracking-tight'>Login</h1>

                    {/* Email */}
                    <div className="w-full flex flex-col gap-1">
                        <label htmlFor="email" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Email</label>
                        <input id="email" onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email...' className='w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100' />
                        {error && email && error === "email" &&
                            <p className='text-xs text-red-500 pl-1 mt-1'>Invalid email format</p>
                        }
                    </div>

                    {/* Password */}
                    <div className="w-full flex flex-col gap-1">
                        <label htmlFor="password" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Password</label>
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

                    {/* Register */}
                    <Link to={"/register"} className='text-sm text-[#80715a] hover:text-[#c1a875] hover:underline transition mt-1'>
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
        </div>
    )
}
