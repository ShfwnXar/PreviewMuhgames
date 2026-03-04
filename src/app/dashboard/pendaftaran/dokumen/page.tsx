"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRegistration } from "@/context/RegistrationContext"
import { putFileBlob } from "@/lib/fileStore" // ✅ ADD

type DocKey = "dapodik" | "ktp" | "kartu" | "raport" | "foto"

const DOCS: Array<{ key: DocKey; label: string; hint: string }> = [
  {
    key: "dapodik",
    label: "1) Bukti terdaftar Dapodik / PD-Dikti",
    hint: "Upload bukti terdaftar (PDF/JPG/PNG).",
  },
  {
    key: "ktp",
    label: "2) KTP / KIA (anak < 17 tahun)",
    hint: "Jika di bawah 17 tahun gunakan KIA. Bisa PDF/JPG/PNG.",
  },
  {
    key: "kartu",
    label: "3) Kartu Pelajar Muhammadiyah / Kartu Tanda Mahasiswa",
    hint: "Kartu Pelajar/KTM (PDF/JPG/PNG).",
  },
  {
    key: "raport",
    label: "4) Raport / Kartu Hasil Studi terakhir",
    hint: "Raport/KHS terbaru (PDF/JPG/PNG).",
  },
  {
    key: "foto",
    label: "5) Pas Foto terbaru",
    hint: "Disarankan JPG/PNG.",
  },
]

function formatISO(iso?: string) {
  if (!iso) return "-"
  try {
    const d = new Date(iso)
    return d.toLocaleString("id-ID")
  } catch {
    return iso
  }
}

