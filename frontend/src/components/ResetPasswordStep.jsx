import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import Loading from './Loading';
import { useState } from 'react';
import { handleResetPassword } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from "react-icons/fi"

export default function ResetPasswordStep({ email }) {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const nav = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)


    const handleClick = async () => {
        // Check if email is exist
        if (!email) return notyf.error("Email is required. Please fill it in.")

        // Check if password is exist
        if (!password) return notyf.error("Password is required. Please fill it in.")

        // Check if confirmPassword is exist
        if (!confirmPassword) return notyf.error("Confirm password is required. Please fill it in.")

        // Check if password contains at least one uppercase letter, one lowercase letter, and one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
        if (!passwordRegex.test(password)) {
            errorLog("Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long")
            setError(true)
            return
        }

        // Check if passwords match
        if (password !== confirmPassword) return notyf.error("Passwords do not match. Please try again.")

        // If all validations pass, proceed
        setLoading(true)
        try {
            await handleResetPassword(email, password)
            notyf.success("Password reset successfully")
            log("Password reset successfully")
            nav("/")
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.code === "!field") {
                notyf.error("An error occurred while processing your request. Please try again later.")
                errorLog("Email or Password is not provided", error)
                return
            }

            if (error.response && error.response.status === 400 && error.response.data.code === "!exists") {
                notyf.error("An error occurred while processing your request. Please try again later.")
                errorLog("User not found", error)
                return
            }

            if (error.response && error.response.status === 400 && error.response.data.code === "invalid_pass") {
                notyf.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long")
                errorLog("Invalid password", error)
                return
            }

            if (error.response && error.response.status === 400 && error.response.data.code === "samePass") {
                notyf.error("New password cannot be the same as the current password. Please try again")
                errorLog("new password and old password are the same", error)
                return
            }
            notyf.error("An error occurred while processing your request. Please try again later.")
            errorLog("error during handleResetPassword", error)
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
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md flex flex-col gap-7 items-center">

            {/* Title */}
            <h1 className='font-prata font-bold text-4xl text-[#181818] dark:text-neutral-100 tracking-tight mb-4'>Verify Code</h1>

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
                {error && password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password) ?
                    password.length < 6 ?
                        <p className="text-xs text-red-500 pl-1 mt-1">Password must be at least 6 characters long</p>
                        : <p className="text-xs text-red-500 pl-1 mt-1">Password must contain at least one uppercase letter, one lowercase letter, and one number</p>
                    : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Your password should be at least 6 characters and include upper & lower case letters and a number.</p>
                }
            </div>

            {/* Confirm Password */}
            <div className="w-full flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm mb-1">Confirm Password  {error && confirmPassword && error === "confirmPassword" && <span className="text-red-500">*</span>}</label>
                <div className='relative'>
                    <input id="confirmPassword" onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} type={showConfirmPassword ? "text" : "password"} autoComplete='off' placeholder='Confirm Password...' className='w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100' />
                    {confirmPassword &&
                        <button className='absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                        </button>
                    }
                </div>
                {error && confirmPassword && confirmPassword !== password
                    ? <p className="text-xs text-red-500 pl-1 mt-1">Passwords do not match</p>
                    : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Please confirm your password.</p>
                }
            </div>

            {/* Verify */}
            <button onClick={handleClick} className='w-full py-3 mt-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer'>Verify</button>
        </div>
    )
}
