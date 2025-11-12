import { UserRole } from '@/lib/types'
import { Plant, ChartLine, ShieldCheck } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RoleSelectorProps {
  value: UserRole | null
  onChange: (role: UserRole) => void
}

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  const roles: { value: UserRole; label: string; description: string; icon: typeof Plant }[] = [
    {
      value: 'farmer',
      label: 'Farmer',
      description: 'Detect crop diseases and get solutions',
      icon: Plant
    },
    {
      value: 'agronomist',
      label: 'Agronomist',
      description: 'Monitor farmers and provide expert advice',
      icon: ChartLine
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Manage system and oversee operations',
      icon: ShieldCheck
    }
  ]
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {roles.map(role => {
        const Icon = role.icon
        const isSelected = value === role.value
        
        return (
          <Card
            key={role.value}
            className={cn(
              'p-4 cursor-pointer transition-all border-2',
              'hover:border-primary/50 hover:shadow-md',
              isSelected && 'border-primary bg-primary/5 shadow-md'
            )}
            onClick={() => onChange(role.value)}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                <Icon size={24} weight={isSelected ? 'fill' : 'regular'} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">{role.label}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
