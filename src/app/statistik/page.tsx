"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { InstitutionType, Role } from "@/context/AuthContext"
import type { Registration } from "@/types/registration"

type StoredUser = {
  id: string
  role: Role
  institutionName: string
  institutionType: InstitutionType
  address: string
  picName: string
  email: string
  phone: string
  createdAt: string
  password: string
}

const LS_USERS_KEY = "mg26_users"
const LS_FINAL_VALID_KEY = "mg26_mock_final_valid"

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function institutionTypeLabel(t: InstitutionType) {
  switch (t) {
    case "SD":
      return "Sekolah (SD)"
    case "SMP":
      return "Sekolah (SMP)"
    case "SMA":
      return "Sekolah (SMA)"
    case "KAMPUS_PTM":
      return "Kampus / PTM"
    case "PIMPINAN_RANTING":
      return "Pimpinan Ranting"
    case "PIMPINAN_CABANG":
      return "Pimpinan Cabang"
    default:
      return t
  }
}

export default function StatistikPage() {
  const [users, setUsers] = useState<StoredUser[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])

  useEffect(() => {
    const all = safeParse<StoredUser[]>(localStorage.getItem(LS_USERS_KEY), [])
    const peserta = all.filter((u) => u.role === "PESERTA")
    setUsers(peserta)

    const regs: Registration[] = []
    for (const u of peserta) {
      const reg = safeParse<Registration | null>(
        localStorage.getItem(`mg26_registration_${u.id}`),
        null
      )
      if (reg) regs.push(reg)
    }
    setRegistrations(regs)
  }, [])

  const stats = useMemo(() => {
    const totalKontingen = users.length

    const kontingenMulaiDaftar = registrations.length

    const kontingenPaymentApproved = registrations.filter(
      (r) => r.payment.status === "APPROVED"
    ).length

    // Final valid mock:
    // NOTE: di sistem frontend-only kita menulis mg26_mock_final_valid global,
    // tapi itu cuma 1 nilai global. Untuk statistik multi-kontingen, kita hitung
    // finalValid per registration dari dokumen.
    const kontingenFinalValid = registrations.filter((r) => {
      if (!r.documents.length) return false
      return r.documents.every((d) => {
        const items = [d.dapodik, d.ktp, d.kartu, d.raport, d.foto]
        return items.every((it) => it.status === "APPROVED")
      })
    }).length

    const totalAtlet = registrations.reduce((acc, r) => acc + r.athletes.length, 0)

    const totalAtletFinalValid = registrations.reduce((acc, r) => {
      const finalValid =
        r.documents.length > 0 &&
        r.documents.every((d) => {
          const items = [d.dapodik, d.ktp, d.kartu, d.raport, d.foto]
          return items.every((it) => it.status === "APPROVED")
        })

      return acc + (finalValid ? r.athletes.length : 0)
    }, 0)

    // Breakdown instansi
    const byInstitutionType: Record<string, number> = {}
    for (const u of users) {
      byInstitutionType[u.institutionType] = (byInstitutionType[u.institutionType] ?? 0) + 1
    }

    // Breakdown atlet per cabor (berdasarkan athlete list)
    const bySportId: Record<string, number> = {}
    for (const r of registrations) {
      for (const a of r.athletes) {
        bySportId[a.sportId] = (bySportId[a.sportId] ?? 0) + 1
      }
    }

    // Map sportId -> sportName (ambil dari registration pertama yang ada sport)
    const sportNameMap: Record<string, string> = {}
    for (const r of registrations) {
      for (const s of r.sports) {
        sportNameMap[s.id] = s.name
      }
    }

    const sportRows = Object.entries(bySportId)
      .map(([sportId, count]) => ({
        sportId,
        sportName: sportNameMap[sportId] ?? sportId,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    const instRows = Object.entries(byInstitutionType)
      .map(([type, count]) => ({
        type: type as InstitutionType,
        label: institutionTypeLabel(type as InstitutionType),
        count,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      totalKontingen,
      kontingenMulaiDaftar,
      kontingenPaymentApproved,
      kontingenFinalValid,
      totalAtlet,
      totalAtletFinalValid,
      instRows,
      sportRows,
    }
  }, [users, registrations])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Statistik Pendaftar
          </h1>
          <p className="text-gray-600 mt-2">
            Ringkasan statistik kontingen dan atlet yang terdaftar pada sistem (frontend-only mock).
          </p>

          <div className="mt-4 flex gap-3 flex-wrap">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border bg-white font-semibold hover:bg-gray-50"
            >
              Kembali ke Landing
            </Link>
            <Link
              href="/peringkat"
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Lihat Peringkat
            </Link>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Total Kontingen Terdaftar</div>
            <div className="mt-2 text-3xl font-extrabold">{stats.totalKontingen}</div>
            <div className="text-xs text-gray-500 mt-2">
              Jumlah akun peserta (kontingen) yang sudah membuat akun.
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Mulai Isi Pendaftaran</div>
            <div className="mt-2 text-3xl font-extrabold">{stats.kontingenMulaiDaftar}</div>
            <div className="text-xs text-gray-500 mt-2">
              Kontingen yang sudah memiliki data registration di sistem.
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Pembayaran Disetujui</div>
            <div className="mt-2 text-3xl font-extrabold">{stats.kontingenPaymentApproved}</div>
            <div className="text-xs text-gray-500 mt-2">
              Kontingen yang pembayarannya APPROVED oleh admin.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Kontingen Final Valid</div>
            <div className="mt-2 text-3xl font-extrabold">{stats.kontingenFinalValid}</div>
            <div className="text-xs text-gray-500 mt-2">
              Final Valid jika semua dokumen semua atlet sudah APPROVED.
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Total Atlet Terinput</div>
            <div className="mt-2 text-3xl font-extrabold">{stats.totalAtlet}</div>
            <div className="text-xs text-gray-500 mt-2">
              Total atlet yang sudah diinput pada Step 3.
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Atlet Final Valid</div>
            <div className="mt-2 text-3xl font-extrabold">{stats.totalAtletFinalValid}</div>
            <div className="text-xs text-gray-500 mt-2">
              Total atlet dari kontingen yang sudah final valid.
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold">Kontingen per Jenis Instansi</h2>
            <div className="mt-4 space-y-2">
              {stats.instRows.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada data.</div>
              ) : (
                stats.instRows.map((r) => (
                  <div key={r.type} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div className="text-sm text-gray-700">{r.label}</div>
                    <div className="font-bold">{r.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold">Atlet per Cabang Olahraga</h2>
            <div className="mt-4 space-y-2">
              {stats.sportRows.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada atlet yang diinput.</div>
              ) : (
                stats.sportRows.map((r) => (
                  <div key={r.sportId} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div className="text-sm text-gray-700">{r.sportName}</div>
                    <div className="font-bold">{r.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