export default function Step4DokumenPage() {
  const { state, hydrateReady, upsertDocFile } = useRegistration()
  const paymentApproved = state.payment.status === "APPROVED"

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("")
  const [loadingKey, setLoadingKey] = useState<DocKey | null>(null)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const athletes = state.athletes

  const docsForSelected = useMemo(() => {
    if (!selectedAthleteId) return null
    return state.documents.find((d) => d.athleteId === selectedAthleteId) ?? null
  }, [state.documents, selectedAthleteId])

  const selectedAthlete = useMemo(() => {
    if (!selectedAthleteId) return null
    return athletes.find((a) => a.id === selectedAthleteId) ?? null
  }, [athletes, selectedAthleteId])

  // progress per atlet
  const athleteProgress = useMemo(() => {
    const m = new Map<string, { uploaded: number; total: number }>()
    for (const a of athletes) {
      const doc = state.documents.find((d) => d.athleteId === a.id)
      let uploaded = 0
      for (const it of DOCS) {
        const f = (doc as any)?.[it.key]
        if (f?.status && f.status !== "EMPTY") uploaded += 1
      }
      m.set(a.id, { uploaded, total: DOCS.length })
    }
    return m
  }, [athletes, state.documents])

  // auto select first athlete
  useMemo(() => {
    if (!hydrateReady) return
    if (selectedAthleteId) return
    if (athletes.length > 0) setSelectedAthleteId(athletes[0].id)
  }, [hydrateReady, athletes, selectedAthleteId])

  const onPickFile = async (docKey: DocKey, file: File | null) => {
    if (!file) return
    setMsg(null)

    if (!paymentApproved) {
      setMsg({ type: "error", text: "Step 4 terkunci: pembayaran harus APPROVED terlebih dahulu." })
      return
    }
    if (!selectedAthleteId) {
      setMsg({ type: "error", text: "Pilih atlet terlebih dahulu." })
      return
    }

    // batas ukuran hanya sebagai info (karena tidak simpan isi file lagi)
    const maxMB = 10
    if (file.size > maxMB * 1024 * 1024) {
      setMsg({ type: "error", text: `Ukuran file terlalu besar. Maks ${maxMB}MB.` })
      return
    }

    setLoadingKey(docKey)
    try {
      const fileId = `doc_${selectedAthleteId}_${docKey}_${Date.now()}_${Math.random()
        .toString(16)
        .slice(2)}`

      await putFileBlob(fileId, file)

      upsertDocFile(
        selectedAthleteId,
        docKey,
        fileId,
        file.name,
        file.type || "application/octet-stream"
      )

      setMsg({ type: "success", text: "Dokumen berhasil dicatat (status: UPLOADED)." })
    } catch (e: any) {
      setMsg({ type: "error", text: e?.message ?? "Gagal upload dokumen." })
    } finally {
      setLoadingKey(null)
    }
  }

  if (!hydrateReady) {
    return (
      <div className="max-w-5xl">
        <div className="bg-white border rounded-xl p-6 shadow-sm text-sm text-gray-600">
          Memuat dokumen...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Step 4 • Upload Dokumen Per Atlet
            </h1>
            <p className="text-gray-600 mt-2">
              Upload 5 dokumen wajib untuk setiap atlet. Admin akan memverifikasi setelahnya.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-gray-50 text-gray-700 border-gray-200">
                Payment: {state.payment.status}
              </span>

              {!paymentApproved && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-800 border-yellow-200">
                  Terkunci sampai pembayaran APPROVED
                </span>
              )}
            </div>

            {!paymentApproved && (
              <div className="mt-3 text-sm text-gray-700">
                Silakan selesaikan verifikasi pembayaran di Step 2 terlebih dahulu.
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
              * File asli disimpan di IndexedDB (pointer: fileId). State hanya simpan metadata.
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4 min-w-[320px]">
            <div className="text-xs text-gray-500">Navigasi</div>
            <div className="mt-2 flex flex-col md:flex-row gap-2">
              <Link
                href="/dashboard/pendaftaran/atlet"
                className="px-3 py-2 rounded-lg border bg-white font-bold hover:bg-gray-50 text-sm text-center"
              >
                Kembali Step 3
              </Link>
              <Link
                href="/dashboard/status"
                className="px-3 py-2 rounded-lg border bg-white font-bold hover:bg-gray-50 text-sm text-center"
              >
                Status
              </Link>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            msg.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* List atlet + selector */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="text-lg font-extrabold text-gray-900">Pilih Atlet</div>

        {athletes.length === 0 ? (
          <div className="text-sm text-gray-600">
            Belum ada atlet. Silakan isi atlet di Step 3.
            <div className="mt-3">
              <Link
                href="/dashboard/pendaftaran/atlet"
                className="inline-flex px-4 py-2 rounded-xl bg-green-600 text-white font-extrabold hover:bg-green-700"
              >
                Ke Step 3 (Input Atlet)
              </Link>
            </div>
          </div>
        ) : (
          <>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              {athletes.map((a) => {
                const prog = athleteProgress.get(a.id)
                const suffix = prog ? ` • Dokumen: ${prog.uploaded}/${prog.total}` : ""
                return (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.sportId}/{a.categoryId}){suffix}
                  </option>
                )
              })}
            </select>

            {selectedAthlete && (
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="font-extrabold text-gray-900">{selectedAthlete.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {selectedAthlete.gender} • Lahir: {selectedAthlete.birthDate || "-"}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Cabor/Kategori: <b>{selectedAthlete.sportId}</b> • <b>{selectedAthlete.categoryId}</b>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload dokumen */}
      {athletes.length > 0 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-lg font-extrabold text-gray-900">Upload Dokumen</div>

          {!docsForSelected ? (
            <div className="text-sm text-gray-600">
              Data dokumen untuk atlet ini belum siap. Coba refresh halaman.
            </div>
          ) : (
            <div className="space-y-4">
              {DOCS.map((d) => {
                const file = (docsForSelected as any)[d.key] as any
                const status = file?.status ?? "EMPTY"
                const fileName = file?.fileName
                const uploadedAt = file?.uploadedAt

                const badgeClass =
                  status === "EMPTY"
                    ? "bg-gray-100 border-gray-200 text-gray-700"
                    : status === "UPLOADED"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : status === "APPROVED"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"

                return (
                  <div key={d.key} className="rounded-xl border p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-gray-900">{d.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{d.hint}</div>

                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${badgeClass}`}
                          >
                            {status}
                          </span>
                          <span className="text-xs text-gray-500">
                            File: <b>{fileName ?? "-"}</b>
                          </span>
                          <span className="text-xs text-gray-500">
                            Upload: <b>{formatISO(uploadedAt)}</b>
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[260px]">
                        <div className="text-xs text-gray-500 mb-2">Upload File</div>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          disabled={!paymentApproved || loadingKey === d.key}
                          onChange={(e) => onPickFile(d.key, e.target.files?.[0] ?? null)}
                          className="w-full border rounded-xl px-3 py-2 bg-white"
                        />
                        {!paymentApproved && (
                          <div className="mt-2 text-xs text-gray-500">
                            Terkunci sampai pembayaran APPROVED.
                          </div>
                        )}
                        {loadingKey === d.key && (
                          <div className="mt-2 text-xs text-gray-500">Mencatat dokumen...</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="font-extrabold text-gray-900">Selesai Step 4</div>
            <div className="text-sm text-gray-600 mt-1">
              Pastikan semua dokumen sudah terupload untuk setiap atlet. Admin akan melakukan verifikasi.
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/status"
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-extrabold hover:bg-green-700"
            >
              Lihat Status
            </Link>
            <Link
              href="/dashboard/pendaftaran/atlet"
              className="px-5 py-2 rounded-xl font-extrabold border bg-white hover:bg-gray-50"
            >
              Kembali Step 3
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}