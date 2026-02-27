"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Stethoscope,
  Home,
  Users,
  LogOut,
  User,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const isDashboardPage = pathname.startsWith("/dashboard")
  const isProfilePage = pathname === "/profile"
  const isDoctorDashboard = pathname.startsWith("/dashboard/")
  const isHome = pathname === "/"

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const displayName = user?.name || (isDoctorDashboard ? "Dr. Rahul Sharma" : "User")
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const avatarSrc = isDoctorDashboard ? "/images/doctor-avatar.jpg" : "/images/user-avatar.jpg"
  const searchPlaceholder = isDoctorDashboard ? "Search patients, records..." : isProfilePage ? "Search doctors, appointments..." : ""

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={isDoctorDashboard ? "/dashboard/rahul-sharma" : "/"} className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
                <Stethoscope className="size-5" />
              </div>
              <span className="font-semibold text-lg hidden sm:inline-block">HealthUPI</span>
            </Link>

            {!isHome && !isDashboardPage && !isProfilePage && (
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
            {/* Search bar - shown on dashboard/profile pages */}
            {(isDashboardPage || isProfilePage) && (
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  className="w-64 pl-8 h-8 text-sm"
                  aria-label={searchPlaceholder}
                />
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
                      <Bell className="size-4" />
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1">
                        3
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>3 unread notifications</TooltipContent>
                </Tooltip>
                
                {(isDashboardPage || isProfilePage) ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-border">
                    <Avatar className="size-8">
                      <AvatarImage src={avatarSrc} alt={displayName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col">
                      <span className="text-xs font-medium text-foreground leading-none">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                        {isDoctorDashboard ? "Cardiologist" : "Patient"}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Logout">
                      <LogOut className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 hover:bg-accent" onClick={() => router.push("/profile")}>
                    <User className="size-4" />
                    <span>{user.name}</span>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => router.push("/patient/signin")}
                >
                  Patient Login
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => router.push("/signin")}
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
            {!isHome && !isDashboardPage && !isProfilePage && (
              <>
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
              </>
            )}
            
            {user ? (
              <>
                {(isDashboardPage || isProfilePage) && (
                  <Button
                    variant="ghost"
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
                {!isDashboardPage && !isProfilePage && (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      router.push("/profile")
                    }}
                  >
                    <User className="size-4 mr-2" />
                    My Profile
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    router.push("/patient/signin")
                  }}
                >
                  <User className="size-4 mr-2" />
                  Patient Login
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    router.push("/signin")
                  }}
                >
                  <User className="size-4 mr-2" />
                  Doctor Login
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
