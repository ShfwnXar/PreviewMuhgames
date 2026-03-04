"use client"

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react"
import { useAuth } from "@/context/AuthContext"

/** ===== Types ===== */
export type PaymentStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED"
export type DocumentStatus = "EMPTY" | "UPLOADED" | "APPROVED" | "REJECTED"

export type DocFile = {
  status: DocumentStatus
  fileId?: string // ✅ pointer ke IndexedDB
  fileName?: string
  mimeType?: string
  uploadedAt?: string
}

export type AthleteDocuments = {
  athleteId: string
  dapodik: DocFile
  ktp: DocFile
  kartu: DocFile
  raport: DocFile
  foto: DocFile
}

export type SportCategory = {
  id: string
  name: string
  quota: number
}

export type SportEntry = {
  id: string
  name: string

  /**
   * Step 1:
   * - plannedAthletes: jumlah atlet yang direncanakan ikut cabor tsb
   * - officialCount: jumlah official cabor tsb
   * - voliMenTeams / voliWomenTeams: khusus voli (biaya per tim)
   */
  plannedAthletes: number
  officialCount: number
  voliMenTeams?: number
  voliWomenTeams?: number

  // Step 3/4: detail kategori/atlet (kategori dipilih di Step 3)
  categories: SportCategory[]
}

export type Athlete = {
  id: string
  sportId: string
  categoryId: string
  name: string
  gender: "PUTRA" | "PUTRI"
  birthDate: string
  institution: string
}

export type Official = {
  id: string
  sportId: string
  name: string
  phone?: string
}

export type PaymentInfo = {
  status: PaymentStatus
  proofFileId?: string // ✅ pointer ke IndexedDB
  proofFileName?: string
  proofMimeType?: string
  uploadedAt?: string
  totalFee: number
  note?: string
}

export type RegistrationState = {
  sports: SportEntry[]
  athletes: Athlete[]
  officials: Official[]
  documents: AthleteDocuments[]
  payment: PaymentInfo
  updatedAt?: string
}

/** ===== Constants ===== */
const LS_KEY_PREFIX = "mg26_registration_"

const FEE_ATHLETE = 100_000
const FEE_OFFICIAL = 50_000
const FEE_VOLI_TEAM = 1_200_000
const SPORT_VOLI_ID = "voli_indoor"

/** ===== Utils ===== */
function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function emptyDoc(): DocFile {
  return { status: "EMPTY" }
}

function ensureAthleteDocs(athleteId: string): AthleteDocuments {
  return {
    athleteId,
    dapodik: emptyDoc(),
    ktp: emptyDoc(),
    kartu: emptyDoc(),
    raport: emptyDoc(),
    foto: emptyDoc(),
  }
}

/**
 * ✅ Total biaya dihitung dari Step 1 (plannedAthletes, officialCount, tim voli)
 * - semua atlet non-voli: plannedAthletes * 100.000
 * - official: officialCount * 50.000
 * - voli: (voliMenTeams+voliWomenTeams) * 1.200.000
 */
function computeTotalFee(sports: SportEntry[]) {
  let total = 0

  for (const s of sports) {
    const officials = Math.max(0, Number(s.officialCount || 0))
    total += officials * FEE_OFFICIAL

    if (s.id === SPORT_VOLI_ID) {
      const men = Math.max(0, Number(s.voliMenTeams || 0))
      const women = Math.max(0, Number(s.voliWomenTeams || 0))
      total += (men + women) * FEE_VOLI_TEAM
      // plannedAthletes untuk voli tidak dipakai biaya (biaya per tim)
      continue
    }

    const athletes = Math.max(0, Number(s.plannedAthletes || 0))
    total += athletes * FEE_ATHLETE
  }

  return total
}

/** ===== Initial State ===== */
const initialState: RegistrationState = {
  sports: [],
  athletes: [],
  officials: [],
  documents: [],
  payment: {
    status: "NONE",
    totalFee: 0,
  },
}

