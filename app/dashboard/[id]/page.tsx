import { DashboardShell } from "@/components/dashboard/dashboard-shell"

interface DashboardPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DoctorDashboardPage({ params }: DashboardPageProps) {
  const { id } = await params
  // TODO: Fetch doctor by ID and pass to shell
  return <DashboardShell doctorId={id} />
}
