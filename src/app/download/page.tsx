"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type DownloadCategory = "JUKNIS" | "FORMULIR" | "SURAT" | "LAINNYA"

type DownloadFile = {
  id: string
  category: DownloadCategory
  title: string
  fileName: string
  mimeType: string
  // frontend-only: file disimpan base64
  base64: string
  createdAt: string
}

const LS_DOWNLOADS_KEY = "mg26_downloads"

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function categoryLabel(c: DownloadCategory) {
  switch (c) {
    case "JUKNIS":
      return "Juknis / Petunjuk Teknis"
    case "FORMULIR":
      return "Formulir"
    case "SURAT":
      return "Surat Resmi"
    case "LAINNYA":
      return "Lainnya"
    default:
      return c
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function downloadBase64File(file: DownloadFile) {
  // base64 sudah include tanpa prefix
  const byteChars = atob(file.base64)
  const byteNumbers = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i)
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: file.mimeType })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = file.fileName
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
}

export default function DownloadPage() {
  const [files, setFiles] = useState<DownloadFile[]>([])

  useEffect(() => {
    const data = safeParse<DownloadFile[]>(localStorage.getItem(LS_DOWNLOADS_KEY), [])
    setFiles(data)
  }, [])

  const grouped = useMemo(() => {
    const groups: Record<DownloadCategory, DownloadFile[]> = {
      JUKNIS: [],
      FORMULIR: [],
      SURAT: [],
      LAINNYA: [],
    }

    for (const f of files) {
      groups[f.category].push(f)
    }

    // sort terbaru dulu
    for (const k of Object.keys(groups) as DownloadCategory[]) {
      groups[k] = groups[k].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    }

    return groups
  }, [files])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">Download</h1>
          <p className="text-gray-600 mt-2">
            Unduh juknis, formulir, dan dokumen resmi Muhammadiyah Games 2026.
          </p>

          <div className="mt-4 flex gap-3 flex-wrap">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border bg-white font-semibold hover:bg-gray-50"
            >
              Kembali ke Landing
            </Link>
            <Link
              href="/pengumuman"
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Lihat Pengumuman
            </Link>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 shadow-sm text-sm text-gray-600">
            Belum ada file yang tersedia. Admin dapat mengupload file dari panel admin.
          </div>
        ) : (
          <div className="space-y-6">
            {(["JUKNIS", "FORMULIR", "SURAT", "LAINNYA"] as DownloadCategory[]).map((cat) => (
              <div key={cat} className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold">{categoryLabel(cat)}</h2>

                {grouped[cat].length === 0 ? (
                  <div className="mt-3 text-sm text-gray-500">Belum ada file.</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {grouped[cat].map((f) => (
                      <div
                        key={f.id}
                        className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">{f.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {f.fileName} • {formatDate(f.createdAt)}
                          </div>
                        </div>

                        <button
                          onClick={() => downloadBase64File(f)}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
