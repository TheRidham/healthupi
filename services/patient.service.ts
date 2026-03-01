import { supabase, tables } from "@/lib/supabase"
import { PatientProfile } from "@/types"

export async function createPatientProfile(data: {
  phone: string
  name: string
  email?: string
  dateOfBirth: string
  gender: string
}): Promise<{ success: boolean; data?: PatientProfile; error?: string }> {
  try {
    const { data: profile, error } = await supabase
      .from(tables.patientProfiles)
      .insert({
        user_id: "281e38c8-0aec-453a-b475-0d252050e47d",
        phone: data.phone,
        name: data.name,
        email: data.email,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating patient profile:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        email: profile.email,
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    }
  } catch (error) {
    console.error("Exception creating patient profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getPatientProfileByPhone(phone: string): Promise<PatientProfile | null> {
  try {
    const { data, error } = await supabase
      .from(tables.patientProfiles)
      .select("*")
      .eq("phone", phone)
      .single()

    if (error) {
      console.error("Error fetching patient profile:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      phone: data.phone,
      name: data.name,
      email: data.email,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("Exception fetching patient profile:", error)
    return null
  }
}

export async function updatePatientProfile(
  phone: string,
  data: Partial<Omit<PatientProfile, "id" | "phone" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean; data?: PatientProfile; error?: string }> {
  try {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth
    if (data.gender !== undefined) updateData.gender = data.gender

    const { data: profile, error } = await supabase
      .from(tables.patientProfiles)
      .update(updateData)
      .eq("phone", phone)
      .select()
      .single()

    if (error) {
      console.error("Error updating patient profile:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        email: profile.email,
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    }
  } catch (error) {
    console.error("Exception updating patient profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
