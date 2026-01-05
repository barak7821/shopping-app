"use client"
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';
import OtpStep from '../components/OtpStepForm';
import VerifyOtpStep from '../components/OtpVerificationStep';
import ResetPasswordStep from '../components/ResetPasswordFormStep';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuth()
    const redirect = searchParams.get("redirect") // Get the redirect parameter
    const [step, setStep] = useState("email")

    // if user already logged in then redirect to home
    useEffect(() => {
        setLoading(true)
        if (isAuthenticated) {
            redirect ? router.push(redirect) : router.push("/")
        } else {
            setLoading(false)
        }
    }, [isAuthenticated])

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className='min-h-screen bg-[#faf8f6] dark:bg-neutral-900'>
            <NavBar />
            <div className='flex justify-center items-center min-h-screen'>
                {step === "email" && <OtpStep onNext={(e) => {
                    setEmail(e)
                    setStep("otp")
                }} />}

                {step === "otp" && <VerifyOtpStep email={email} onNext={(o) => {
                    setOtp(o)
                    setStep("reset")
                }} />}

                {step === "reset" && <ResetPasswordStep email={email} otp={otp} />}
            </div>
        </div>
    )
}
