import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plant, Bug, FirstAid, CloudSun, MapPin, Scales } from '@phosphor-icons/react'
import { FarmerProfile } from '@/lib/types'
import { CropScanner } from '@/components/CropScanner'

interface FarmerDashboardProps {
  userName: string
  profile: FarmerProfile
}

export const FarmerDashboard = ({ userName, profile }: FarmerDashboardProps) => {
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Monitor your crops and detect diseases early</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="text-primary" size={18} weight="fill" />
              Farm Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.region}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plant className="text-primary" size={18} weight="fill" />
              Primary Crop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.cropType}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scales className="text-primary" size={18} weight="fill" />
              Land Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profile.landArea} {profile.landUnit}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  <Bug className="text-primary" size={24} weight="fill" />
                  Disease Detection
                </CardTitle>
                <CardDescription>
                  Upload crop images to identify diseases instantly using AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={() => setScannerOpen(true)}>
              Scan Crop Image
            </Button>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  <FirstAid className="text-secondary" size={24} weight="fill" />
                  Treatment Recommendations
                </CardTitle>
                <CardDescription>
                  Get expert remedies and treatment plans for detected issues
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" size="lg">
              View Remedies
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSun className="text-primary" size={24} weight="fill" />
            Weather & Alerts
          </CardTitle>
          <CardDescription>Current conditions and upcoming advisories for {profile.region}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Weather Alert</p>
                <p className="text-sm text-muted-foreground">Moderate rainfall expected in 2 days</p>
              </div>
              <Badge variant="secondary">Advisory</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Crop Health Status</p>
                <p className="text-sm text-muted-foreground">No active disease alerts for your region</p>
              </div>
              <Badge className="bg-accent text-accent-foreground">Good</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <CropScanner open={scannerOpen} onOpenChange={setScannerOpen} />
    </div>
  )
}
