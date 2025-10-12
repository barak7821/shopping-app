import Loading from '../components/Loading';
import { useAuth } from '../utils/AuthContext';
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OtpStep from '../components/OtpStep';
import VerifyOtpStep from '../components/VerifyOtpStep';
import ResetPasswordStep from '../components/ResetPasswordStep';
import { log } from '../utils/log';

export default function ResetPassword() {
    const nav = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const { setIsAuthenticated, isAuthenticated } = useAuth()
    const params = new URLSearchParams(location.search) // Parse the query parameters
    const redirect = params.get("redirect") // Get the redirect parameter
    const [step, setStep] = useState("email")

    // if user already logged in then redirect to home
    useEffect(() => {
        setLoading(true)
        if (isAuthenticated) {
            redirect ? nav(redirect) : nav("/")
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

                {step === "otp" && <VerifyOtpStep email={email} onNext={() => {
                    setStep("reset")
                }} />}

                {step === "reset" && <ResetPasswordStep email={email} />}
            </div>
        </div>
    )
}
