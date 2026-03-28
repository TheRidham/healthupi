'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { createClientBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User, Calendar, LogOut, Heart } from 'lucide-react'
import ProfileTab from '@/components/patient-dashboard/ProfileTab'
import AppointmentsTab from '@/components/patient-dashboard/AppointmentsTab'
import ProfileEditTab from '@/components/patient-dashboard/ProfileEditTab'

type Tab = 'profile' | 'appointments' | 'edit'

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
  photo_url: string | null;
};

const PatientHome = () => {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientBrowser()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load profile on mount
    fetch(`/api/patient/profile`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleEditClick = () => {
    setActiveTab('edit')
  }

  const handleProfileSaved = () => {
    // Reload profile data
    fetch(`/api/patient/profile`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
          setActiveTab('profile')
        }
      })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              Patient Dashboard
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-6">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={<User className="w-4 h-4" />}
            label="My Profile"
          />
          <TabButton
            active={activeTab === 'appointments'}
            onClick={() => setActiveTab('appointments')}
            icon={<Calendar className="w-4 h-4" />}
            label="Appointments"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileTab onEditClick={handleEditClick} />
        )}
        {activeTab === 'appointments' && (
          <AppointmentsTab />
        )}
        {activeTab === 'edit' && profile && (
          <ProfileEditTab
            profile={profile}
            onSaved={handleProfileSaved}
            onCancel={() => setActiveTab('profile')}
          />
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default PatientHome