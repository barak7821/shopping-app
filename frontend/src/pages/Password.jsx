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

    const handlePassword = async () => {
        // Check if all fields are filled
        if (!password || !confirmPassword || !oldPassword) {
            notyf.error("All fields are required")
            errorLog("All fields are required")
            return
        }

        // Check if password is at least 6 characters long and not longer than 20
        if (password.length <= 6 || password.length >= 20) {
            notyf.error("Password must be at least 6 characters long")
            errorLog("Password must be at least 6 characters long")
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
        <div className='min-h-screen'>
            <NavBar />

            <div className='flex flex-col justify-center items-center'>
                <h1 className='text-4xl font-bold'>Change Password</h1>
                <input type="password" placeholder="New Password" onChange={e => setPassword(e.target.value)} className='border' />
                <p>Password must be at least 6 characters long</p>
                <input type="password" placeholder="Confirm Password" onChange={e => setConfirmPassword(e.target.value)} className='border' />
                <p>Please confirm your new password.</p>
                <input type="password" placeholder="Old Password" onChange={e => setOldPassword(e.target.value)} className='border' />
                <button onClick={handlePassword} className='border'>Change Password</button>
                <p>Please enter your current password to change your password.</p>
            </div>
        </div>
    )
}
