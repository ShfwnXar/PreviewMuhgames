import { ENV } from "@/config/env"
import type { AuthRepository } from "@/repositories/authRepo"
import type { RegistrationRepository } from "@/repositories/registrationRepo"
import { MockAuthRepo } from "@/repositories/mock/authRepo.mock"
import { MockRegistrationRepo } from "@/repositories/mock/registrationRepo.mock"

// Nanti kalau backend sudah ada:
// import { HttpAuthRepo } from "@/repositories/http/authRepo.http"
// import { HttpRegistrationRepo } from "@/repositories/http/registrationRepo.http"

export const Repos: {
  auth: AuthRepository
  registration: RegistrationRepository
} = ENV.USE_MOCK
  ? {
      auth: new MockAuthRepo(),
      registration: new MockRegistrationRepo(),
    }
  : {
      // auth: new HttpAuthRepo(),
      // registration: new HttpRegistrationRepo(),
      auth: new MockAuthRepo(),
      registration: new MockRegistrationRepo(),
    }