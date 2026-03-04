"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Post = {
  id: string
  type: "NEWS" | "ANNOUNCEMENT"
  title: string
  excerpt: string
  content: string
  createdAt: string // ISO
}

const LS_POSTS_KEY = "mg26_posts"

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function BeritaPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const all = safeParse<Post[]>(localStorage.getItem(LS_POSTS_KEY), [])
    setPosts(all)
  }, [])

  const news = useMemo(() => {
    return posts
      .filter((p) => p.type === "NEWS")
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  }, [posts])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">Berita</h1>
          <p className="text-gray-600 mt-2">
            Informasi terbaru terkait Muhammadiyah Games 2026.
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

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          {news.length === 0 ? (
            <div className="text-sm text-gray-600">
              Belum ada berita. Admin dapat menambahkan berita dari panel admin.
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((p) => (
                <div key={p.id} className="border rounded-xl p-5 hover:bg-gray-50 transition">
                  <div className="text-xs text-gray-500">{formatDate(p.createdAt)}</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{p.title}</div>
                  <div className="mt-2 text-sm text-gray-600">{p.excerpt}</div>

                  <div className="mt-4">
                    <Link
                      href={`/berita/${p.id}`}
                      className="text-sm font-semibold text-green-700 hover:underline"
                    >
                      Baca selengkapnya →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
