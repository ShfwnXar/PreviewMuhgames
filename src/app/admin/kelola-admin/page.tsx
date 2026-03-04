"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth, Role } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

type NewAdminForm = {
  institutionName: string
  picName: string
  email: string
  phone: string
  password: string
  role: Role
  cabang?: string
}

export default function KelolaAdminPage() {
  const { user, getAllUsers, seedDefaultAdminsIfEmpty } = useAuth()
  const router = useRouter()

  const [admins, setAdmins] = useState<any[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const [form, setForm] = useState<NewAdminForm>({
    institutionName: "Panitia Muhammadiyah Games",
    picName: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN",
    cabang: "",
  })

  // Guard
  useEffect(() => {
    if (!user) return
    if (user.role !== "SUPER_ADMIN") {
      router.replace("/admin")
    }
  }, [user, router])

  // Seed admin default jika kosong
  useEffect(() => {
    seedDefaultAdminsIfEmpty()
    const users = getAllUsers()
    const onlyAdmins = users.filter((u) =>
      ["ADMIN", "ADMIN_CABOR", "SUPER_ADMIN"].includes(u.role)
    )
    setAdmins(onlyAdmins)
  }, [])

  const handleCreate = () => {
    setMsg(null)

    if (!form.picName || !form.email || !form.password) {
      setMsg("Semua field wajib diisi.")
      return
    }

    const users = getAllUsers()

    if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      setMsg("Email sudah digunakan.")
      return
    }

    const newAdmin = {
      id: "u_" + Date.now(),
      role: form.role,
      institutionName: form.institutionName,
      institutionType: "PIMPINAN_CABANG",
      address: "-",
      picName: form.picName,
      email: form.email.toLowerCase(),
      phone: form.phone,
      password: form.password,
      createdAt: new Date().toISOString(),
      cabang: form.role === "ADMIN_CABOR" ? form.cabang : undefined,
    }

    const updated = [newAdmin, ...users]
    localStorage.setItem("mg26_users", JSON.stringify(updated))

    setAdmins(updated.filter((u) =>
      ["ADMIN", "ADMIN_CABOR", "SUPER_ADMIN"].includes(u.role)
    ))

    setMsg("Admin berhasil dibuat.")
    setForm({
      institutionName: "Panitia Muhammadiyah Games",
      picName: "",
      email: "",
      phone: "",
      password: "",
      role: "ADMIN",
      cabang: "",
    })
  }

  const handleDelete = (id: string) => {
    const users = getAllUsers()
    const filtered = users.filter((u) => u.id !== id)
    localStorage.setItem("mg26_users", JSON.stringify(filtered))

    setAdmins(filtered.filter((u) =>
      ["ADMIN", "ADMIN_CABOR", "SUPER_ADMIN"].includes(u.role)
    ))
  }

  if (!user || user.role !== "SUPER_ADMIN") {
    return null
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Kelola Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Hanya SUPER_ADMIN yang dapat membuat dan menghapus admin.
        </p>
      </div>

      {/* Form Buat Admin */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-gray-900">
          Buat Admin Baru
        </h2>

        {msg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded">
            {msg}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nama PIC"
            className="border rounded px-3 py-2"
            value={form.picName}
            onChange={(e) => setForm({ ...form, picName: e.target.value })}
          />
          <input
            placeholder="Email"
            className="border rounded px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="No HP"
            className="border rounded px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as Role })
            }
          >
            <option value="ADMIN">ADMIN</option>
            <option value="ADMIN_CABOR">ADMIN_CABOR</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>

          {form.role === "ADMIN_CABOR" && (
            <input
              placeholder="Cabang olahraga (contoh: pencak_silat)"
              className="border rounded px-3 py-2"
              value={form.cabang}
              onChange={(e) =>
                setForm({ ...form, cabang: e.target.value })
              }
            />
          )}
        </div>

        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-5 py-2 rounded font-bold hover:bg-green-700"
        >
          Buat Admin
        </button>
      </div>

      {/* List Admin */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">
          Daftar Admin
        </h2>

        <div className="space-y-3">
          {admins.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div>
                <div className="font-bold">{a.picName}</div>
                <div className="text-xs text-gray-600">
                  {a.email} • {a.role}
                </div>
                {a.role === "ADMIN_CABOR" && a.cabang && (
                  <div className="text-xs text-gray-500">
                    Cabang: {a.cabang}
                  </div>
                )}
              </div>

              {a.role !== "SUPER_ADMIN" && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-600 font-bold hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}