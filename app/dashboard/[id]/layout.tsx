import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{
    id: string
  }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <DashboardNav doctorId={id} />
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-6 md:px-6">
        <div role="tabpanel">
          {children}
        </div>
      </div>
    </div>
  )
}
