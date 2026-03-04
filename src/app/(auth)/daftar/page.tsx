"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InstitutionType, useAuth } from "@/context/AuthContext"

export default function DaftarPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    institutionName: "",
    institutionType: "SMA" as InstitutionType,
    address: "",
    picName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const institutionTypeOptions = useMemo(
    () =>
      [
        { value: "SD", label: "Sekolah (SD)" },
        { value: "SMP", label: "Sekolah (SMP)" },
        { value: "SMA", label: "Sekolah (SMA)" },
        { value: "KAMPUS_PTM", label: "Kampus / PTM" },
        { value: "PIMPINAN_RANTING", label: "Pimpinan Ranting" },
        { value: "PIMPINAN_CABANG", label: "Pimpinan Cabang" },
      ] as const,
    []
  )

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const res = register({
      institutionName: form.institutionName,
      institutionType: form.institutionType,
      address: form.address,
      picName: form.picName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      confirmPassword: form.confirmPassword,
    })

    setLoading(false)

    if (!res.ok) {
      setMessage({ type: "error", text: res.message })
      return
    }

    setMessage({ type: "success", text: res.message })

    // Redirect ke login
    setTimeout(() => {
      router.push("/login")
    }, 900)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white border rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Buat Akun Kontingen</h1>
        <p className="text-gray-600 mt-2">
          Akun ini digunakan untuk mendaftarkan kontingen pada Muhammadiyah Games 2026.
        </p>

        {message && (
          <div
            className={`mt-4 p-3 rounded border text-sm ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nama Instansi</label>
            <input
              value={form.institutionName}
              onChange={(e) => setField("institutionName", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Contoh: SMA Muhammadiyah 1 ..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Jenis Instansi</label>
            <select
              value={form.institutionType}
              onChange={(e) => setField("institutionType", e.target.value as InstitutionType)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {institutionTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="mt-1 text-xs text-gray-500">
              Gunakan jenis instansi yang paling sesuai (sekolah/kampus/pimpinan).
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Alamat Instansi</label>
            <textarea
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
              placeholder="Alamat lengkap instansi"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Nama PIC (Penanggung Jawab)</label>
            <input
              value={form.picName}
              onChange={(e) => setField("picName", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nama penanggung jawab kontingen"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">No HP / WA</label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 px-5 py-3 rounded-xl font-semibold text-white ${
              loading ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Memproses..." : "Buat Akun"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600 text-center">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-green-700 hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
