import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/supabase-server"

export default async function DashboardPage() {
  const user = await getServerSession()
  
  if (!user) {
    redirect("/doctor/signin")
  }

  // Redirect to the doctor's own dashboard
  redirect(`/dashboard/${user.id}/services`)
}
