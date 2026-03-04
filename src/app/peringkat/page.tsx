"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type MedalRow = {
  id: string // kontingenId atau kode kontingen
  name: string // nama kontingen/instansi
  gold: number
  silver: number
  bronze: number
}

const LS_MEDAL_TABLE = "mg26_medal_table"

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default function PeringkatPage() {
  const [rows, setRows] = useState<MedalRow[]>([])

  useEffect(() => {
    const data = safeParse<MedalRow[]>(localStorage.getItem(LS_MEDAL_TABLE), [])
    setRows(data)
  }, [])

  const sorted = useMemo(() => {
    return [...rows]
      .map((r) => ({ ...r, total: r.gold + r.silver + r.bronze }))
      .sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold
        if (b.silver !== a.silver) return b.silver - a.silver
        if (b.bronze !== a.bronze) return b.bronze - a.bronze
        return b.total - a.total
      })
  }, [rows])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Peringkat Perolehan Medali
          </h1>
          <p className="text-gray-600 mt-2">
            Peringkat kontingen berdasarkan perolehan medali (Emas, Perak, Perunggu).
          </p>

          <div className="mt-4 flex gap-3 flex-wrap">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border bg-white font-semibold hover:bg-gray-50"
            >
              Kembali ke Landing
            </Link>
            <Link
              href="/statistik"
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Lihat Statistik
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          {sorted.length === 0 ? (
            <div className="text-sm text-gray-600">
              Belum ada data perolehan medali. Admin akan mengupload pemenang lomba dan peringkat akan tampil di sini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3 pr-3">#</th>
                    <th className="py-3 pr-3">Kontingen</th>
                    <th className="py-3 pr-3">🥇 Emas</th>
                    <th className="py-3 pr-3">🥈 Perak</th>
                    <th className="py-3 pr-3">🥉 Perunggu</th>
                    <th className="py-3 pr-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3 font-bold">{idx + 1}</td>
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.id}</div>
                      </td>
                      <td className="py-3 pr-3 font-semibold">{r.gold}</td>
                      <td className="py-3 pr-3 font-semibold">{r.silver}</td>
                      <td className="py-3 pr-3 font-semibold">{r.bronze}</td>
                      <td className="py-3 pr-3 font-bold">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Urutan ranking: Emas → Perak → Perunggu → Total.
          </div>
        </div>
      </div>
    </div>
  )
}
