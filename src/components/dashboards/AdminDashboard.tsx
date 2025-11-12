import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Users, ChartBar, Database, Activity } from '@phosphor-icons/react'
import { AdminProfile } from '@/lib/types'

interface AdminDashboardProps {
  userName: string
  profile: AdminProfile
}

export const AdminDashboard = ({ userName, profile }: AdminDashboardProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Administrator Dashboard</h1>
        <p className="text-muted-foreground">{userName} • {profile.department} Department</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="text-primary" size={18} weight="fill" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2,547</p>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="text-secondary" size={18} weight="fill" />
              Disease Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8,392</p>
            <p className="text-xs text-muted-foreground mt-1">+28% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="text-accent" size={18} weight="fill" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">342</p>
            <p className="text-xs text-muted-foreground mt-1">Live now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ChartBar className="text-primary" size={18} weight="fill" />
              Detection Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">94.8%</p>
            <p className="text-xs text-muted-foreground mt-1">AI model performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" size={24} weight="fill" />
              User Distribution
            </CardTitle>
            <CardDescription>Active users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">Farmers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">2,234</span>
                  <Badge variant="outline">87.7%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-sm font-medium">Agronomists</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">287</span>
                  <Badge variant="outline">11.3%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm font-medium">Administrators</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">26</span>
                  <Badge variant="outline">1.0%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-primary" size={24} weight="fill" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-accent">Excellent</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Database Load</span>
                  <span className="text-sm text-primary">Good</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '68%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Server Uptime</span>
                  <span className="text-sm text-accent">99.9%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '99.9%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} weight="fill" />
            Access Control
          </CardTitle>
          <CardDescription>Your administrative privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {profile.accessLevel === 'full' ? 'Full Access' : 'Limited Access'}
            </Badge>
            <Badge variant="outline">User Management</Badge>
            <Badge variant="outline">System Configuration</Badge>
            <Badge variant="outline">Analytics Dashboard</Badge>
            <Badge variant="outline">Audit Logs</Badge>
            {profile.accessLevel === 'full' && (
              <>
                <Badge variant="outline">Database Access</Badge>
                <Badge variant="outline">Security Settings</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
