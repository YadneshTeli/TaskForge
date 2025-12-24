import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import axios from 'axios'

/* global process */
const API_BASE_URL = process.env.VITE_API_URL || 'http://10.72.125.97:4000/api'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState('verifying') // verifying, success, error, expired
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        token: verificationToken
      })

      setStatus('success')
      setMessage(response.data.message || 'Email verified successfully!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { emailVerified: true } })
      }, 3000)
    } catch (error) {
      setStatus('error')
      
      if (error.response?.status === 400) {
        const errorMsg = error.response.data.message || ''
        if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
          setStatus('expired')
          setMessage('Your verification link has expired or is invalid.')
        } else {
          setMessage(errorMsg)
        }
      } else {
        setMessage('Failed to verify email. Please try again.')
      }
    }
  }

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('No verification token found. Please check your email link.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address')
      return
    }

    setResending(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email: email
      })

      setMessage(response.data.message || 'Verification email sent! Please check your inbox.')
      setStatus('success')
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to resend verification email. Please try again.'
      )
    } finally {
      setResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <CardTitle className="text-center">Verifying Your Email</CardTitle>
            <CardDescription className="text-center mt-2">
              Please wait while we verify your email address...
            </CardDescription>
          </>
        )

      case 'success':
        return (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-green-600">Email Verified!</CardTitle>
            <CardDescription className="text-center mt-2">
              {message}
            </CardDescription>
            <p className="text-center text-sm text-gray-500 mt-4">
              Redirecting to login page...
            </p>
          </>
        )

      case 'expired':
        return (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-center text-orange-600">Link Expired</CardTitle>
            <CardDescription className="text-center mt-2">
              {message}
            </CardDescription>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </>
        )

      case 'error':
        return (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-center text-red-600">Verification Failed</CardTitle>
            <CardDescription className="text-center mt-2">
              {message}
            </CardDescription>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          {renderContent()}
        </CardHeader>

        {(status === 'success' || status === 'expired' || status === 'error') && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="w-full border-t pt-4">
              <p className="text-center text-sm text-gray-600">
                {status === 'success' ? (
                  <>
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                      Login here
                    </Link>
                  </>
                ) : (
                  <>
                    Need help?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                      Back to Login
                    </Link>
                  </>
                )}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
