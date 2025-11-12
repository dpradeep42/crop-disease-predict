import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EnvelopeSimple, LockKey, Eye, EyeSlash, WarningCircle, CheckCircle } from '@phosphor-icons/react'
import { validateEmail, generateOTP, hashPassword, validatePassword } from '@/lib/auth'
import { User } from '@/lib/types'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'

interface ForgotPasswordDialogProps {
  open: boolean
  onClose: () => void
}

export const ForgotPasswordDialog = ({ open, onClose }: ForgotPasswordDialogProps) => {
  const [users, setUsers] = useKV<User[]>('users', [])
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const [enteredOTP, setEnteredOTP] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    const user = users?.find(u => u.email === email.toLowerCase())
    if (!user) {
      setError('No account found with this email address')
      return
    }

    const otp = generateOTP()
    setGeneratedOTP(otp)
    setStep('otp')
  }

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (enteredOTP !== generatedOTP) {
      setError('Invalid OTP. Please try again.')
      return
    }

    setStep('password')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    const passwordHash = await hashPassword(newPassword)
    
    setUsers(currentUsers =>
      (currentUsers || []).map(u =>
        u.email === email.toLowerCase()
          ? { ...u, passwordHash }
          : u
      )
    )

    setIsLoading(false)
    setStep('success')
  }

  const handleClose = () => {
    setStep('email')
    setEmail('')
    setGeneratedOTP('')
    setEnteredOTP('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <WarningCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll send a verification code to reset your password
              </p>
            </div>

            <Button type="submit" className="w-full">
              Send Verification Code
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Verification Code: {generatedOTP}</strong>
                <br />
                <span className="text-sm">In production, this would be sent via email/SMS</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="otp">Enter Verification Code</Label>
              <Input
                id="otp"
                placeholder="000000"
                value={enteredOTP}
                onChange={(e) => setEnteredOTP(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('email')}>
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Verify
              </Button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <PasswordStrengthMeter password={newPassword} />

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20">
              <CheckCircle className="text-primary" size={40} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Password Reset Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                You can now login with your new password
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Return to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
