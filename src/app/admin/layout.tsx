"use client"

import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

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
      className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-green-600 text-white"
          : "text-gray-700 hover:bg-green-50 hover:text-green-700"
      }`}
    >
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    if (user && user.role === "PESERTA") {
      router.replace("/dashboard")
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

  const isSuperAdmin = user.role === "SUPER_ADMIN"
  const canSeeDownloads = user.role === "ADMIN" || user.role === "SUPER_ADMIN"

  const menu = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/pembayaran", label: "Validasi Pembayaran" },
    { href: "/admin/dokumen", label: "Validasi Dokumen" },
    { href: "/admin/pemenang", label: "Pemenang & Peringkat" },
    { href: "/admin/berita", label: "Menu Berita" },
    { href: "/admin/statistik", label: "Statistik" },

    // ✅ Panel Download (khusus ADMIN / SUPER_ADMIN)
    ...(canSeeDownloads ? [{ href: "/admin/downloads", label: "Panel Download" }] : []),

    { href: "/admin/export", label: "Download Data" },
    { href: "/admin/reset-token", label: "Reset Token" },
    ...(isSuperAdmin ? [{ href: "/admin/kelola-admin", label: "Kelola Admin" }] : []),
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-white border-r p-4 hidden md:block">
        <div className="mb-6">
          <div className="text-lg font-bold text-green-700">
            Muhammadiyah Games
          </div>
          <div className="text-xs text-gray-500 mt-1">Admin Panel</div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
          <div className="text-sm font-semibold text-gray-800">
            {user.picName}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Role: <b>{user.role}</b>
          </div>
        </div>

        <nav className="space-y-1">
          {menu.map((m) => (
            <SidebarLink
              key={m.href}
              href={m.href}
              label={m.label}
              active={pathname === m.href}
            />
          ))}
        </nav>

        <button
          onClick={() => {
            logout()
            router.replace("/login")
          }}
          className="mt-6 w-full rounded-lg px-3 py-2 text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-gray-800">
            {menu.find((m) => m.href === pathname)?.label ?? "Admin"}
          </div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}