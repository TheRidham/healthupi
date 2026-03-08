import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/supabase-server"
import { createClient } from "@/lib/supabase-server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerSession()

  if (!user) {
    redirect("/doctor/signin")
  }

  // Check if user is a doctor
  const supabase = await createClient()
  const { data: doctorProfile } = await supabase
    .from("doctor_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single()

  if (!doctorProfile) {
    redirect("/doctor/signin")
  }

  return <>{children}</>
}
