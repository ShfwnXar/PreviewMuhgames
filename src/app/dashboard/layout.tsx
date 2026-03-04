"use client"

import { useAuth } from "@/context/AuthContext"
import { RegistrationProvider } from "@/context/RegistrationContext"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function SidebarLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cx(
        "block rounded-2xl px-3 py-2 text-sm font-extrabold transition-all",
        active
          ? "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-[0_10px_26px_rgba(16,185,129,0.22)]"
          : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 border border-transparent hover:border-emerald-100"
      )}
    >
      {label}
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    if (user && user.role !== "PESERTA") {
      router.replace("/admin")
      return
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Memuat...
      </div>
    )
  }

  const menu = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/pendaftaran", label: "Pendaftaran" },
    { href: "/dashboard/status", label: "Status" },
  ]

  const currentLabel =
    menu.find((m) => m.href === pathname)?.label ?? "Dashboard"

  return (
    <RegistrationProvider>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-gradient-to-br from-emerald-50 via-white to-sky-50" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-72 hidden md:flex flex-col p-4">
            <div className="rounded-3xl border bg-white/80 backdrop-blur p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-gray-900 tracking-tight">
                    Muhammadiyah Games
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Dashboard Kontingen
                  </div>
                </div>
                <Badge tone="brand">MG 2026</Badge>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-4">
                <div className="text-sm font-extrabold text-gray-900">
                  {user.institutionName}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  PIC: {user.picName}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {user.email} • {user.phone}
                </div>
              </div>

              <nav className="mt-4 space-y-2">
                {menu.map((m) => (
                  <SidebarLink
                    key={m.href}
                    href={m.href}
                    label={m.label}
                    active={pathname === m.href}
                  />
                ))}
              </nav>

              <div className="mt-5">
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    logout()
                    router.replace("/login")
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Topbar */}
            <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur">
              <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-500">
                    PESERTA • {user.institutionType}
                  </div>
                  <div className="text-lg md:text-xl font-extrabold text-gray-900 truncate">
                    {currentLabel}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone="info">{user.email}</Badge>
                  <Link
                    href="/dashboard/profile"
                    className="hidden md:inline-flex"
                  >
                    <Button variant="secondary" size="sm">
                      Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="px-4 md:px-8 py-6">{children}</main>
          </div>
        </div>
      </div>
    </RegistrationProvider>
  )
}