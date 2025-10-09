import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import Loading from '../components/Loading'
import { errorLog, log } from '../utils/log'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import axios from 'axios'
import { handleChangePassword } from '../utils/api'

export default function Password() {
    const notyf = new Notyf({ position: { x: 'center', y: 'top', }, })
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handlePassword = async () => {
        // Check if all fields are filled
        if (!password || !confirmPassword || !oldPassword) {
            notyf.error("All fields are required")
            errorLog("All fields are required")
            return
        }

        // Check if password contains at least one uppercase letter, one lowercase letter, and one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
        if (!passwordRegex.test(password)) {
            notyf.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long")
            errorLog("Password must contain at least one uppercase letter, one lowercase letter, one number, and be 6-20 characters long")
            setError(true)
            return
        }

        // Check if password and confirm password isn't match
        if (password !== confirmPassword) {
            notyf.error("Passwords do not match")
            errorLog("Passwords do not match")
            return
        }

        // Check if new password is the same as the old password
        if (password === oldPassword) {
            notyf.error("New password cannot be the same as the old password")
            errorLog("New password cannot be the same as the old password")
            return
        }

        const userData = {
            password,
            oldPassword
        }

        setLoading(true) // Set loading state to true
        // Send request to change password
        try {
            const data = await handleChangePassword(userData)
            notyf.success("Password changed successfully!")
            log("Password changed successfully", data)
        } catch (error) {
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

                {/* Box */}
                <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-7 md:p-12 flex flex-col gap-7 max-w-2xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        {/* Password */}
                        <div className='relative'>
                            <label htmlFor="password" className="font-semibold text-[#232323] dark:text-neutral-100 text-sm">New Password <span className="text-red-500">*</span></label>

                            <input onChange={e => setPassword(e.target.value)} value={password} id='password' type={showPassword ? "text" : "password"} autoComplete='off' placeholder="New Password..." className="border border-gray-200 dark:border-neutral-700 rounded-xl w-full px-4 py-3 text-base font-montserrat bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />

                            {/* <p className={`text-xs mt-1 ${error === "name" || error === "name&email" ? "text-red-500" : "text-black"}`}>* Required</p> */}
                            <p>Password must be at least 6 characters long</p>
                        </div>

                        {/* Confirm Password */}
                        <input type="password" placeholder="Confirm Password" onChange={e => setConfirmPassword(e.target.value)} className='border' />
                        <p>Please confirm your new password.</p>

                        {/* Old Password */}
                        <input type="password" placeholder="Old Password" onChange={e => setOldPassword(e.target.value)} className='border' />

                        {/* Button */}
                        <button onClick={handlePassword} className='border'>Change Password</button>
                        <p>Please enter your current password to change your password.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
