"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export default function DashboardHomePage() {
  const { user } = useAuth()

  if (!user) return null

  // Karena backend belum ada, status ini masih placeholder.
  // Nanti kalau RegistrationContext sudah dipasang, ini bisa dihubungkan.
  const registrationSummary = {
    statusLabel: "Belum Memulai Pendaftaran",
    statusBadge: "bg-gray-200 text-gray-800",
    totalAthletes: 0,
    totalFee: 0,
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Welcome card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat datang, {user.institutionName}
            </h1>
            <p className="text-gray-600 mt-1">
              Akun kontingen untuk Muhammadiyah Games 2026.
            </p>

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-semibold">PIC:</span> {user.picName}
              </div>
              <div>
                <span className="font-semibold">Kontak:</span> {user.email} • {user.phone}
              </div>
              <div>
                <span className="font-semibold">Alamat:</span> {user.address}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/profile"
              className="rounded-lg px-4 py-2 font-semibold border border-gray-200 hover:bg-gray-50"
            >
              Edit Profile
            </Link>

            <Link
              href="/dashboard/pendaftaran"
              className="rounded-lg px-4 py-2 font-semibold bg-green-600 text-white hover:bg-green-700"
            >
              Mulai Pendaftaran
            </Link>
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600">Status Pendaftaran</div>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded ${registrationSummary.statusBadge}`}>
              {registrationSummary.statusLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Status akan berubah sesuai progres Step 1–4 dan validasi admin.
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600">Total Atlet (rencana)</div>
          <div className="mt-2 text-2xl font-bold">{registrationSummary.totalAthletes}</div>
          <p className="text-xs text-gray-500 mt-2">
            Diisi pada Step 1 (kuota per kategori).
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600">Estimasi Total Biaya</div>
          <div className="mt-2 text-2xl font-bold">
            Rp {registrationSummary.totalFee.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            100k/atlet, 50k/official, voli 1.2jt/tim.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold">Aksi Cepat</h2>
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <Link
            href="/dashboard/pendaftaran"
            className="rounded-lg px-4 py-2 font-semibold bg-green-600 text-white hover:bg-green-700 text-center"
          >
            Buka Step Pendaftaran
          </Link>

          <Link
            href="/dashboard/status"
            className="rounded-lg px-4 py-2 font-semibold border border-gray-200 hover:bg-gray-50 text-center"
          >
            Lihat Status
          </Link>
        </div>
      </div>
    </div>
  )
}
