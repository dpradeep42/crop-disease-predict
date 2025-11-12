import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plant } from '@phosphor-icons/react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordDialog } from './ForgotPasswordDialog'

interface AuthPageProps {
  onSuccess: () => void
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Plant className="text-primary" size={32} weight="fill" />
            </div>
            <h1 className="text-3xl font-semibold mb-2">AgriSecure</h1>
            <p className="text-muted-foreground">
              AI-Driven Crop Disease Prediction and Management System
            </p>
          </div>

          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm
                    onForgotPassword={() => setShowForgotPassword(true)}
                    onSuccess={onSuccess}
                  />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm onSuccess={onSuccess} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Empowering farmers with intelligent crop disease detection
          </p>
        </div>
      </div>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  )
}
