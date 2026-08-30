import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:3000'

const Auth = () => {
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('+918510978774')
  const [otp, setOtp] = useState('980515')
  const [verificationId, setVerificationId] = useState('')
  const [step, setStep] = useState('send-otp')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOtp = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const normalizedMobile = mobile.trim()
    if (!normalizedMobile) {
      setError('Please enter a mobile number.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/customer/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile: normalizedMobile }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to send OTP.')
      }

      const nextVerificationId = data?.user?.verificationId
      if (!nextVerificationId) {
        throw new Error('Verification ID not received from server.')
      }

      setVerificationId(nextVerificationId)
      setStep('verify-otp')
      setSuccess(data.message || 'OTP sent successfully.')
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong while sending OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const normalizedMobile = mobile.trim()
    const normalizedOtp = otp.trim()

    if (!normalizedMobile) {
      setError('Mobile number is required.')
      return
    }

    if (!verificationId) {
      setError('Verification ID is missing. Please request a new OTP.')
      return
    }

    if (!normalizedOtp) {
      setError('OTP is required.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/customer/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: normalizedMobile,
          verificationId,
          otp: normalizedOtp,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'OTP verification failed.')
      }

      const accessToken = data.accessToken
      if (!accessToken) {
        throw new Error('Access token not received from server.')
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('tokenType', data.tokenType || 'Bearer')
      localStorage.setItem('user', JSON.stringify(data.user))

      setSuccess(data.message || 'Phone verified successfully.')
      window.dispatchEvent(new Event('storage'))
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message || 'Failed to verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl shadow-cyan-950/30">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-400">Customer auth</p>
          <h1 className="mt-3 text-3xl font-bold">Login with OTP</h1>
        </div>

        <form onSubmit={step === 'send-otp' ? handleSendOtp : handleVerifyOtp} className="space-y-5">
          <div>
            <label htmlFor="mobile" className="mb-2 block text-sm font-medium text-slate-300">
              Mobile number
            </label>
            <input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-700/50"
            />
          </div>

          {step === 'verify-otp' && (
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-slate-300">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-700/50"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-600/60"
          >
            {loading ? 'Please wait...' : step === 'send-otp' ? 'Send OTP' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {step === 'verify-otp' ? (
            <button
              type="button"
              onClick={() => {
                setError('')
                setSuccess('')
                setStep('send-otp')
                setOtp('')
              }}
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Change mobile number
            </button>
          ) : (
            <span>Use a valid mobile number like +918510978774</span>
          )}
        </div>

        <div className="mt-5 text-center text-sm">
          <Link to="/" className="font-medium text-cyan-400 hover:text-cyan-300">
            Back to login options
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Auth
