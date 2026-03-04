"use client"

import "./globals.css"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { useEffect } from "react"

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { seedDefaultAdminsIfEmpty } = useAuth()

  useEffect(() => {
    // Seed admin default jika belum ada user sama sekali
    seedDefaultAdminsIfEmpty()
  }, [])

  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <AuthProvider>
          <AuthBootstrap>
            {children}
          </AuthBootstrap>
        </AuthProvider>
      </body>
    </html>
  )
}
