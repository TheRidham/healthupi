# Doctor Profile Integration - Setup Instructions

## What's Been Created

### 1. API Routes for Real Doctor Data

#### `/api/doctors` - Lists all doctors
- Fetches all doctors from `doctor_profiles` table
- Returns formatted data with slugs for routing
- Supports search and specialization filtering
- Usage: `GET /api/doctors?search=cardio&specialization=Cardiology`

#### `/api/doctor/[id]` - Gets single doctor details
- Fetches doctor profile by slug (e.g., `rahul-sharma`)
- Includes doctor services from `doctor_services` table
- Returns clinic photos, gallery images, all profile data
- Usage: `GET /api/doctor/rahul-sharma`

### 2. Updated `/doctors` Page
- Now fetches real data from `/api/doctors`
- Shows loading state
- Filters doctors by search and specialization
- Displays: name, title, experience, specialization, rating, clinic, location, availability

### 3. SQL Scripts

#### `sqlscript/INSTRUCTIONS-clinic-photos.sql`
Step-by-step guide to:
1. Upload photos to Supabase Storage
2. Get public URLs
3. Update `clinic_photo_urls` column in database

## How to Use

### Step 1: Update Clinic Photos in Database

1. **Upload Photos to Supabase Storage**
   - Go to: https://pknskugaqkwtfxmmkoqg.supabase.co/storage
   - Navigate to `doctor-photos` bucket
   - Create folders for each doctor by user_id:
     - `00000000-0000-0000-0000-000000000010/clinic/`
     - `00000000-0000-0000-0000-000000000011/clinic/`
   - Upload your clinic photos

2. **Get Public URLs**
   - Click each uploaded image
   - Copy the public URL (starts with `https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/...`)

3. **Run Update SQL**
   - Open `sqlscript/INSTRUCTIONS-clinic-photos.sql`
   - Replace placeholder URLs with your actual storage URLs
   - Run in Supabase SQL Editor

### Step 2: Test the `/doctors` Page

1. Visit `http://localhost:3000/doctors`
2. You should see:
   - Real doctors from database (Rahul Sharma, Priya Patel, etc.)
   - Search and filter functionality
   - Loading state

### Step 3: Test Doctor Profile API (Preview)

The `/doctor/[id]` page currently shows mock data. To test the API:

```javascript
// Test in browser console
fetch('/api/doctor/rahul-sharma')
  .then(r => r.json())
  .then(d => console.log('Doctor data:', d))
```

You should see:
- Real doctor profile data
- Services with actual prices from `doctor_services` table
- Clinic photo URLs (once you update them)

### Step 4: (Next) Update Doctor Profile Page to Use Real Data

The `components/public-profile/doctor-profile-page.tsx` currently uses mock data. To update it:

1. Add `useEffect` to fetch from `/api/doctor/${doctorId}`
2. Store fetched data in state
3. Replace all `DOCTOR.constant` references with `doctor` state
4. Show loading state while fetching

## Database Schema Mapping

### doctor_profiles Table
| Column | Frontend Field |
|--------|---------------|
| user_id | user_id |
| first_name + last_name + title | name |
| specialization | specialization |
| sub_specialization | subSpecialization |
| experience_years | experience |
| qualifications | qualifications |
| clinic_name | clinicName |
| city + state | location |
| address | address |
| phone | phone |
| email | email |
| website | website |
| languages | languages |
| base_fee | base_fee |
| availability | available (online=true) |
| rating | rating |
| review_count | reviewCount |
| patients_served | patientsServed |
| about | about |
| photo_url | avatar |
| clinic_photo_urls | clinicPhotoUrls, galleryImages |

### doctor_services Table (junction)
| Column | Use |
|--------|------|
| doctor_id | Link to doctor_profiles.user_id |
| service_id | Link to services.id |
| fee | Service price (overrides services.price) |
| enabled | Show/hide service |

### services Table
| Column | Frontend Field |
|--------|---------------|
| id | service.id |
| name | service.name |
| type | service.type (service/followup) |
| description | service.description |
| price | service.price (fallback) |
| duration_minutes | service.duration |
| icon | service.icon |

## Slug Generation

For routing, we generate slugs from doctor names:
- `Rahul Sharma` → `rahul-sharma`
- `Priya Patel` → `priya-patel`
- `Vinit Mitchell` → `vinit-mitchell`

**Note:** This is a simple implementation. For production:
- Add a `slug` column to `doctor_profiles` table
- Generate unique slugs on doctor creation
- Handle duplicates (e.g., `rahul-sharma-2`)

## Current Status

✅ **Done:**
- `/doctors` page shows real data
- API routes for fetching doctors
- SQL instructions for updating clinic photos

⏳ **TODO:**
- Update `/doctor/[id]` page to use API data
- Add slug column to doctor_profiles table
- Handle duplicate slugs
- Add more real doctors to database