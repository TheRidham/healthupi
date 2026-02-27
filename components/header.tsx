"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Stethoscope,
  Home,
  Users,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  showDoctorControls?: boolean
}

export function Header({ showDoctorControls = false }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDashboard = pathname.startsWith("/dashboard")
  const isHome = pathname === "/"

  function handleLogout() {
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
                <Stethoscope className="size-5" />
              </div>
              <span className="font-semibold text-lg hidden sm:inline-block">HealthUPI</span>
            </Link>

            {!isHome && (
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href="/">
                    <Home className="size-4 mr-2" />
                    Home
                  </Link>
                </Button>
                <Button
                  variant={pathname === "/doctors" ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href="/doctors">
                    <Users className="size-4 mr-2" />
                    Doctors
                  </Link>
                </Button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDashboard ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dr. Andrew Mitchell</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => router.push("/dashboard")}
                >
                  Doctor Login
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t flex flex-col gap-2">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className="justify-start"
              asChild
            >
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Home className="size-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              variant={pathname === "/doctors" ? "secondary" : "ghost"}
              className="justify-start"
              asChild
            >
              <Link href="/doctors" onClick={() => setMobileMenuOpen(false)}>
                <Users className="size-4 mr-2" />
                Doctors
              </Link>
            </Button>
            {!isDashboard && (
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push("/dashboard")
                }}
              >
                <User className="size-4 mr-2" />
                Doctor Login
              </Button>
            )}
            {isDashboard && (
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
