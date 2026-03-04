import type { RegistrationRepository } from "@/repositories/registrationRepo"
import type { RegistrationState } from "@/context/RegistrationContext"
import type { AdminUpdateDocRequest, AdminUpdatePaymentRequest } from "@/types/api"

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class MockRegistrationRepo implements RegistrationRepository {
  async getRegistrationByUserId(userId: string): Promise<RegistrationState | null> {
    return safeParse<RegistrationState | null>(localStorage.getItem(`mg26_registration_${userId}`), null)
  }

  async saveRegistrationByUserId(userId: string, state: RegistrationState): Promise<void> {
    localStorage.setItem(`mg26_registration_${userId}`, JSON.stringify(state))
  }

  async adminUpdatePayment(input: AdminUpdatePaymentRequest): Promise<void> {
    const key = `mg26_registration_${input.userId}`
    const reg = safeParse<RegistrationState | null>(localStorage.getItem(key), null)
    if (!reg) return
    const updated: RegistrationState = {
      ...reg,
      payment: { ...reg.payment, status: input.status, note: input.note },
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(updated))
  }

  async adminUpdateDoc(input: AdminUpdateDocRequest): Promise<void> {
    const key = `mg26_registration_${input.userId}`
    const reg = safeParse<RegistrationState | null>(localStorage.getItem(key), null)
    if (!reg) return

    const updatedDocs = reg.documents.map((d: any) => {
      if (d.athleteId !== input.athleteId) return d
      return {
        ...d,
        [input.docKey]: { ...d[input.docKey], status: input.status },
      }
    })

    const updated: RegistrationState = {
      ...reg,
      documents: updatedDocs as any,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(key, JSON.stringify(updated))
  }
}