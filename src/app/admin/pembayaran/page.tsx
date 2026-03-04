"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useMemo, useState } from "react"
import type { Registration, PaymentStatus } from "@/types/registration"
import { openFileInNewTab } from "@/lib/fileStore"

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default function AdminPembayaranPage() {
  const { getAllUsers, user: adminUser, canAccessSport } = useAuth()

  const [targetUserId, setTargetUserId] = useState<string>("")
  const [registration, setRegistration] = useState<Registration | null>(null)

  const [status, setStatus] = useState<PaymentStatus>("NONE")
  const [note, setNote] = useState<string>("")

  const pesertaUsersAll = useMemo(() => {
    return getAllUsers().filter((u) => u.role === "PESERTA")
  }, [getAllUsers])

  const pesertaWithReg = useMemo(() => {
    return pesertaUsersAll
      .map((u) => {
        const reg = safeParse<Registration | null>(localStorage.getItem(`mg26_registration_${u.id}`), null)
        return { u, reg }
      })
      .filter((x) => !!x.reg)
  }, [pesertaUsersAll])

  const visibleKontingen = useMemo(() => {
    if (!adminUser) return []

    if (adminUser.role === "ADMIN" || adminUser.role === "SUPER_ADMIN") return pesertaWithReg

    if (adminUser.role === "ADMIN_CABOR") {
      return pesertaWithReg.filter(({ reg }) => {
        const sportIds = reg!.sports.map((s) => s.id)
        return sportIds.some((sid) => canAccessSport(sid))
      })
    }

    return []
  }, [adminUser, pesertaWithReg, canAccessSport])

  useEffect(() => {
    if (visibleKontingen.length > 0 && !targetUserId) {
      setTargetUserId(visibleKontingen[0].u.id)
    }
    if (visibleKontingen.length === 0) {
      setTargetUserId("")
      setRegistration(null)
      setStatus("NONE")
      setNote("")
    }
  }, [visibleKontingen, targetUserId])

  useEffect(() => {
    if (!targetUserId) return
    const key = `mg26_registration_${targetUserId}`
    const reg = safeParse<Registration | null>(localStorage.getItem(key), null)
    setRegistration(reg)

    if (reg?.payment) {
      setStatus(reg.payment.status)
      setNote(reg.payment.note ?? "")
    } else {
      setStatus("NONE")
      setNote("")
    }
  }, [targetUserId])

  const handleSave = () => {
    if (!targetUserId) return
    const key = `mg26_registration_${targetUserId}`
    const reg = safeParse<Registration | null>(localStorage.getItem(key), null)
    if (!reg) return

    if (adminUser?.role === "ADMIN_CABOR") {
      const sportIds = reg.sports.map((s) => s.id)
      const allowed = sportIds.some((sid) => canAccessSport(sid))
      if (!allowed) {
        alert("Anda tidak memiliki akses untuk kontingen ini.")
        return
      }
    }

    const updated: Registration = {
      ...reg,
      payment: {
        ...reg.payment,
        status,
        note: note.trim() ? note.trim() : undefined,
      },
      status:
        status === "APPROVED"
          ? "PAYMENT_APPROVED"
          : status === "REJECTED"
          ? "WAITING_PAYMENT_UPLOAD"
          : status === "PENDING"
          ? "WAITING_PAYMENT_VERIFICATION"
          : reg.status,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(key, JSON.stringify(updated))
    localStorage.setItem("mg26_mock_payment_status", status === "NONE" ? "NONE" : status)

    setRegistration(updated)
    alert("Status pembayaran berhasil disimpan.")
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Validasi Pembayaran</h1>
        <p className="text-gray-600 mt-2">Admin memverifikasi bukti transfer dan menetapkan status pembayaran.</p>

        {adminUser?.role === "ADMIN_CABOR" && (
          <div className="mt-3 text-xs text-gray-500">
            Mode Admin Cabor — hanya menampilkan kontingen yang mengikuti cabor yang kamu pegang.
          </div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg">Pilih Kontingen (Peserta)</h2>

        {visibleKontingen.length === 0 ? (
          <div className="text-sm text-gray-500">
            Tidak ada kontingen yang bisa kamu validasi (belum ada pendaftar di cabor kamu atau belum ada registration).
          </div>
        ) : (
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {visibleKontingen.map(({ u, reg }) => (
              <option key={u.id} value={u.id}>
                {u.institutionName} — {u.email} {reg ? `(${reg.sports.map((s) => s.name).join(", ")})` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-bold text-lg">Detail Bukti Pembayaran</h2>

        {!registration ? (
          <div className="text-sm text-gray-500">Kontingen ini belum memulai pendaftaran / belum ada data registration.</div>
        ) : (
          <>
            <div className="text-sm text-gray-700">
              <div>
                <b>Status saat ini:</b> {registration.payment.status}
              </div>
              <div className="mt-1">
                <b>File bukti:</b> {registration.payment.proofFileName ?? "-"}
              </div>
              <div className="mt-1">
                <b>Waktu upload:</b> {registration.payment.uploadedAt ?? "-"}
              </div>
              <div className="mt-1">
                <b>Total biaya:</b> Rp {(registration.payment.totalFee ?? 0).toLocaleString("id-ID")}
              </div>
            </div>

            <div className="pt-3">
              {registration.payment.proofFileId ? (
                <button
                  onClick={() => openFileInNewTab(registration.payment.proofFileId!, registration.payment.proofFileName)}
                  className="px-4 py-2 rounded-lg border bg-white font-semibold hover:bg-gray-50"
                >
                  Buka Bukti Pembayaran
                </button>
              ) : (
                <div className="text-sm text-gray-500">Belum ada file bukti.</div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Set Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="NONE">NONE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Catatan Admin (opsional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                  placeholder="Contoh: bukti buram / nominal kurang / rekening tidak sesuai..."
                />
              </div>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                disabled={!registration}
              >
                Simpan Validasi
              </button>

              <div className="text-xs text-gray-500">
                *Jika APPROVED: Step 3 & 4 terbuka. Jika PENDING/APPROVED: Step 1 terkunci.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}