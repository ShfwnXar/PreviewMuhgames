// src/app/admin/dokumen/page.tsx
"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useMemo, useState } from "react"
import type { AthleteDocuments, DocumentStatus, Registration, Athlete } from "@/types/registration"

type DocKey = keyof Omit<AthleteDocuments, "athleteId">
type ReviewStatus = Exclude<DocumentStatus, "EMPTY" | "UPLOADED">

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function docLabel(key: DocKey) {
  switch (key) {
    case "dapodik":
      return "1) Bukti terdaftar di Dapodik / PD-Dikti"
    case "ktp":
      return "2) KTP / KIA"
    case "kartu":
      return "3) Kartu Pelajar / KTM"
    case "raport":
      return "4) Raport / KHS"
    case "foto":
      return "5) Pas foto"
    default:
      return key
  }
}

function badge(status: DocumentStatus) {
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-extrabold border"
  if (status === "EMPTY") return <span className={`${base} bg-gray-50 border-gray-200 text-gray-600`}>EMPTY</span>
  if (status === "UPLOADED") return <span className={`${base} bg-yellow-50 border-yellow-200 text-yellow-800`}>UPLOADED</span>
  if (status === "APPROVED") return <span className={`${base} bg-green-50 border-green-200 text-green-800`}>APPROVED</span>
  return <span className={`${base} bg-red-50 border-red-200 text-red-700`}>REJECTED</span>
}

// ✅ helper: bikin URL preview dari data FE sekarang
function buildFileUrl(fileName?: string) {
  if (!fileName) return ""
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) return fileName
  if (fileName.startsWith("/")) return fileName
  return `/uploads/${encodeURIComponent(fileName)}`
}

// ✅ helper: tebak mime dari ekstensi (tanpa butuh field mimeType di types)
function guessMime(fileName?: string) {
  const n = (fileName || "").toLowerCase()
  if (n.endsWith(".pdf")) return "application/pdf"
  if (n.endsWith(".png")) return "image/png"
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg"
  if (n.endsWith(".webp")) return "image/webp"
  return ""
}

function isImageMime(mime?: string) {
  return !!mime && mime.startsWith("image/")
}

function isPdfMime(mime?: string) {
  return mime === "application/pdf"
}

