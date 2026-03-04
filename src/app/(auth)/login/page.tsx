"use client"

import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const { login, resetPasswordWithToken, isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<"LOGIN" | "FORGOT">("LOGIN")

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [fpEmail, setFpEmail] = useState("")
  const [fpToken, setFpToken] = useState("")
  const [fpNewPass, setFpNewPass] = useState("")
  const [fpConfirm, setFpConfirm] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "PESERTA") {
        router.replace("/dashboard")
      } else {
        router.replace("/admin")
      }
    }
  }, [isAuthenticated, user, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const res = login(form)

    if (!res.ok) {
      setMessage({ type: "error", text: res.message })
      setLoading(false)
      return
    }

    setMessage({ type: "success", text: res.message })
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{mode === "LOGIN" ? "Login Akun" : "Lupa Password"}</h1>
          <p className="text-gray-600 mt-1">
            {mode === "LOGIN"
              ? "Masuk untuk melanjutkan pendaftaran Muhammadiyah Games 2026."
              : "Reset password menggunakan kode dari panitia/admin."}
          </p>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("LOGIN")}
            className={`px-4 py-2 rounded-xl font-bold border ${
              mode === "LOGIN"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white hover:bg-gray-50"
            }`}
            type="button"
          >
            Login
          </button>
          <button
            onClick={() => setMode("FORGOT")}
            className={`px-4 py-2 rounded-xl font-bold border ${
              mode === "FORGOT"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white hover:bg-gray-50"
            }`}
            type="button"
          >
            Lupa Password
          </button>
        </div>

        {message && (
          <div
            className={`mb-5 p-4 rounded ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {mode === "LOGIN" ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="email@contoh.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-2 font-semibold text-white ${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Minta <b>kode reset</b> ke panitia/admin, lalu isi form berikut.
            </div>

            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
            />
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Kode Reset (6 digit)"
              value={fpToken}
              onChange={(e) => setFpToken(e.target.value)}
            />
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Password baru"
              type="password"
              value={fpNewPass}
              onChange={(e) => setFpNewPass(e.target.value)}
            />
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Konfirmasi password"
              type="password"
              value={fpConfirm}
              onChange={(e) => setFpConfirm(e.target.value)}
            />

            <button
              type="button"
              onClick={() => {
                const res = resetPasswordWithToken({
                  email: fpEmail,
                  token: fpToken,
                  newPassword: fpNewPass,
                  confirmPassword: fpConfirm,
                })
                alert(res.message)
                if (res.ok) {
                  setMode("LOGIN")
                  setFpEmail("")
                  setFpToken("")
                  setFpNewPass("")
                  setFpConfirm("")
                }
              }}
              className="w-full px-5 py-2 rounded-xl bg-green-600 text-white font-extrabold hover:bg-green-700"
            >
              Reset Password
            </button>
          </div>
        )}

        <div className="mt-5 text-sm text-gray-700">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-green-700 font-semibold hover:underline">
            Daftar di sini
          </Link>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <br />
          <br />
        </div>
      </div>
    </main>
  )
}