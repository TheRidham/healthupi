import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <DashboardNav />
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-6 md:px-6">
        <div role="tabpanel">{children}</div>
      </div>
    </div>
  )
}
