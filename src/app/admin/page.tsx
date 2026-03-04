"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"

const LS_PAYMENT_STATUS_KEY = "mg26_mock_payment_status"
const LS_DOCS_STATUS_KEY = "mg26_mock_docs_status"
const LS_FINAL_VALID_KEY = "mg26_mock_final_valid"

export default function AdminHomePage() {
  const { user } = useAuth()

  const [paymentStatus, setPaymentStatus] = useState("NONE")
  const [docsStatus, setDocsStatus] = useState("NONE")
  const [finalValid, setFinalValid] = useState(false)

  useEffect(() => {
    setPaymentStatus(localStorage.getItem(LS_PAYMENT_STATUS_KEY) ?? "NONE")
    setDocsStatus(localStorage.getItem(LS_DOCS_STATUS_KEY) ?? "NONE")
    setFinalValid(localStorage.getItem(LS_FINAL_VALID_KEY) === "true")
  }, [])

  if (!user) return null

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Panel admin untuk validasi pembayaran, validasi berkas, berita, pemenang, statistik, dan export data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600">Status Pembayaran (mock)</div>
          <div className="mt-2 text-2xl font-bold">{paymentStatus}</div>
          <p className="text-xs text-gray-500 mt-2">
            Ubah status di menu “Validasi Pembayaran”.
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600">Status Dokumen (mock)</div>
          <div className="mt-2 text-2xl font-bold">{docsStatus}</div>
          <p className="text-xs text-gray-500 mt-2">
            Approve/Reject dokumen di menu “Validasi Dokumen”.
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600">Final Valid (mock)</div>
          <div className="mt-2 text-2xl font-bold">{finalValid ? "YA" : "BELUM"}</div>
          <p className="text-xs text-gray-500 mt-2">
            Otomatis YA jika semua dokumen APPROVED.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold">Aksi Cepat</h2>
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <Link
            href="/admin/pembayaran"
            className="rounded-lg px-4 py-2 font-semibold bg-green-600 text-white hover:bg-green-700 text-center"
          >
            Validasi Pembayaran
          </Link>

          <Link
            href="/admin/dokumen"
            className="rounded-lg px-4 py-2 font-semibold border border-gray-200 hover:bg-gray-50 text-center"
          >
            Validasi Dokumen
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold">Ringkasan Role</h2>
        <ul className="list-disc ml-5 mt-3 text-sm text-gray-700 space-y-1">
          <li><b>ADMIN</b>: dapat validasi pembayaran & dokumen semua cabor.</li>
          <li><b>ADMIN_CABOR</b>: hanya bisa validasi sesuai cabor yang ditugaskan (nanti kita hubungkan scope-nya).</li>
          <li><b>SUPER_ADMIN</b>: dapat membuat akun admin, mengaktifkan/nonaktifkan, hapus admin, dan validasi semua.</li>
        </ul>
        <div className="mt-3 text-xs text-gray-500">
          *Saat ini masih mock (frontend-only). Nantinya scope admin cabor akan memakai filter sportId.
        </div>
      </div>
    </div>
  )
}
