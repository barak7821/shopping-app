import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import Loading from './Loading';
import { useState } from 'react';
import { handleSendOtp } from '../utils/api';

export default function OtpStep({ onNext }) {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {

        // Check if email is exist
        if (!email) {
            setError("email")
            errorLog("Email is required")
            return
        }

        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            setError("email")
            log("Invalid email format")
            return
        }

        // If all validations pass, proceed
        setLoading(true)
        try {
            await handleSendOtp(email)
            notyf.success("OTP sent successfully")
            log("OTP sent successfully")
            setEmail("")
            onNext(email)
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.code === "!email") {
                notyf.error("Email is required")
                setError("email")
                errorLog("Email is required", error)
                return
            }
            if (error.response && error.response.status === 400 && error.response.data.code === "!exist") {
                notyf.error("User does not exist. Please register first.")
                errorLog("User does not exist", error)
                return
            }
            notyf.error("An error occurred while processing your request. Please try again later.")
            errorLog("Error during handleSendOtp", error)
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
            <h1 className='font-prata font-bold text-4xl text-[#181818] dark:text-neutral-100 tracking-tight mb-4'>Reset Password</h1>

            {/* Email */}
            <div className="w-full flex flex-col gap-1">
                <label htmlFor="email" className="text-[#232323] dark:text-neutral-100 text-sm mb-1">Enter your email address to reset your password. {error && error === "email" && <span className="text-red-500">*</span>}</label>
                <input id="email" onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email...' className='w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100' />
                {error && email && error === "email" &&
                    <p className='text-xs text-red-500 pl-1 mt-1'>Invalid email format</p>
                }
            </div>

            {/* Login */}
            <button onClick={handleClick} className='w-full py-3 mt-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer'>Send OTP</button>
        </div>
    )
}
