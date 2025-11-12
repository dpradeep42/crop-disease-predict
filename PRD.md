# Planning Guide

A secure, accessible authentication system for an AI-Driven Crop Disease Prediction platform that enables farmers, agronomists, and administrators to safely access role-specific agricultural tools and insights.

**Experience Qualities**:
1. **Accessible** - Designed for low-literacy rural users with clear visual cues, minimal text, and intuitive icons that transcend language barriers
2. **Trustworthy** - Secure authentication with clear feedback that builds confidence through transparent processes and helpful error messages
3. **Efficient** - Streamlined login flows with smart defaults and "Remember Me" functionality that respects users' time and connectivity constraints

**Complexity Level**: Light Application (multiple features with basic state)
  - Handles user registration, login, password recovery, and profile management with role-based access control, but operates entirely client-side using Spark's KV persistence

## Essential Features

### User Registration
- **Functionality**: Multi-step registration form capturing user details (name, email/phone, password, role selection, role-specific profile data)
- **Purpose**: Onboard new users while collecting essential information for personalized agricultural services
- **Trigger**: User clicks "Create Account" button on login screen
- **Progression**: Landing → Click Sign Up → Select Role (Farmer/Agronomist/Admin) → Enter Basic Details → Enter Role-Specific Details → Password Creation with Strength Meter → Success Confirmation → Auto-Login to Dashboard
- **Success criteria**: User account persisted in KV store with hashed password, user redirected to role-appropriate dashboard

### User Login
- **Functionality**: Email/username + password authentication with "Remember Me" option
- **Purpose**: Secure access to personalized disease prediction tools and agricultural data
- **Trigger**: User enters credentials and clicks "Login" button
- **Progression**: Enter Email/Phone → Enter Password → Optional Remember Me → Submit → JWT Token Generation → Role Detection → Dashboard Redirect
- **Success criteria**: Valid credentials authenticate user, session token stored, user sees role-specific dashboard

### Password Recovery
- **Functionality**: Simulated OTP-based password reset workflow
- **Purpose**: Enable users to regain access when passwords are forgotten
- **Trigger**: User clicks "Forgot Password?" link on login screen
- **Progression**: Click Forgot Password → Enter Email/Phone → Verify Identity → Generate OTP (simulated display) → Enter OTP → Create New Password → Success Message → Return to Login
- **Success criteria**: User can reset password and successfully login with new credentials

### Role-Based Access Control
- **Functionality**: Three distinct user roles with different permissions and dashboard views
- **Purpose**: Provide tailored experiences based on user type (Farmer: disease detection, Agronomist: analytics, Admin: system management)
- **Trigger**: Successful login triggers role detection from user profile
- **Progression**: Login → Role Check → Dashboard Render (Farmer: Quick Disease Scan Panel / Agronomist: Farmer Analytics / Admin: User Management)
- **Success criteria**: Each role sees appropriate interface and has access only to permitted features

### Profile Management
- **Functionality**: View and edit user profile information including role-specific data
- **Purpose**: Keep user information current for better service delivery and contact
- **Trigger**: User clicks profile icon/avatar in navigation
- **Progression**: Dashboard → Profile Icon → View Profile → Edit Mode → Update Fields → Validate → Save → Success Toast
- **Success criteria**: Profile changes persist in KV store and reflect immediately in UI

## Edge Case Handling
- **Duplicate Registration**: Prevent multiple accounts with same email/phone - show clear error message
- **Invalid Credentials**: Display helpful error distinguishing between wrong password vs user not found
- **Weak Passwords**: Real-time password strength validation with visual meter and requirements list
- **Session Expiry**: Detect expired sessions and gracefully redirect to login with message
- **Network Failures**: Show retry options with offline-friendly error messages (relevant for rural connectivity)
- **Incomplete Registration**: Allow users to resume registration if they abandon mid-process

## Design Direction
The design should feel trustworthy, calm, and accessible - blending modern digital interfaces with agricultural warmth through earth tones and nature-inspired elements, while maintaining maximum clarity through high contrast and generous spacing that serves users with varying literacy and tech familiarity.

## Color Selection
Custom palette - Earth tones with vibrant green accents to evoke agricultural trust and growth

- **Primary Color**: Deep Forest Green (oklch(0.45 0.12 155)) - communicates growth, nature, and agricultural expertise; used for primary CTAs and brand elements
- **Secondary Colors**: 
  - Warm Soil Brown (oklch(0.55 0.08 60)) - grounding and trustworthy for secondary actions
  - Sky Blue (oklch(0.65 0.12 230)) - clarity and hope for informational elements
