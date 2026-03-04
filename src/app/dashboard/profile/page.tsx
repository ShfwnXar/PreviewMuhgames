"use client"

import { useAuth, InstitutionType } from "@/context/AuthContext"
import { useEffect, useMemo, useState } from "react"

const LS_PAYMENT_STATUS_KEY = "mg26_mock_payment_status"
// nilai bisa: NONE | PENDING | APPROVED

export default function ProfilePage() {
  const { user, getAllUsers } = useAuth()

  const [form, setForm] = useState({
    institutionName: "",
    institutionType: "SMA" as InstitutionType,
    address: "",
    picName: "",
    email: "",
    phone: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"NONE" | "PENDING" | "APPROVED">("NONE")

  useEffect(() => {
    if (!user) return

    setForm({
      institutionName: user.institutionName,
      institutionType: user.institutionType,
      address: user.address,
      picName: user.picName,
      email: user.email,
      phone: user.phone,
    })

    const storedStatus =
      (localStorage.getItem(LS_PAYMENT_STATUS_KEY) as
        | "NONE"
        | "PENDING"
        | "APPROVED"
        | null) ?? "NONE"

    setPaymentStatus(storedStatus)
  }, [user])

  const isLocked = paymentStatus === "PENDING" || paymentStatus === "APPROVED"

  const institutionTypeOptions = useMemo(
    () => [
      { value: "SD", label: "Sekolah (SD)" },
      { value: "SMP", label: "Sekolah (SMP)" },
      { value: "SMA", label: "Sekolah (SMA)" },
      { value: "KAMPUS_PTM", label: "Kampus / PTM" },
      { value: "PIMPINAN_RANTING", label: "Pimpinan Ranting" },
      { value: "PIMPINAN_CABANG", label: "Pimpinan Cabang" },
    ] as const,
    []
  )

  const handleSaveProfile = () => {
    setError(null)
    setMessage(null)

    if (!form.picName || !form.email || !form.phone) {
      setError("Nama PIC, email, dan nomor HP wajib diisi.")
      return
    }

    const users = getAllUsers()
    const updatedUsers = users.map((u) =>
      u.id === user?.id
        ? {
            ...u,
            institutionName: isLocked ? u.institutionName : form.institutionName,
            institutionType: isLocked ? u.institutionType : form.institutionType,
            address: form.address,
            picName: form.picName,
            email: form.email,
            phone: form.phone,
          }
        : u
    )

    localStorage.setItem("mg26_users", JSON.stringify(updatedUsers))
    setMessage("Profile berhasil diperbarui.")
  }

  const handleChangePassword = () => {
    setError(null)
    setMessage(null)

    if (passwordForm.newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Konfirmasi password tidak sama.")
      return
    }

    const users = getAllUsers()
    const currentUser = users.find((u) => u.id === user?.id)

    if (!currentUser) return

    if (currentUser.password !== passwordForm.oldPassword) {
      setError("Password lama salah.")
      return
    }

    const updatedUsers = users.map((u) =>
      u.id === user?.id ? { ...u, password: passwordForm.newPassword } : u
    )

    localStorage.setItem("mg26_users", JSON.stringify(updatedUsers))
    setMessage("Password berhasil diperbarui.")
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  if (!user) return null

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Profile Kontingen</h1>

      {isLocked && (
        <div className="p-4 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
          Nama instansi dan jenis instansi terkunci karena pembayaran sudah diajukan / disetujui.
        </div>
      )}

      {error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 rounded bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg">Data Instansi</h2>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Nama Instansi
          </label>
          <input
            value={form.institutionName}
            disabled={isLocked}
            onChange={(e) =>
              setForm({ ...form, institutionName: e.target.value })
            }
            className={`w-full border rounded-lg px-3 py-2 ${
              isLocked ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Jenis Instansi
          </label>
          <select
            value={form.institutionType}
            disabled={isLocked}
            onChange={(e) =>
              setForm({
                ...form,
                institutionType: e.target.value as InstitutionType,
              })
            }
            className={`w-full border rounded-lg px-3 py-2 ${
              isLocked ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            {institutionTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Alamat</label>
          <textarea
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
          />
        </div>

        <h2 className="font-semibold text-lg pt-4">Data PIC</h2>

        <div>
          <label className="block text-sm font-semibold mb-1">Nama PIC</label>
          <input
            value={form.picName}
            onChange={(e) =>
              setForm({ ...form, picName: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">No HP / WA</label>
          <input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="mt-3 rounded-lg px-4 py-2 bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          Simpan Perubahan
        </button>
      </div>

      {/* Ganti Password */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg">Ubah Password</h2>

        <input
          type="password"
          placeholder="Password Lama"
          value={passwordForm.oldPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
          }
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          type="password"
          placeholder="Password Baru"
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
          }
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          type="password"
          placeholder="Konfirmasi Password Baru"
          value={passwordForm.confirmPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              confirmPassword: e.target.value,
            })
          }
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          onClick={handleChangePassword}
          className="rounded-lg px-4 py-2 bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          Update Password
        </button>
      </div>
    </div>
  )
}
