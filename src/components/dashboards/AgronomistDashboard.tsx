import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartLine, Users, Bell, TrendUp, Warning } from '@phosphor-icons/react'
import { AgronomistProfile } from '@/lib/types'

interface AgronomistDashboardProps {
  userName: string
  profile: AgronomistProfile
}

export const AgronomistDashboard = ({ userName, profile }: AgronomistDashboardProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Welcome, Dr. {userName}</h1>
        <p className="text-muted-foreground">Agronomist • {profile.specialization}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="text-primary" size={18} weight="fill" />
              Assigned Farmers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.assignedFarmers?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="text-secondary" size={18} weight="fill" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning className="text-destructive" size={18} weight="fill" />
              Critical Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendUp className="text-accent" size={18} weight="fill" />
              Resolved This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">28</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="text-primary" size={24} weight="fill" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Disease detection requests from farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { farmer: 'Rajesh Kumar', crop: 'Rice', issue: 'Leaf Blight Suspected', time: '2 hours ago', severity: 'high' },
                { farmer: 'Priya Sharma', crop: 'Wheat', issue: 'Rust Disease Detected', time: '5 hours ago', severity: 'medium' },
                { farmer: 'Anil Patel', crop: 'Cotton', issue: 'Pest Infestation', time: '1 day ago', severity: 'low' },
              ].map((alert, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{alert.farmer} - {alert.crop}</p>
                    <p className="text-sm text-muted-foreground">{alert.issue}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="text-primary" size={24} weight="fill" />
              Analytics Summary
            </CardTitle>
            <CardDescription>Disease trends and prevention insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Leaf Blight</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-destructive" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Rust Disease</span>
                  <span className="text-sm text-muted-foreground">30%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: '30%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Pest Infestation</span>
                  <span className="text-sm text-muted-foreground">25%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Qualification & Expertise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{profile.qualification}</Badge>
            <Badge variant="outline">{profile.specialization}</Badge>
            <Badge variant="outline">Crop Disease Expert</Badge>
            <Badge variant="outline">Pest Management</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
