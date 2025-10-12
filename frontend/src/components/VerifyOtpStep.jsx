import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { errorLog, log } from '../utils/log';
import Loading from './Loading';
import { useState } from 'react';
import { handleVerifyOtp } from '../utils/api';

export default function VerifyOtpStep({ email, onNext }) {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        // Check if email is exist
        if (!email) return notyf.error("Email is required. Please fill it in.")

        // Check if otp is exist
        if (!otp) return notyf.error("OTP is required. Please fill it in.")

        // If all validations pass, proceed
        setLoading(true)
        try {
            await handleVerifyOtp(email, otp)
            notyf.success("Code verified successfully")
            log("Code verified successfully")
            onNext(otp)
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.code === "!field") {
                notyf.error("An error occurred while processing your request. Please try again later.")
                errorLog("Email not provide", error)
                return
            }

            if (error.response && error.response.status === 400 && error.response.data.code === "!exist") {
                notyf.error("An error occurred while processing your request. Please try again later.")
                errorLog("Invalid or expired OTP or user not found", error)
                return
            }

            if (error.response && error.response.status === 400 && error.response.data.code === "otpExpired") {
                notyf.error("OTP is expired")
                errorLog("OTP is expired", error)
                return
            }
                        if (error.response && error.response.status === 400 && error.response.data.code === "otp") {
                notyf.error("OTP is not valid")
                errorLog("OTP is not valid", error)
                return
            }
            notyf.error("An error occurred while processing your request. Please try again later.")
            errorLog("error during handleVerifyOtp", error)
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

            {/* OTP */}
            <div className="w-full flex flex-col gap-1">
                <label htmlFor="otp" className="text-[#232323] dark:text-neutral-100 text-sm mb-1">Enter the 6-digit code we sent to your otp {error && error === "otp" && <span className="text-red-500">*</span>}</label>
                <input id="otp" onChange={e => setOtp(e.target.value)} value={otp} type="number" placeholder='Code...' className='w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#c1a875] focus:outline-none text-base bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-100' />
                {error && otp && error === "otp" &&
                    <p className='text-xs text-red-500 pl-1 mt-1'>Invalid otp format</p>
                }
            </div>

            {/* Verify */}
            <button onClick={handleClick} className='w-full py-3 mt-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer'>Verify</button>
        </div>
    )
}
