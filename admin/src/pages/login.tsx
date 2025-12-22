import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../utils/AdminAuthContext";
import { errorLog, log } from "../utils/log";
import { useApiErrorHandler } from "../utils/useApiErrorHandler";
import { adminLogin } from "../utils/api";
import Loading from "../components/Loading";


export default function Login() {
    const nav = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(true)
    const { isAuthenticated } = useAdminAuth()
    const params = new URLSearchParams(location.search) // Parse the query parameters
    const redirect = params.get("redirect") // Get the redirect parameter
    const { handleApiError } = useApiErrorHandler()

    // If user already logged in, redirect to home page or redirect parameter
    useEffect(() => {
        setLoading(false)
        if (isAuthenticated) {
            redirect ? nav(redirect) : nav("/")
        } else {
            setLoading(false)
        }
    }, [isAuthenticated])

    // Handle Login
    const handleClick = async () => {
        // Ensure all required fields are filled
        if (!email || !password) {
            errorLog("All fields are required")
            setError("empty")
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            errorLog("Invalid email format")
            setError("email")
            return
        }

        // Validate password length
        if (password.length < 6) {
            errorLog("Invalid password")
            setError("password")
            return
        }

        setLoading(true) // Set loading state to true
        try {
            const data = await adminLogin(email, password) // Call the login API

            localStorage.setItem("tempToken", data.token) // Store the token in local storage

            log("Login successful", data)

            setEmail("") // Clear email field
            setPassword("") // Clear password field
            setError("") // Clear error state

            if (data.code === "mfa_setup_required") {
                log("Navigating to MFA setup page")
                nav("/setup2fa") // Navigate to MFA setup page
            }

            if (data.code === "mfa_required") {
                log("Navigating to MFA verification page")
                nav("/verify2fa") // Navigate to MFA page
            }

            // nav("/verify2fa") // Navigate to MFA page

        } catch (error) {
            const { code } = handleApiError(error as Error, "handleClick")

            if (code && ["invalid_pass"].includes(code)) setError("password")
        } finally {
            setLoading(false) // Set loading state to false
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4 justify-center items-center">
                    <Loading />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4 justify-center items-center">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7">

                    <div className="flex flex-col gap-6 items-center justify-center">

                        {/* Title */}
                        <h1 className="font-prata text-5xl text-[#181818] dark:text-neutral-100 text-center tracking-wide">
                            Login Page
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm text-[#444] dark:text-neutral-300 text-center max-w-2xl">
                            Welcome back! Please enter your email and password to access your account.
                        </p>

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
                                        {showPassword
                                            ? <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-800 dark:text-neutral-100">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 5.25C9.22586 5.25 6.79699 6.91121 5.12801 8.44832C4.28012 9.22922 3.59626 10.0078 3.12442 10.5906C2.88804 10.8825 2.70368 11.1268 2.57736 11.2997C2.51417 11.3862 2.46542 11.4549 2.43187 11.5029C2.41509 11.5269 2.4021 11.5457 2.393 11.559L2.38227 11.5747L2.37911 11.5794L2.10547 12.0132L2.37809 12.4191L2.37911 12.4206L2.38227 12.4253L2.393 12.441C2.4021 12.4543 2.41509 12.4731 2.43187 12.4971C2.46542 12.5451 2.51417 12.6138 2.57736 12.7003C2.70368 12.8732 2.88804 13.1175 3.12442 13.4094C3.59626 13.9922 4.28012 14.7708 5.12801 15.5517C6.79699 17.0888 9.22586 18.75 12.0001 18.75C14.7743 18.75 17.2031 17.0888 18.8721 15.5517C19.72 14.7708 20.4039 13.9922 20.8757 13.4094C21.1121 13.1175 21.2964 12.8732 21.4228 12.7003C21.4859 12.6138 21.5347 12.5451 21.5682 12.4971C21.585 12.4731 21.598 12.4543 21.6071 12.441L21.6178 12.4253L21.621 12.4206L21.6224 12.4186L21.9035 12L21.622 11.5809L21.621 11.5794L21.6178 11.5747L21.6071 11.559C21.598 11.5457 21.585 11.5269 21.5682 11.5029C21.5347 11.4549 21.4859 11.3862 21.4228 11.2997C21.2964 11.1268 21.1121 10.8825 20.8757 10.5906C20.4039 10.0078 19.72 9.22922 18.8721 8.44832C17.2031 6.91121 14.7743 5.25 12.0001 5.25ZM4.29022 12.4656C4.14684 12.2885 4.02478 12.1311 3.92575 12C4.02478 11.8689 4.14684 11.7115 4.29022 11.5344C4.72924 10.9922 5.36339 10.2708 6.14419 9.55168C7.73256 8.08879 9.80369 6.75 12.0001 6.75C14.1964 6.75 16.2676 8.08879 17.8559 9.55168C18.6367 10.2708 19.2709 10.9922 19.7099 11.5344C19.8533 11.7115 19.9753 11.8689 20.0744 12C19.9753 12.1311 19.8533 12.2885 19.7099 12.4656C19.2709 13.0078 18.6367 13.7292 17.8559 14.4483C16.2676 15.9112 14.1964 17.25 12.0001 17.25C9.80369 17.25 7.73256 15.9112 6.14419 14.4483C5.36339 13.7292 4.72924 13.0078 4.29022 12.4656ZM14.25 12C14.25 13.2426 13.2427 14.25 12 14.25C10.7574 14.25 9.75005 13.2426 9.75005 12C9.75005 10.7574 10.7574 9.75 12 9.75C13.2427 9.75 14.25 10.7574 14.25 12ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92898 15.75 8.25005 14.0711 8.25005 12C8.25005 9.92893 9.92898 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z"></path></svg>
                                            : <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-800 dark:text-neutral-100"><g id="SVGRepo_bgCarrier" strokeWidth="0">
                                            </g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M15.5778 13.6334C16.2396 12.1831 15.9738 10.4133 14.7803 9.21976C13.5868 8.02628 11.817 7.76042 10.3667 8.4222L11.5537 9.60918C12.315 9.46778 13.1307 9.69153 13.7196 10.2804C14.3085 10.8693 14.5323 11.6851 14.3909 12.4464L15.5778 13.6334Z"></path> <path fillRule="evenodd" clipRule="evenodd" d="M5.86339 7.80781C5.60443 8.02054 5.35893 8.23562 5.12798 8.44832C4.28009 9.22922 3.59623 10.0078 3.1244 10.5906C2.88801 10.8825 2.70365 11.1268 2.57733 11.2997C2.51414 11.3862 2.46539 11.4549 2.43184 11.5029C2.41506 11.5269 2.40207 11.5457 2.39297 11.559L2.38224 11.5747L2.37908 11.5794L2.37806 11.5809L2.09656 12L2.37741 12.4181L2.37806 12.4191L2.37908 12.4206L2.38224 12.4253L2.39297 12.441C2.40207 12.4543 2.41506 12.4731 2.43184 12.4971C2.46539 12.5451 2.51414 12.6138 2.57733 12.7003C2.70365 12.8732 2.88801 13.1175 3.1244 13.4094C3.59623 13.9922 4.28009 14.7708 5.12798 15.5517C6.79696 17.0888 9.22583 18.75 12 18.75C13.3694 18.75 14.6547 18.3452 15.806 17.7504L14.6832 16.6277C13.8289 17.0123 12.9256 17.25 12 17.25C9.80366 17.25 7.73254 15.9112 6.14416 14.4483C5.36337 13.7292 4.72921 13.0078 4.29019 12.4656C4.14681 12.2885 4.02475 12.1311 3.92572 12C4.02475 11.8689 4.14681 11.7115 4.29019 11.5344C4.72921 10.9922 5.36337 10.2708 6.14416 9.55168C6.39447 9.32114 6.65677 9.09369 6.92965 8.87408L5.86339 7.80781ZM17.0705 15.1258C17.3434 14.9063 17.6056 14.6788 17.8559 14.4483C18.6367 13.7292 19.2708 13.0078 19.7099 12.4656C19.8532 12.2885 19.9753 12.1311 20.0743 12C19.9753 11.8689 19.8532 11.7115 19.7099 11.5344C19.2708 10.9922 18.6367 10.2708 17.8559 9.55168C16.2675 8.08879 14.1964 6.75 12 6.75C11.0745 6.75 10.1712 6.98772 9.31694 7.37228L8.1942 6.24954C9.34544 5.65475 10.6307 5.25 12 5.25C14.7742 5.25 17.2031 6.91121 18.8721 8.44832C19.72 9.22922 20.4038 10.0078 20.8757 10.5906C21.112 10.8825 21.2964 11.1268 21.4227 11.2997C21.4859 11.3862 21.5347 11.4549 21.5682 11.5029C21.585 11.5269 21.598 11.5457 21.6071 11.559L21.6178 11.5747L21.621 11.5794L21.622 11.5809L21.9035 12L21.6224 12.4186L21.621 12.4206L21.6178 12.4253L21.6071 12.441C21.598 12.4543 21.585 12.4731 21.5682 12.4971C21.5347 12.5451 21.4859 12.6138 21.4227 12.7003C21.2964 12.8732 21.112 13.1175 20.8757 13.4094C20.4038 13.9922 19.72 14.7708 18.8721 15.5517C18.6412 15.7644 18.3957 15.9794 18.1368 16.1921L17.0705 15.1258Z"></path> <path fillRule="evenodd" clipRule="evenodd" d="M18.75 19.8107L3.75 4.81066L4.81066 3.75L19.8107 18.75L18.75 19.8107Z"></path> </g></svg>
                                        }
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

                        {/* Reset Password */}
                        <Link to={"/resetPassword"} className='text-sm text-[#80715a] hover:text-[#c1a875] hover:underline transition mt-1'>
                            Forgot your password?
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    )
}
