import { redirect } from "next/navigation"

interface DashboardPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DoctorDashboardPage({ params }: DashboardPageProps) {
  const { id } = await params
  // Redirect to services as the default profile tab
  redirect(`/dashboard/${id}/services`)
}
