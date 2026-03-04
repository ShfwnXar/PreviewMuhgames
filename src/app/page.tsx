"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { eventConfig } from "@/lib/eventConfig"

function Countdown({ targetISO }: { targetISO: string }) {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target - now)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  const started = target - now <= 0

  return (
    <div className="border rounded-2xl p-6 bg-white shadow-sm">
      <div className="text-sm font-semibold text-gray-600">
        Countdown Pertandingan
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
        {started ? "Pertandingan sudah dimulai!" : `${days} hari lagi`}
      </div>

      {!started && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-xl bg-gray-50 border p-3">
            <div className="text-xl font-bold">{days}</div>
            <div className="text-xs text-gray-600">Hari</div>
          </div>
          <div className="rounded-xl bg-gray-50 border p-3">
            <div className="text-xl font-bold">{hours}</div>
            <div className="text-xs text-gray-600">Jam</div>
          </div>
          <div className="rounded-xl bg-gray-50 border p-3">
            <div className="text-xl font-bold">{minutes}</div>
            <div className="text-xs text-gray-600">Menit</div>
          </div>
          <div className="rounded-xl bg-gray-50 border p-3">
            <div className="text-xl font-bold">{seconds}</div>
            <div className="text-xs text-gray-600">Detik</div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Jadwal mulai: <b>{new Date(eventConfig.tournamentStart).toLocaleString()}</b>
      </div>
    </div>
  )
}

export default function HomePage() {
  const nav = eventConfig.nav

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logos */}
          <div className="flex items-center gap-3">
            {eventConfig.headerLogos.map((l) => (
              <div key={l.id} className="flex items-center gap-2">
                <div className="relative w-9 h-9">
                  <Image
                    src={l.src}
                    alt={l.label}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
            <div className="hidden md:block">
              <div className="font-extrabold text-green-700 leading-tight">
                Muhammadiyah Games 2026
              </div>
              <div className="text-xs text-gray-500">Portal Resmi Pendaftaran</div>
            </div>
          </div>

          {/* Menu */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-semibold">
            <Link className="text-gray-700 hover:text-green-700" href={nav.download}>
              Download
            </Link>
            <Link className="text-gray-700 hover:text-green-700" href={nav.berita}>
              Berita
            </Link>
            <Link className="text-gray-700 hover:text-green-700" href={nav.pengumuman}>
              Pengumuman
            </Link>
            <Link className="text-gray-700 hover:text-green-700" href={nav.peringkat}>
              Peringkat
            </Link>
            <Link className="text-gray-700 hover:text-green-700" href={nav.statistik}>
              Statistik Pendaftar
            </Link>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <Link className="text-gray-700 hover:text-green-700" href={nav.login}>
              Login
            </Link>
            <Link
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              href={nav.daftar}
            >
              Daftar
            </Link>
          </nav>

          {/* Mobile quick */}
          <div className="lg:hidden flex items-center gap-2">
            <Link className="text-sm font-semibold text-gray-700" href={nav.login}>
              Login
            </Link>
            <Link className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold" href={nav.daftar}>
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
              🏆 Pendaftaran Resmi
              <span className="text-green-700">Muhammadiyah Games 2026</span>
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Portal Pendaftaran Kontingen
              <span className="text-green-700"> Muhammadiyah Games 2026</span>
            </h1>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Buat akun kontingen (sekolah/kampus/pimpinan cabang/ranting), isi kuota cabang olahraga,
              lakukan pembayaran, input data atlet, dan upload dokumen sesuai ketentuan.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={nav.daftar}
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 text-center"
              >
                Daftar Kontingen
              </Link>
              <Link
                href={nav.berita}
                className="px-6 py-3 rounded-xl border bg-white font-semibold hover:bg-gray-50 text-center"
              >
                Lihat Berita & Informasi
              </Link>
            </div>

            {/* Sponsor strip mini */}
            <div className="mt-8">
              <div className="text-xs font-semibold text-gray-500 mb-2">
                Didukung oleh Sponsor:
              </div>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {eventConfig.sponsors.map((s) => (
                  <div key={s.id} className="bg-white border rounded-xl p-2 flex items-center justify-center">
                    <div className="relative w-full h-8">
                      <Image src={s.src} alt={s.label} fill className="object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Maskot + countdown */}
          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-600">
                Maskot Resmi
              </div>
              <div className="mt-3 flex items-center justify-center">
                <div className="relative w-full h-64 md:h-80">
                  <Image
                    src={eventConfig.mascot.src}
                    alt={eventConfig.mascot.label}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                {eventConfig.mascot.label}
              </div>
            </div>

            <Countdown targetISO={eventConfig.tournamentStart} />
          </div>
        </div>
      </section>

      {/* SECTION: Alur singkat */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Alur Pendaftaran Kontingen
          </h2>
          <p className="text-gray-600 mt-2">
            Ringkas alur sesuai sistem pendaftaran yang akan kamu gunakan.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                t: "1) Isi Kuota",
                d: "Pilih cabor & isi jumlah peserta per kategori + official.",
              },
              {
                t: "2) Pembayaran",
                d: "Transfer sesuai total biaya lalu upload bukti.",
              },
              {
                t: "3) Input Atlet",
                d: "Setelah pembayaran disetujui, input data atlet sesuai kuota.",
              },
              {
                t: "4) Upload Dokumen",
                d: "Upload 5 dokumen wajib per atlet untuk diverifikasi admin.",
              },
            ].map((x) => (
              <div key={x.t} className="border rounded-xl p-4 bg-gray-50">
                <div className="font-bold">{x.t}</div>
                <div className="text-sm text-gray-600 mt-1">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="font-extrabold text-green-700 text-lg">
                Muhammadiyah Games 2026
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {eventConfig.footer.orgLine1}
                <br />
                {eventConfig.footer.orgLine2}
              </div>
              <div className="text-xs text-gray-500 mt-3">
                {eventConfig.footer.contactNote}
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-900">Menu</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold">
                <Link className="text-gray-700 hover:text-green-700" href={nav.download}>
                  Download
                </Link>
                <Link className="text-gray-700 hover:text-green-700" href={nav.berita}>
                  Berita
                </Link>
                <Link className="text-gray-700 hover:text-green-700" href={nav.pengumuman}>
                  Pengumuman
                </Link>
                <Link className="text-gray-700 hover:text-green-700" href={nav.peringkat}>
                  Peringkat
                </Link>
                <Link className="text-gray-700 hover:text-green-700" href={nav.statistik}>
                  Statistik
                </Link>
                <Link className="text-gray-700 hover:text-green-700" href={nav.login}>
                  Login
                </Link>
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-900">Sponsor</div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {eventConfig.sponsors.map((s) => (
                  <div key={s.id} className="bg-gray-50 border rounded-xl p-2 flex items-center justify-center">
                    <div className="relative w-full h-8">
                      <Image src={s.src} alt={s.label} fill className="object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 text-xs text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>© {new Date().getFullYear()} Muhammadiyah Games 2026. All rights reserved.</div>
            <div className="text-gray-400">
              Dibuat untuk portal pendaftaran kontingen.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
