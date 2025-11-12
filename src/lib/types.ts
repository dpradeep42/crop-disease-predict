export type UserRole = 'farmer' | 'agronomist' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  createdAt: string
  passwordHash: string
  profile: FarmerProfile | AgronomistProfile | AdminProfile
}

export interface FarmerProfile {
  farmName: string
  cropType: string
  region: string
  landArea: number
  landUnit: 'acres' | 'hectares'
}

export interface AgronomistProfile {
  qualification: string
  assignedFarmers: string[]
  specialization: string
}

export interface AdminProfile {
  accessLevel: 'full' | 'limited'
  department: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
  rememberMe: boolean
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormData {
  name: string
  email: string
  phone?: string
  password: string
  role: UserRole
  profile: Partial<FarmerProfile | AgronomistProfile | AdminProfile>
}

export interface PasswordResetData {
  email: string
  otp: string
  newPassword: string
}
