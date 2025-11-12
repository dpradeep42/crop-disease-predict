import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { validatePassword } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { strength, requirements } = validatePassword(password)
  
  const getStrengthColor = () => {
    if (strength < 40) return 'bg-destructive'
    if (strength < 70) return 'bg-secondary'
    return 'bg-primary'
  }
  
  const getStrengthLabel = () => {
    if (strength < 40) return 'Weak'
    if (strength < 70) return 'Medium'
    return 'Strong'
  }
  
  if (!password) return null
  
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className="font-medium">{getStrengthLabel()}</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className={cn("h-full transition-all", getStrengthColor())}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          {requirements.length ? (
            <CheckCircle className="text-primary" size={16} weight="fill" />
          ) : (
            <XCircle className="text-muted-foreground" size={16} />
          )}
          <span className={requirements.length ? 'text-foreground' : 'text-muted-foreground'}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.uppercase ? (
            <CheckCircle className="text-primary" size={16} weight="fill" />
          ) : (
            <XCircle className="text-muted-foreground" size={16} />
          )}
          <span className={requirements.uppercase ? 'text-foreground' : 'text-muted-foreground'}>
            One uppercase letter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.lowercase ? (
            <CheckCircle className="text-primary" size={16} weight="fill" />
          ) : (
            <XCircle className="text-muted-foreground" size={16} />
          )}
          <span className={requirements.lowercase ? 'text-foreground' : 'text-muted-foreground'}>
            One lowercase letter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.number ? (
            <CheckCircle className="text-primary" size={16} weight="fill" />
          ) : (
            <XCircle className="text-muted-foreground" size={16} />
          )}
          <span className={requirements.number ? 'text-foreground' : 'text-muted-foreground'}>
            One number
          </span>
        </div>
      </div>
    </div>
  )
}