export default function AdminDokumenPage() {
  const { getAllUsers, user: adminUser, canAccessSport } = useAuth()

  const [targetUserId, setTargetUserId] = useState<string>("")
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("")

  // preview state
  const [preview, setPreview] = useState<{
    open: boolean
    title: string
    url: string
    mime?: string
  }>({ open: false, title: "", url: "", mime: "" })

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
      setSelectedAthleteId("")
    }
  }, [visibleKontingen, targetUserId])

  useEffect(() => {
    if (!targetUserId) return
    const reg = safeParse<Registration | null>(localStorage.getItem(`mg26_registration_${targetUserId}`), null)
    setRegistration(reg)

    if (reg?.athletes?.length) setSelectedAthleteId(reg.athletes[0].id)
    else setSelectedAthleteId("")
  }, [targetUserId])

  // FILTER atlet sesuai role (ADMIN_CABOR hanya atlet cabor yg dipegang)
  const visibleAthletes = useMemo(() => {
    if (!registration || !adminUser) return []
    if (adminUser.role === "ADMIN" || adminUser.role === "SUPER_ADMIN") return registration.athletes

    if (adminUser.role === "ADMIN_CABOR") {
      return registration.athletes.filter((a) => canAccessSport(a.sportId))
    }

    return []
  }, [registration, adminUser, canAccessSport])

  useEffect(() => {
    if (visibleAthletes.length > 0 && !selectedAthleteId) {
      setSelectedAthleteId(visibleAthletes[0].id)
    }
  }, [visibleAthletes, selectedAthleteId])

  const selectedAthlete: Athlete | null = useMemo(() => {
    if (!registration || !selectedAthleteId) return null
    return registration.athletes.find((a) => a.id === selectedAthleteId) ?? null
  }, [registration, selectedAthleteId])

  const selectedDocs = useMemo(() => {
    if (!registration || !selectedAthleteId) return null
    return registration.documents.find((d) => d.athleteId === selectedAthleteId) ?? null
  }, [registration, selectedAthleteId])

  const openPreview = (docKey: DocKey) => {
    if (!selectedDocs) return
    const fileName = selectedDocs[docKey]?.fileName
    const url = buildFileUrl(fileName)

    if (!fileName || !url) {
      alert("File belum diupload / URL belum tersedia.")
      return
    }

    const mime = guessMime(fileName)

    setPreview({
      open: true,
      title: docLabel(docKey),
      url,
      mime,
    })
  }

  const updateDoc = (docKey: DocKey, status: ReviewStatus) => {
    if (!registration || !selectedAthleteId) return

    const key = `mg26_registration_${targetUserId}`
    const reg = safeParse<Registration | null>(localStorage.getItem(key), null)
    if (!reg) return

    const athlete = reg.athletes.find((a) => a.id === selectedAthleteId)
    if (!athlete) return

    // SECURITY scope
    if (adminUser?.role === "ADMIN_CABOR" && !canAccessSport(athlete.sportId)) {
      alert("Anda tidak memiliki akses untuk cabor ini.")
      return
    }

    const updatedDocs = reg.documents.map((d) => {
      if (d.athleteId !== selectedAthleteId) return d
      return {
        ...d,
        [docKey]: {
          ...d[docKey],
          status,
        },
      }
    })

    const updated: Registration = {
      ...reg,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(key, JSON.stringify(updated))
    setRegistration(updated)
  }

  const docKeys: DocKey[] = ["dapodik", "ktp", "kartu", "raport", "foto"]

  return (
    <div className="max-w-7xl space-y-6">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Validasi Dokumen Atlet</h1>
            <p className="text-gray-600 mt-2">Menu Validasi Dokumen Peserta lomba</p>
          </div>
        </div>
      </div>

      {/* pilih kontingen */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-extrabold text-gray-900 mb-2">Pilih Kontingen</div>
        {visibleKontingen.length === 0 ? (
          <div className="text-sm text-gray-500">Tidak ada kontingen yang bisa kamu validasi.</div>
        ) : (
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
          >
            {visibleKontingen.map(({ u, reg }) => (
              <option key={u.id} value={u.id}>
                {u.institutionName} — {u.email} {reg ? `(${reg.sports.map((s) => s.name).join(", ")})` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* konten utama 2 kolom */}
      {!registration ? (
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-sm text-gray-500">
          Kontingen ini belum memulai pendaftaran / belum ada data registration.
        </div>
      ) : visibleAthletes.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-sm text-gray-500">
          Tidak ada atlet yang bisa Anda validasi (scope cabor).
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KIRI: data atlet */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="text-lg font-extrabold text-gray-900">Data Atlet</div>

            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              {visibleAthletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {!selectedAthlete ? (
              <div className="text-sm text-gray-500">Atlet tidak ditemukan.</div>
            ) : (
              <div className="rounded-2xl border bg-gray-50 p-4 space-y-2">
                <div className="text-sm">
                  <b>Nama:</b> {selectedAthlete.name}
                </div>
                <div className="text-sm">
                  <b>Gender:</b> {selectedAthlete.gender}
                </div>
                <div className="text-sm">
                  <b>Tgl Lahir:</b> {selectedAthlete.birthDate || "-"}
                </div>
                <div className="text-sm">
                  <b>Asal:</b> {selectedAthlete.institution || "-"}
                </div>
                <div className="text-sm">
                  <b>Cabor:</b>{" "}
                  {registration.sports.find((s) => s.id === selectedAthlete.sportId)?.name ?? selectedAthlete.sportId}
                </div>

                {/* ✅ FIX: Category pakai .label, bukan .name */}
                <div className="text-sm">
                  <b>Kategori:</b>{" "}
                  {registration.sports
                    .find((s) => s.id === selectedAthlete.sportId)
                    ?.categories.find((c) => c.id === selectedAthlete.categoryId)
                    ?.label ?? selectedAthlete.categoryId}
                </div>

                <div className="text-xs text-gray-500 pt-2">Athlete ID: {selectedAthlete.id}</div>
              </div>
            )}
          </div>

          {/* KANAN: dokumen */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="text-lg font-extrabold text-gray-900">Dokumen</div>

            {!selectedDocs ? (
              <div className="text-sm text-gray-500">Belum ada dokumen untuk atlet ini.</div>
            ) : (
              <div className="space-y-3">
                {docKeys.map((docKey) => {
                  const d = selectedDocs[docKey]
                  const url = buildFileUrl(d.fileName)
                  const canOpen = d.status !== "EMPTY" && !!d.fileName

                  return (
                    <div key={docKey} className="rounded-2xl border p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-gray-900">{docLabel(docKey)}</div>
                          <div className="mt-2 flex items-center gap-2">
                            {badge(d.status)}
                            <span className="text-xs text-gray-500">{d.fileName ?? "-"}</span>
                          </div>

                          {/* ✅ FIX: DocumentItem di types gak punya uploadedAt */}
                          <div className="text-xs text-gray-500 mt-1">
                            Upload: {"-"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openPreview(docKey)}
                            disabled={!canOpen}
                            className={`px-3 py-2 rounded-xl font-extrabold border ${
                              canOpen ? "bg-white hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            title={!canOpen ? "Belum ada file" : "Buka dokumen"}
                          >
                            Buka Dokumen
                          </button>

                          <button
                            type="button"
                            onClick={() => updateDoc(docKey, "APPROVED")}
                            className="px-3 py-2 rounded-xl font-extrabold bg-green-600 text-white hover:bg-green-700"
                            disabled={!canOpen}
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() => updateDoc(docKey, "REJECTED")}
                            className="px-3 py-2 rounded-xl font-extrabold bg-red-600 text-white hover:bg-red-700"
                            disabled={!canOpen}
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {canOpen && (
                        <div className="mt-3 text-xs text-gray-500">
                          Preview URL: <span className="break-all">{url}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PREVIEW */}
      {preview.open && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-gray-900">{preview.title}</div>
                <div className="text-xs text-gray-500 break-all">{preview.url}</div>
              </div>
              <div className="flex gap-2">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl border bg-white font-extrabold hover:bg-gray-50"
                >
                  Buka Tab Baru
                </a>
                <button
                  onClick={() => setPreview({ open: false, title: "", url: "", mime: "" })}
                  className="px-3 py-2 rounded-xl bg-gray-900 text-white font-extrabold hover:bg-black"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="p-4">
              {isImageMime(preview.mime) && (
                <div className="w-full flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={preview.title} className="max-h-[70vh] object-contain rounded-xl border" />
                </div>
              )}

              {isPdfMime(preview.mime) && (
                <div className="w-full h-[70vh] rounded-xl border overflow-hidden">
                  <iframe title="pdf-preview" src={preview.url} className="w-full h-full" />
                </div>
              )}

              {!isImageMime(preview.mime) && !isPdfMime(preview.mime) && (
                <div className="text-sm text-gray-600">
                  Tipe file: <b>{preview.mime || "unknown"}</b>. Silakan klik <b>Buka Tab Baru</b> untuk melihat file.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}