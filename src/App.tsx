import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { AuthPage } from '@/components/auth/AuthPage'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProfileManagement } from '@/components/ProfileManagement'
import { FarmerDashboard } from '@/components/dashboards/FarmerDashboard'
import { AgronomistDashboard } from '@/components/dashboards/AgronomistDashboard'
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'
import { FarmerProfile, AgronomistProfile, AdminProfile } from '@/lib/types'

const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [view, setView] = useState<'dashboard' | 'profile'>('dashboard')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setView('dashboard')} />
  }

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role) {
      case 'farmer':
        return (
          <FarmerDashboard
            userName={user.name}
            profile={user.profile as FarmerProfile}
          />
        )
      case 'agronomist':
        return (
          <AgronomistDashboard
            userName={user.name}
            profile={user.profile as AgronomistProfile}
          />
        )
      case 'admin':
        return (
          <AdminDashboard
            userName={user.name}
            profile={user.profile as AdminProfile}
          />
        )
    }
  }

  return (
    <DashboardLayout onViewProfile={() => setView('profile')}>
      {view === 'dashboard' ? (
        <div>
          <button
            onClick={() => setView('profile')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to Profile
          </button>
          {renderDashboard()}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setView('dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to Dashboard
          </button>
          <ProfileManagement />
        </div>
      )}
    </DashboardLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default App