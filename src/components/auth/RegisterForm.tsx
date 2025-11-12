import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, EnvelopeSimple, Phone, LockKey, Eye, EyeSlash, WarningCircle, CheckCircle } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'
import { validateEmail, validatePhone, validatePassword } from '@/lib/auth'
import { UserRole, FarmerProfile, AgronomistProfile, AdminProfile } from '@/lib/types'
import { RoleSelector } from './RoleSelector'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'

interface RegisterFormProps {
  onSuccess: () => void
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register } = useAuth()
  const [step, setStep] = useState<'basic' | 'role' | 'profile' | 'password'>('basic')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [farmerProfile, setFarmerProfile] = useState<Partial<FarmerProfile>>({
    farmName: '',
    cropType: '',
    region: '',
    landArea: 0,
    landUnit: 'acres'
  })

  const [agronomistProfile, setAgronomistProfile] = useState<Partial<AgronomistProfile>>({
    qualification: '',
    specialization: '',
    assignedFarmers: []
  })

  const [adminProfile, setAdminProfile] = useState<Partial<AdminProfile>>({
    accessLevel: 'limited',
    department: ''
  })

  const handleBasicNext = () => {
    setError('')
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    if (phone && !validatePhone(phone)) {
      setError('Please enter a valid phone number')
      return
    }
    
    setStep('role')
  }

  const handleRoleNext = () => {
    setError('')
    
    if (!role) {
      setError('Please select a role')
      return
    }
    
    setStep('profile')
  }

  const handleProfileNext = () => {
    setError('')
    
    if (role === 'farmer') {
      if (!farmerProfile.farmName || !farmerProfile.cropType || !farmerProfile.region || !farmerProfile.landArea) {
        setError('Please fill in all farm details')
        return
      }
    } else if (role === 'agronomist') {
      if (!agronomistProfile.qualification || !agronomistProfile.specialization) {
        setError('Please fill in all professional details')
        return
      }
    } else if (role === 'admin') {
      if (!adminProfile.department) {
        setError('Please fill in all administrator details')
        return
      }
    }
    
    setStep('password')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    let profile: any
    if (role === 'farmer') profile = farmerProfile
    else if (role === 'agronomist') profile = agronomistProfile
    else profile = adminProfile

    const result = await register({
      name,
      email,
      phone,
      password,
      role: role!,
      profile
    })

    setIsLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20">
          <CheckCircle className="text-primary" size={40} weight="fill" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Account created successfully!</h3>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['basic', 'role', 'profile', 'password'].map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step === s ? 'bg-primary' : i < ['basic', 'role', 'profile', 'password'].indexOf(step) ? 'bg-primary/50' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <WarningCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'basic' && (
        <form onSubmit={(e) => { e.preventDefault(); handleBasicNext(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-register">Email Address *</Label>
            <div className="relative">
              <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="email-register"
                type="email"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue
          </Button>
        </form>
      )}

      {step === 'role' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Select Your Role</h3>
            <p className="text-sm text-muted-foreground">Choose how you'll use the platform</p>
          </div>
          
          <RoleSelector value={role} onChange={setRole} />

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('basic')}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={handleRoleNext}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'profile' && (
        <form onSubmit={(e) => { e.preventDefault(); handleProfileNext(); }} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Profile Details</h3>
            <p className="text-sm text-muted-foreground">Tell us more about yourself</p>
          </div>

          {role === 'farmer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input
                  id="farmName"
                  placeholder="Green Valley Farm"
                  value={farmerProfile.farmName}
                  onChange={(e) => setFarmerProfile({ ...farmerProfile, farmName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropType">Primary Crop Type *</Label>
                <Input
                  id="cropType"
                  placeholder="Wheat, Rice, Corn, etc."
                  value={farmerProfile.cropType}
                  onChange={(e) => setFarmerProfile({ ...farmerProfile, cropType: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  placeholder="Punjab, Maharashtra, etc."
                  value={farmerProfile.region}
                  onChange={(e) => setFarmerProfile({ ...farmerProfile, region: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area *</Label>
                  <Input
                    id="landArea"
                    type="number"
                    placeholder="10"
                    value={farmerProfile.landArea || ''}
                    onChange={(e) => setFarmerProfile({ ...farmerProfile, landArea: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landUnit">Unit *</Label>
                  <select
                    id="landUnit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={farmerProfile.landUnit}
                    onChange={(e) => setFarmerProfile({ ...farmerProfile, landUnit: e.target.value as 'acres' | 'hectares' })}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {role === 'agronomist' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  placeholder="M.Sc. Agriculture, Ph.D., etc."
                  value={agronomistProfile.qualification}
                  onChange={(e) => setAgronomistProfile({ ...agronomistProfile, qualification: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  placeholder="Crop Protection, Soil Science, etc."
                  value={agronomistProfile.specialization}
                  onChange={(e) => setAgronomistProfile({ ...agronomistProfile, specialization: e.target.value })}
                />
              </div>
            </>
          )}

          {role === 'admin' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="Operations, Technical, etc."
                  value={adminProfile.department}
                  onChange={(e) => setAdminProfile({ ...adminProfile, department: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level *</Label>
                <select
                  id="accessLevel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={adminProfile.accessLevel}
                  onChange={(e) => setAdminProfile({ ...adminProfile, accessLevel: e.target.value as 'full' | 'limited' })}
                >
                  <option value="limited">Limited</option>
                  <option value="full">Full Access</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('role')}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Create Password</h3>
            <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-new">Password *</Label>
            <div className="relative">
              <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="password-new"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <PasswordStrengthMeter password={password} />

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('profile')} disabled={isLoading}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
