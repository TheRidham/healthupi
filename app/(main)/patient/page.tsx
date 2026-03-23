'use client'

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider'
import React from 'react'

const PatientHome = () => {

  const { user, logout } = useAuth();

  return (
    <>
      <div>Patient Dashboard Home</div>
      {JSON.stringify(user, this, 2)}
      <Button onClick={logout}>
        Logout
      </Button>
    </>
  )
}

export default PatientHome