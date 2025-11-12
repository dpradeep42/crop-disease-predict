import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, EnvelopeSimple, Phone, PencilSimple, CheckCircle } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'
import { FarmerProfile, AgronomistProfile, AdminProfile } from '@/lib/types'

export const ProfileManagement = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profile, setProfile] = useState<any>(user?.profile || {})

  if (!user) return null

  const getRoleColor = () => {
    switch (user.role) {
      case 'farmer':
        return 'bg-primary text-primary-foreground'
      case 'agronomist':
        return 'bg-secondary text-secondary-foreground'
      case 'admin':
        return 'bg-accent text-accent-foreground'
    }
  }

  const getRoleLabel = () => {
    switch (user.role) {
      case 'farmer':
        return 'Farmer'
      case 'agronomist':
        return 'Agronomist'
      case 'admin':
        return 'Administrator'
    }
  }

  const getInitials = () => {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSuccess(false)

    await updateProfile({
      name,
      phone: phone || undefined,
      profile
    })

    setIsSaving(false)
    setSuccess(true)
    setIsEditing(false)

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className={getRoleColor()}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="mb-1">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge className={getRoleColor()}>{getRoleLabel()}</Badge>
                </CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                'Cancel'
              ) : (
                <>
                  <PencilSimple className="mr-2" size={16} />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {success && (
        <Alert className="border-primary bg-primary/5">
          <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your account details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email Address</Label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="profile-email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="pl-10"
                  placeholder="Not provided"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input
                value={new Date(user.createdAt).toLocaleDateString()}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {user.role === 'farmer' && (
        <Card>
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
            <CardDescription>Information about your farming operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  value={(profile as FarmerProfile).farmName || ''}
                  onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropType">Primary Crop Type</Label>
                <Input
                  id="cropType"
                  value={(profile as FarmerProfile).cropType || ''}
                  onChange={(e) => setProfile({ ...profile, cropType: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={(profile as FarmerProfile).region || ''}
                  onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landArea">Land Area ({(profile as FarmerProfile).landUnit})</Label>
                <Input
                  id="landArea"
                  type="number"
                  value={(profile as FarmerProfile).landArea || ''}
                  onChange={(e) => setProfile({ ...profile, landArea: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === 'agronomist' && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>Your qualifications and expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={(profile as AgronomistProfile).qualification || ''}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={(profile as AgronomistProfile).specialization || ''}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Administrative Details</CardTitle>
            <CardDescription>Your department and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={(profile as AdminProfile).department || ''}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Access Level</Label>
                <Input
                  value={(profile as AdminProfile).accessLevel === 'full' ? 'Full Access' : 'Limited Access'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}