/** ===== Actions ===== */
type Action =
  | { type: "LOAD"; payload: RegistrationState }
  | { type: "RESET" }
  | { type: "SET_SPORTS"; sports: SportEntry[] }
  | {
      type: "UPDATE_SPORT_PLANNING"
      sportId: string
      patch: Partial<Pick<SportEntry, "plannedAthletes" | "officialCount" | "voliMenTeams" | "voliWomenTeams">>
    }
  | { type: "SET_PAYMENT_PROOF"; fileId: string; fileName: string; mimeType: string }
  | { type: "SET_PAYMENT_STATUS"; status: PaymentStatus; note?: string }
  | { type: "ADD_ATHLETE"; athlete: Athlete }
  | { type: "UPDATE_ATHLETE"; athlete: Athlete }
  | { type: "REMOVE_ATHLETE"; athleteId: string }
  | { type: "ADD_OFFICIAL"; official: Official }
  | { type: "REMOVE_OFFICIAL"; officialId: string }
  | {
      type: "UPSERT_DOC_FILE"
      athleteId: string
      docKey: keyof Omit<AthleteDocuments, "athleteId">
      fileId: string
      fileName: string
      mimeType: string
    }
  | {
      type: "SET_DOC_STATUS"
      athleteId: string
      docKey: keyof Omit<AthleteDocuments, "athleteId">
      status: Exclude<DocumentStatus, "EMPTY">
    }

/** ===== Reducer ===== */
function reducer(state: RegistrationState, action: Action): RegistrationState {
  switch (action.type) {
    case "LOAD": {
      const p = action.payload || ({} as RegistrationState)
      const sports = p.sports || []
      const totalFee = p.payment?.totalFee ?? computeTotalFee(sports)

      return {
        ...initialState,
        ...p,
        sports,
        athletes: p.athletes || [],
        officials: p.officials || [],
        documents: p.documents || [],
        payment: {
          ...initialState.payment,
          ...(p.payment || {}),
          totalFee,
        },
      }
    }

    case "RESET":
      return { ...initialState }

    case "SET_SPORTS": {
      const sports = action.sports
      const totalFee = computeTotalFee(sports)

      return {
        ...state,
        sports,
        payment: { ...state.payment, totalFee },
        updatedAt: new Date().toISOString(),
      }
    }

    case "UPDATE_SPORT_PLANNING": {
      const sports = state.sports.map((s) => {
        if (s.id !== action.sportId) return s
        const next = { ...s, ...action.patch }

        // normalisasi angka
        next.plannedAthletes = Math.max(0, Number(next.plannedAthletes || 0))
        next.officialCount = Math.max(0, Number(next.officialCount || 0))
        if (next.id === SPORT_VOLI_ID) {
          next.voliMenTeams = Math.max(0, Number(next.voliMenTeams || 0))
          next.voliWomenTeams = Math.max(0, Number(next.voliWomenTeams || 0))
        }
        return next
      })

      const totalFee = computeTotalFee(sports)
      return {
        ...state,
        sports,
        payment: { ...state.payment, totalFee },
        updatedAt: new Date().toISOString(),
      }
    }

    case "SET_PAYMENT_PROOF": {
      return {
        ...state,
        payment: {
          ...state.payment,
          proofFileId: action.fileId,
          proofFileName: action.fileName,
          proofMimeType: action.mimeType,
          uploadedAt: new Date().toISOString(),
          status: "PENDING",
        },
        updatedAt: new Date().toISOString(),
      }
    }

    case "SET_PAYMENT_STATUS": {
      return {
        ...state,
        payment: { ...state.payment, status: action.status, note: action.note },
        updatedAt: new Date().toISOString(),
      }
    }

    case "ADD_ATHLETE": {
      const athletes = [action.athlete, ...state.athletes]
      const hasDocs = state.documents.some((d) => d.athleteId === action.athlete.id)
      const documents = hasDocs ? state.documents : [ensureAthleteDocs(action.athlete.id), ...state.documents]
      return { ...state, athletes, documents, updatedAt: new Date().toISOString() }
    }

    case "UPDATE_ATHLETE": {
      const athletes = state.athletes.map((a) => (a.id === action.athlete.id ? action.athlete : a))
      return { ...state, athletes, updatedAt: new Date().toISOString() }
    }

    case "REMOVE_ATHLETE": {
      return {
        ...state,
        athletes: state.athletes.filter((a) => a.id !== action.athleteId),
        documents: state.documents.filter((d) => d.athleteId !== action.athleteId),
        updatedAt: new Date().toISOString(),
      }
    }

    case "ADD_OFFICIAL": {
      const officials = [action.official, ...state.officials]
      return { ...state, officials, updatedAt: new Date().toISOString() }
    }

    case "REMOVE_OFFICIAL": {
      return {
        ...state,
        officials: state.officials.filter((o) => o.id !== action.officialId),
        updatedAt: new Date().toISOString(),
      }
    }

    case "UPSERT_DOC_FILE": {
      const docKey = action.docKey

      const documents = state.documents.map((d) => {
        if (d.athleteId !== action.athleteId) return d
        return {
          ...d,
          [docKey]: {
            status: "UPLOADED",
            fileId: action.fileId,
            fileName: action.fileName,
            mimeType: action.mimeType,
            uploadedAt: new Date().toISOString(),
          },
        }
      })

      const exists = state.documents.some((d) => d.athleteId === action.athleteId)
      const finalDocs = exists ? documents : [ensureAthleteDocs(action.athleteId), ...documents]

      return { ...state, documents: finalDocs, updatedAt: new Date().toISOString() }
    }

    case "SET_DOC_STATUS": {
      const docKey = action.docKey
      const documents = state.documents.map((d) => {
        if (d.athleteId !== action.athleteId) return d
        const prev = d[docKey]
        return { ...d, [docKey]: { ...prev, status: action.status } }
      })
      return { ...state, documents, updatedAt: new Date().toISOString() }
    }

    default:
      return state
  }
}