- **Accent Color**: Vibrant Lime (oklch(0.75 0.18 135)) - energetic growth for highlights, success states, and important notifications
- **Foreground/Background Pairings**:
  - Background (Soft Cream #FAFAF5 / oklch(0.98 0.01 90)): Dark Charcoal text (oklch(0.25 0.02 60)) - Ratio 13.2:1 ✓
  - Card (White #FFFFFF / oklch(1 0 0)): Dark Charcoal text (oklch(0.25 0.02 60)) - Ratio 14.5:1 ✓
  - Primary (Deep Forest Green): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓
  - Secondary (Warm Soil Brown): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Accent (Vibrant Lime): Dark Charcoal text (oklch(0.25 0.02 60)) - Ratio 5.2:1 ✓
  - Muted (Light Sage #E8F0E5 / oklch(0.93 0.03 135)): Medium Gray text (oklch(0.5 0.02 60)) - Ratio 5.8:1 ✓

## Font Selection
Typography should be highly legible at all sizes with clear distinctions between interactive elements and content, using friendly rounded sans-serifs that feel approachable to users of all literacy levels.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter SemiBold / 32px / -0.02em letter spacing / 1.2 line height
  - H2 (Section Headers): Inter SemiBold / 24px / -0.01em letter spacing / 1.3 line height
  - H3 (Card Titles): Inter Medium / 18px / normal letter spacing / 1.4 line height
  - Body (Forms & Content): Inter Regular / 16px / normal letter spacing / 1.6 line height
  - Small (Helper Text): Inter Regular / 14px / normal letter spacing / 1.5 line height
  - Button Text: Inter Medium / 16px / normal letter spacing / 1.0 line height

## Animations
Animations should be gentle and purposeful - reinforcing successful actions with subtle celebration while guiding attention during multi-step processes, all while remaining fast enough for users with limited connectivity.

- **Purposeful Meaning**: Success states celebrate with gentle bounce/scale effects; form validation uses smooth color transitions; page transitions slide gracefully to maintain spatial context
- **Hierarchy of Movement**: Primary CTAs have subtle hover lift; form field focus has gentle glow; error states shake briefly; success confirmations scale in with spring physics

## Component Selection
- **Components**: 
  - `Card` for login/signup containers with subtle shadow elevation
  - `Input` with custom focus states and inline validation icons
  - `Button` with loading states and role-specific color variants
  - `Select` for role selection with large touch targets
  - `Tabs` for switching between Login/Signup
  - `Avatar` for user profile display
  - `Badge` for role indicators
  - `Dialog` for password reset flow
  - `Progress` for password strength meter
  - `Alert` for error/success messages with contextual icons
  - `Label` with required field indicators
  
- **Customizations**: 
  - Custom password strength indicator component with visual meter and requirement checklist
  - Large icon-based role selector cards (not standard dropdown)
  - Step indicator for multi-step registration
  - Custom OTP input component with auto-focus progression
  
- **States**: 
  - Buttons: Default (solid primary) → Hover (slight scale + brightness) → Active (pressed inset) → Loading (spinner + disabled) → Disabled (muted opacity)
  - Inputs: Default (border) → Focus (ring + border accent) → Valid (green check icon) → Invalid (red border + error message) → Disabled (muted background)
  
- **Icon Selection**: 
  - Login: `SignIn`, `EnvelopeSimple`, `LockKey`, `Eye`/`EyeSlash`
  - Registration: `UserPlus`, `Identification`, `Phone`, `MapPin`
  - Roles: `Plant` (Farmer), `ChartLine` (Agronomist), `ShieldCheck` (Admin)
  - Success: `CheckCircle`, `Confetti`
  - Error: `WarningCircle`, `XCircle`
  - Profile: `User`, `PencilSimple`, `SignOut`
  
- **Spacing**: 
  - Container padding: `p-6` (24px) on mobile, `p-8` (32px) on desktop
  - Form field gaps: `gap-4` (16px) for vertical stacking
  - Button spacing: `px-6 py-3` (24px × 12px)
  - Card gaps: `gap-6` (24px) between sections
  
- **Mobile**: 
  - Single column layout with full-width form fields
  - Bottom sheet for role selection instead of cards
  - Sticky header with back navigation
  - Touch-optimized 48px minimum touch targets
  - Reduced animation complexity for performance
  - Stack navigation tabs vertically below 640px
