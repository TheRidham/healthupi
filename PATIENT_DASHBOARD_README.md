# Patient Dashboard - Setup Guide

## Overview
A fully modular patient dashboard built following the doctor dashboard pattern with three main tabs:
- **Profile Tab**: View patient information
- **Appointments Tab**: View upcoming and past appointments  
- **Profile Edit Tab**: Edit profile details (integrated as modal-like experience)

## Folder Structure

```
components/patient-dashboard/
├── index.ts                    # Barrel export
├── ProfileTab.tsx              # Patient profile view
├── AppointmentsTab.tsx         # Appointments list
└── ProfileEditTab.tsx          # Profile editing form

app/(main)/patient/
├── page.tsx                    # Redirect to dashboard
└── dashboard/
    └── page.tsx                # Main dashboard container
```

## Components Documentation

### ProfileTab.tsx
**Purpose**: Display patient profile information in read-only mode

**Props**:
```typescript
interface ProfileTabProps {
  onEditClick: () => void;  // Callback when edit button is clicked
}
```

**Features**:
- Displays basic info: name, age, gender, blood group
- Shows contact information: phone, email, address
- Shows medical info: allergies, medical conditions
- Edit button triggers parent to switch to edit mode
- Responsive grid layout
- Loading and error states

**API Call**:
- GET `/api/patient/profile` - fetches profile data

---

### AppointmentsTab.tsx
**Purpose**: Display upcoming and past appointments

**Props**: None (fetches data directly)

**Features**:
- Separates appointments into "Upcoming" and "Past" sections
- Appointment cards show:
  - Doctor name and clinic
  - Date (formatted: "Mon, Jan 01, 2024")
  - Time and duration
  - Consultation type (Online/In-Clinic)
  - Doctor phone number
  - Service name
  - Status badge (confirmed, completed, cancelled, pending)
- Action buttons per status:
  - Confirmed: Reschedule, Cancel
  - Completed: View Details
- Responsive grid layout
- Loading and error states

**API Call**:
- GET `/api/dashboard/appointments` - fetches appointments list

**Status Colors**:
- confirmed: green
- completed: blue
- cancelled: red
- pending: yellow

---

### ProfileEditTab.tsx
**Purpose**: Allow patients to edit their profile

**Props**:
```typescript
interface ProfileEditTabProps {
  profile: PatientProfile | null;  // Current profile data
  onSaved: () => void;              // Called after successful save
  onCancel: () => void;             // Called when user cancels
}
```

**Features**:
- Three sections:
  1. **Basic Information**
     - Full name (text input)
     - Date of birth (date picker)
     - Gender (dropdown: Male, Female, Other)
     - Blood group (dropdown: O+, O-, A+, A-, B+, B-, AB+, AB-)
  
  2. **Contact Information**
     - Phone number (tel input)
     - Email (disabled, cannot be changed)
     - Street address (text input)
     - City (text input)
     - State (dropdown with all 28 Indian states)
     - ZIP/PIN code (text input)
  
  3. **Medical Information**
     - Allergies (text input)
     - Medical conditions (text input)

- Form validation with error messages
- Success notification after save
- Cancel button to discard changes
- Disabled submit button while loading

**API Call**:
- PUT `/api/patient/profile` - updates profile data

---

### Main Dashboard (page.tsx)
**Purpose**: Container component that manages tab state and renders appropriate tab

**Features**:
- Header with logo, title, and sign out button
- Tab switcher with icons:
  - Profile (User icon)
  - Appointments (Calendar icon)
- Edit mode integration: clicking edit switches seamlessly to edit tab
- Auto-reload profile after successful edit
- Patient branding (green color scheme with Heart icon)
- Responsive layout with max-width constraint

**Flow**:
```
1. User loads /patient/dashboard
2. ProfileTab loads → user clicks Edit
3. Switch to edit tab → ProfileEditTab
4. User saves → ProfileTab reloads and switches back to profile view
```

---

## Setup Instructions

### 1. API Endpoints Required

You need to create these API routes:

**GET `/api/patient/profile`**
```typescript
Response:
{
  success: boolean;
  data?: {
    id: string;
    user_id: string;
    name: string | null;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
    phone: string | null;
    email: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    allergies: string | null;
    medical_conditions: string | null;
  };
  error?: string;
}
```

**PUT `/api/patient/profile`**
```typescript
Request body: Same as above profile object
Response:
{
  success: boolean;
  data?: PatientProfile;
  error?: string;
}
```

**GET `/api/dashboard/appointments`**
```typescript
Response:
{
  success: boolean;
  data?: Array<{
    id: string;
    doctor_id: string;
    patient_id: string;
    appointment_date: string;  // ISO date
    appointment_time: string;   // HH:MM format
    duration: number;           // minutes
    service_name: string;
    status: "confirmed" | "completed" | "cancelled" | "pending";
    consultation_type: "online" | "offline";
    doctor: {
      first_name: string;
      last_name: string;
      clinic_name: string;
      phone: string;
    };
  }>;
  error?: string;
}
```

### 2. Update Page Structure (if needed)
If you want the dashboard at a different route, update the path in:
- `app/(main)/patient/dashboard/page.tsx`

The current structure redirects `/patient` → `/patient/dashboard`

### 3. Import Components

```typescript
// In your page or parent component
import { ProfileTab, AppointmentsTab, ProfileEditTab } from '@/components/patient-dashboard';
// Or individual imports:
import ProfileTab from '@/components/patient-dashboard/ProfileTab';
import AppointmentsTab from '@/components/patient-dashboard/AppointmentsTab';
import ProfileEditTab from '@/components/patient-dashboard/ProfileEditTab';
```

---

## Styling

All components use:
- **Color Scheme**: Global CSS variables from `globals.css` only
- **Typography**: Tailwind text classes
- **Spacing**: Tailwind spacing scale
- **Colors**:
  - Primary (patient): Green-600 (#16a34a)
  - Backgrounds: White with gray-50/gray-200 borders
  - Text: Gray-900 for headings, gray-600/700 for body
  - Accent: Status-specific colors (green, blue, red, yellow)

**Key CSS Classes**:
- Cards: `bg-white border border-gray-200 rounded-lg p-6`
- Buttons: `bg-button text-button-foreground`
- Input: `bg-input border border-input rounded-md`
- Badges: Status-based styling with appropriate colors

---

## Type Definitions

All components use TypeScript. Patient profile type:

```typescript
type PatientProfile = {
  id: string;
  user_id: string;
  name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  allergies: string | null;
  medical_conditions: string | null;
};
```

---

## Usage Example

```typescript
import PatientDashboard from '@/app/(main)/patient/dashboard/page';

// The dashboard is already integrated at:
// - Route: /patient/dashboard
// - Redirect: /patient → /patient/dashboard
// - Exports: ProfileTab, AppointmentsTab, ProfileEditTab from components/patient-dashboard
```

---

## Responsive Behavior

- **Mobile (< 768px)**: Single column layout for all grids
- **Tablet (768px+)**: Two-column layout for profile cards
- **Desktop**: Optimized reading width with max-width constraint

---

## Loading & Error States

All tabs handle:
- **Loading State**: Spinner icon with "Loading..." message
- **Error State**: Error card with alert icon and error message
- **Empty State**: Specific message for no appointments

---

## Future Enhancements

- Add reschedule/cancel functionality to appointment actions
- Add appointment detail modal view
- Add doctor search/booking integration
- Add medical history section
- Add prescription/document downloads
- Add appointment notifications