/** ===== Context ===== */
type RegistrationContextValue = {
  state: RegistrationState
  dispatch: React.Dispatch<Action>

  storageKey: string | null
  hydrateReady: boolean

  setSports: (sports: SportEntry[]) => void
  updateSportPlanning: (
    sportId: string,
    patch: Partial<Pick<SportEntry, "plannedAthletes" | "officialCount" | "voliMenTeams" | "voliWomenTeams">>
  ) => void

  setPaymentProof: (fileId: string, fileName: string, mimeType: string) => void

  addAthlete: (athlete: Omit<Athlete, "id">) => string
  updateAthlete: (athlete: Athlete) => void
  removeAthlete: (athleteId: string) => void

  addOfficial: (official: Omit<Official, "id">) => string
  removeOfficial: (officialId: string) => void

  upsertDocFile: (
    athleteId: string,
    docKey: keyof Omit<AthleteDocuments, "athleteId">,
    fileId: string,
    fileName: string,
    mimeType: string
  ) => void
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

/** ===== Provider ===== */
export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [hydrateReady, setHydrateReady] = React.useState(false)

  const storageKey = user ? `${LS_KEY_PREFIX}${user.id}` : null

  useEffect(() => {
    if (!storageKey) {
      setHydrateReady(false)
      return
    }

    const saved = safeParse<RegistrationState | null>(localStorage.getItem(storageKey), null)
    if (saved) dispatch({ type: "LOAD", payload: saved })
    else dispatch({ type: "LOAD", payload: initialState })

    setHydrateReady(true)
  }, [storageKey])

  useEffect(() => {
    if (!storageKey) return
    if (!hydrateReady) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (e) {
      console.error("Failed to persist registration state:", e)
    }
  }, [state, storageKey, hydrateReady])

  const value = useMemo<RegistrationContextValue>(() => {
    return {
      state,
      dispatch,
      storageKey,
      hydrateReady,

      setSports: (sports) => dispatch({ type: "SET_SPORTS", sports }),
      updateSportPlanning: (sportId, patch) => dispatch({ type: "UPDATE_SPORT_PLANNING", sportId, patch }),

      setPaymentProof: (fileId, fileName, mimeType) =>
        dispatch({ type: "SET_PAYMENT_PROOF", fileId, fileName, mimeType }),

      addAthlete: (athlete) => {
        const id = uid("ath")
        dispatch({ type: "ADD_ATHLETE", athlete: { id, ...athlete } })
        return id
      },
      updateAthlete: (athlete) => dispatch({ type: "UPDATE_ATHLETE", athlete }),
      removeAthlete: (athleteId) => dispatch({ type: "REMOVE_ATHLETE", athleteId }),

      addOfficial: (official) => {
        const id = uid("off")
        dispatch({ type: "ADD_OFFICIAL", official: { id, ...official } })
        return id
      },
      removeOfficial: (officialId) => dispatch({ type: "REMOVE_OFFICIAL", officialId }),

      upsertDocFile: (athleteId, docKey, fileId, fileName, mimeType) =>
        dispatch({ type: "UPSERT_DOC_FILE", athleteId, docKey, fileId, fileName, mimeType }),
    }
  }, [state, storageKey, hydrateReady])

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext)
  if (!ctx) throw new Error("useRegistration must be used within RegistrationProvider")
  return ctx
}