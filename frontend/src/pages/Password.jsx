import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import Loading from '../components/Loading'
import { errorLog, log } from '../utils/log'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import { handleChangePassword } from '../utils/api'
import { FiEye, FiEyeOff } from "react-icons/fi"

export default function Password() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [error, setError] = useState(false)

    const handlePassword = async () => {
        // Check if all fields are filled
        if (!password || !confirmPassword || !currentPassword) {
            notyf.error("All fields are required")
            errorLog("All fields are required")
            return
        }

        // Check if password contains at least one uppercase letter, one lowercase letter, and one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
        if (!passwordRegex.test(password)) {
            setError(true)
            errorLog("Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long")
            setError(true)
            return
        }

        // Check if password and confirm password isn't match
        if (password !== confirmPassword) {
            setError(true)
            errorLog("Passwords do not match")
            return
        }

        // Check if new password is the same as the old password
        if (password === currentPassword) {
            setError(true)
            errorLog("New password cannot be the same as the old password")
            return
        }

        const userData = {
            password,
            currentPassword
        }

        setLoading(true) // Set loading state to true
        // Send request to change password
        try {
            const data = await handleChangePassword(userData)
            notyf.success("Password changed successfully!")
            log("Password changed successfully", data)
            setPassword("")
            setConfirmPassword("")
            setCurrentPassword("")
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.code === "invalid_pass") {
                notyf.error("New password cannot be the same as the old password")
                errorLog("Invalid password", error)
                setError("password")
                return
            }
            errorLog("Error in handlePassword", error)
            notyf.error("An error occurred while processing your request. Please try again later.")
            setLoading(false)
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
        <div className="min-h-screen bg-[#faf8f6] dark:bg-neutral-900 flex flex-col font-montserrat">
            <NavBar />
            <div className="flex-1 flex flex-col items-center py-12">
                <h1 className="text-4xl md:text-5xl font-prata font-bold text-[#1a1a1a] dark:text-neutral-100 mb-10 tracking-tight">Change Password</h1>

                {/* Main Container */}
                <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7 max-w-2xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">New Password  {error && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password) && <span className="text-red-500">*</span>}</label>
                            <div className='relative'>
                                <input onChange={e => setPassword(e.target.value)} value={password} id='password' type={showPassword ? "text" : "password"} autoComplete='off' placeholder="New Password..." className="border border-gray-200 dark:border-neutral-700 rounded-xl w-full px-4 py-3 text-base font-montserrat bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
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
                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Confirm Password {error && confirmPassword && password !== confirmPassword && <span className="text-red-500">*</span>}</label>
                            <div className='relative'>
                                <input onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} id='confirmPassword' type={showConfirmPassword ? "text" : "password"} autoComplete='off' placeholder="Confirm Password..." className="border border-gray-200 dark:border-neutral-700 rounded-xl w-full px-4 py-3 text-base font-montserrat bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                {confirmPassword &&
                                    <button className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                                    </button>
                                }
                            </div>
                            {error && confirmPassword && password !== confirmPassword
                                ? <p className="text-xs text-red-500 pl-1 mt-1">Passwords do not match</p>
                                : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Confirm your password.</p>
                            }
                        </div>

                        {/* Current Password */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="currentPassword" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">Current Password {error && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(currentPassword) && <span className="text-red-500">*</span>}</label>
                            <div className='relative'>
                                <input onChange={e => setCurrentPassword(e.target.value)} value={currentPassword} id='currentPassword' type={showCurrentPassword ? "text" : "password"} autoComplete='off' placeholder="Confirm Password..." className="border border-gray-200 dark:border-neutral-700 rounded-xl w-full px-4 py-3 text-base font-montserrat bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                {currentPassword &&
                                    <button className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        {showCurrentPassword ? <FiEye className='text-neutral-800 dark:text-neutral-100' /> : <FiEyeOff className='text-neutral-800 dark:text-neutral-100' />}
                                    </button>
                                }
                            </div>
                            {error && currentPassword ?
                                !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(currentPassword) ?
                                    <p className="text-xs text-red-500 pl-1 mt-1">Invalid current password format</p>
                                    : password === currentPassword
                                        ? <p className="text-xs text-red-500 pl-1 mt-1">New password cannot be the same as the old password</p>
                                        : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Enter your current password.</p>
                                : <p className="text-xs text-gray-500 dark:text-neutral-400 pl-1 mt-1">Enter your current password.</p>
                            }
                        </div>

                    </div>
                    {/* Button */}
                    <button onClick={handlePassword} className="w-full mt-4 py-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold text-lg shadow-md transition hover:bg-white hover:text-black active:scale-95 cursor-pointer">
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}