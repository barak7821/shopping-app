import { log } from '../utils/log';
import Loading from './Loading';
import { useEffect, useState } from 'react';
import { handleSendOtp, handleVerifyOtp } from '../utils/api';
import { useApiErrorHandler } from "../utils/useApiErrorHandler";
import OTPInput from "otp-input-react";
import { useNotyf } from '../utils/useNotyf';

export default function VerifyOtpStep({ email, onNext }: { email: string, onNext: (otp: string) => void }) {
    const notyf = useNotyf()
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { handleApiError } = useApiErrorHandler()
    const [timer, setTimer] = useState(30)
    const [disabled, setDisabled] = useState(true)

    useEffect(() => {
        if (!disabled) return

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setDisabled(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [disabled])

    const handleTimerClick = async () => {
        if (!email) return notyf?.error("An unexpected error occurred. Please try again later.") // If there is no email, this is an internal bug

        try {
            setTimer(30)
            setDisabled(true)
            await handleSendOtp(email)
            log("OTP sent successfully")
        } catch (error) {
            handleApiError(error, "handleResetPassword")
        }
    }
    const handleClick = async () => {
        // Check if email is exist
        if (!email) return notyf?.error("An unexpected error occurred. Please try again later.")

        // Check if otp is exist
        if (!otp) return notyf?.error("OTP is required. Please fill it in.")

        // If all validations pass, proceed
        setLoading(true)
        try {
            await handleVerifyOtp(email, otp)
            notyf?.success("Code verified successfully")
            log("Code verified successfully")
            onNext(otp)
        } catch (error) {
            const { code } = handleApiError(error, "handleVerifyOtp") || {}

            if (["otp_invalid", "otp_expired", "!field"].includes(code)) setError("otp")
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
            <h1 className='font-prata font-bold text-4xl text-[#181818] dark:text-neutral-100 tracking-tight mb-1'>Verify Code</h1>

            {/* Subtitle */}
            <p className="text-sm text-[#555] dark:text-neutral-300 text-center mb-2">
                Enter the 6-digit code we sent to your email.
            </p>

            {/* OTP */}
            <div className="flex flex-col gap-2 w-full">
                <OTPInput value={otp} onChange={setOtp} autoFocus OTPLength={6} otpType="number" disabled={false} inputClassName="rounded-xl border border-gray-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-center text-2xl font-semibold tracking-widest text-[#1a1a1a] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none transition-transform duration-150 focus:scale-105 scale-125" className="flex justify-center" />
                {error && otp && error === "otp" &&
                    <p className='text-sm text-red-500 mt-1'>Invalid code</p>
                }
            </div>

            {/* Resend OTP */}
            <button onClick={handleTimerClick} disabled={disabled} className={`text-sm font-medium underline-offset-4 transition ${disabled ? "text-gray-400 cursor-not-allowed" : "text-[#c1a875] hover:text-[#1a1a1a] dark:hover:text-[#c1a875]/80 cursor-pointer"}`}>
                {disabled ? `resend available in ${timer}s` : "Resend OTP"}
            </button>

            {/* Verify */}
            <button onClick={handleClick} className='w-full py-3 rounded-xl font-semibold text-base bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer'>Verify</button>
        </div>
    )
}
