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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Top Nav */}
      <header className="bg-gradient-to-r from-primary/5 via-card to-accent/5 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">
              Patient Dashboard
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-1.5 font-medium"
          >
            <LogOut className="w-4 h-4 text-accent" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="flex gap-2 bg-card border border-border rounded-lg p-1.5 w-fit mb-6 shadow-sm">
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
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
        active
          ? "bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
    >
      <span className={active ? "text-primary-foreground" : "text-primary"}>
        {icon}
      </span>
      {label}
    </button>
  )
}

export default PatientHome