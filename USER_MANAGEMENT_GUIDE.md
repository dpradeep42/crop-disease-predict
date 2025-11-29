# User Management with Supabase - Complete Guide

## YES! User profiles are now maintained in Supabase tables

### Database Architecture

#### 1. Supabase Auth (`auth.users`)
- Built-in authentication table
- Stores email, encrypted password, and auth tokens
- Managed automatically by Supabase
- Handles JWT token generation

#### 2. User Profiles (`user_profiles`)
- **Custom table linked to Supabase Auth**
- Stores all user information and role-specific data
- Foreign key relationship: `user_profiles.id → auth.users.id`

### Schema: `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('farmer', 'agronomist', 'administrator')),
  profile_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Fields Explained

- **id**: UUID matching Supabase Auth user ID (foreign key)
- **email**: User's email address (unique)
- **name**: Full name of the user
- **phone**: Optional phone number
- **role**: One of: `farmer`, `agronomist`, `administrator`
- **profile_data**: JSONB field for role-specific data
  - Farmer: `{region, cropType, landArea, landUnit}`
  - Agronomist: `{specialization, experience, certification}`
  - Administrator: `{department, accessLevel}`
- **created_at**: Account creation timestamp
- **updated_at**: Last profile update (auto-updated via trigger)

## How Authentication Works

### Registration Flow
1. User fills registration form
2. **Supabase Auth creates account** in `auth.users`
3. **Profile created** in `user_profiles` with same UUID
4. Both records linked via foreign key
5. User logged in automatically

### Login Flow
1. User enters credentials
2. **Supabase Auth validates** email/password
3. **JWT token generated** and returned
4. **Profile loaded** from `user_profiles` table
5. User redirected to role-specific dashboard

### Data Flow Diagram
```
User Registration
    ↓
Supabase Auth (auth.users)
    ↓ (returns user.id)
user_profiles table (insert with same id)
    ↓
User Profile Loaded
    ↓
Dashboard Displayed
```

## Row Level Security (RLS)

### Users can view their own profile
```sql
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

### Users can update their own profile
```sql
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Administrators can view all profiles
```sql
CREATE POLICY "Administrators can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );
```

## Code Implementation

### Auth Hook (`use-auth.tsx`)
```typescript
// On login
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password,
})

// Load profile from database
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', authData.user.id)
  .single()
```

### Registration
```typescript
// Create auth user
const { data: authData } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
})

// Create profile
await supabase.from('user_profiles').insert({
  id: authData.user.id,
  email: data.email,
  name: data.name,
  phone: data.phone,
  role: data.role,
  profile_data: data.profile
})
```

### Update Profile
```typescript
await supabase
  .from('user_profiles')
  .update({
    name: updates.name,
    phone: updates.phone,
    profile_data: updates.profile
  })
  .eq('id', user.id)
```

## Benefits of This Architecture

### 1. Security
✅ Passwords managed by Supabase (never stored in plain text)
✅ JWT tokens for secure API access
✅ RLS policies enforce data isolation
✅ Foreign key ensures referential integrity

### 2. Scalability
✅ Built on PostgreSQL (production-ready)
✅ Auto-scaling with Supabase infrastructure
✅ Efficient indexing on email and role
✅ JSONB for flexible profile data

### 3. Maintainability
✅ Separation of concerns (auth vs profile data)
✅ Auto-updating timestamps via triggers
✅ Type-safe with TypeScript
✅ Consistent data model

### 4. Features
✅ Email verification (Supabase built-in)
✅ Password reset (Supabase built-in)
✅ Session management (automatic)
✅ Multi-device support (via JWT)

## Data Relationships

### User → Crop Scans
```
user_profiles.id (UUID)
    ↓
crop_scans.user_id (text, should be UUID)
```

**Note**: `crop_scans.user_id` is currently `text` but stores UUID values from Supabase Auth.

### Complete Data Model
```
auth.users (Supabase managed)
    ↓ (id)
user_profiles
    ↓ (id as user_id)
crop_scans
    ↓ (disease_detected)
diseases
    ↓ (id as disease_id)
remedies
```

## Migration from Local Storage

### Before (Local Storage)
- User data stored in browser only
- No persistence across devices
- No server-side validation
- Vulnerable to data loss

### After (Supabase)
- ✅ User data in PostgreSQL database
- ✅ Available on all devices
- ✅ Server-side security
- ✅ Backed up and recoverable

## Testing User Management

### Create New User
1. Go to registration page
2. Fill in details (name, email, password, role)
3. Submit form
4. Check Supabase Dashboard:
   - `auth.users` table should have new entry
   - `user_profiles` table should have matching entry

### Login Existing User
1. Enter credentials
2. System validates via Supabase Auth
3. Profile loaded from `user_profiles`
4. Dashboard displays with profile data

### Update Profile
1. Navigate to profile settings
2. Update name, phone, or profile data
3. Changes saved to `user_profiles` table
4. `updated_at` timestamp automatically updated

## Admin Dashboard Features

Administrators can:
- View all user profiles (RLS policy allows)
- Monitor scan activity
- Access system-wide statistics
- Manage disease/remedy database

## Security Best Practices Implemented

✅ **Password Security**: Handled by Supabase (bcrypt hashing)
✅ **SQL Injection Prevention**: Parameterized queries via Supabase client
✅ **XSS Protection**: React automatically escapes output
✅ **CSRF Protection**: JWT tokens (no cookies needed)
✅ **Data Isolation**: RLS ensures users only see their data
✅ **Audit Trail**: Timestamps on all records

## Querying User Data

### Get current user profile
```typescript
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', auth.uid())
  .single()
```

### Get all farmers (admin only)
```typescript
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('role', 'farmer')
```

### Get user with scan count
```typescript
const { data } = await supabase
  .from('user_profiles')
  .select(`
    *,
    scans:crop_scans(count)
  `)
  .eq('id', auth.uid())
  .single()
```

## Summary

**YES**, user login profiles are now **fully maintained in Supabase tables**:

1. ✅ `auth.users` - Authentication (email, password, tokens)
2. ✅ `user_profiles` - Profile data (name, role, profile_data)
3. ✅ RLS policies - Security and data isolation
4. ✅ Foreign key - Referential integrity
5. ✅ Auto-timestamps - Audit trail
6. ✅ Complete integration - Registration, login, profile updates

**No more local storage for user data** - everything is persisted in the Supabase PostgreSQL database with enterprise-grade security!
