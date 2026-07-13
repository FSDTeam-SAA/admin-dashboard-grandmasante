import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { getSession, signOut } from "next-auth/react"

const baseURL = process.env.NEXT_PUBLIC_BASE_URL

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

const authClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

let currentAccessToken: string | null = null
let refreshRequest: Promise<string | null> | null = null

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

function extractAccessToken(data: any) {
  return data?.data?.accessToken || data?.accessToken || data?.token || null
}

async function logout() {
  currentAccessToken = null
  refreshRequest = null
  await signOut({ callbackUrl: "/auth/login" })
}

async function refreshAccessToken() {
  const session = await getSession()
  const refreshToken = session?.refreshToken

  if (!refreshToken) {
    await logout()
    return null
  }

  refreshRequest ??= authClient
    .post("/auth/refresh-token", { refreshToken })
    .then((res) => {
      const nextAccessToken = extractAccessToken(res.data)
      if (!nextAccessToken) {
        throw new Error("Refresh response did not include an access token")
      }
      currentAccessToken = nextAccessToken
      return nextAccessToken
    })
    .catch(async () => {
      await logout()
      return null
    })
    .finally(() => {
      refreshRequest = null
    })

  return refreshRequest
}

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  const accessToken = currentAccessToken || session?.accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    const nextAccessToken = await refreshAccessToken()

    if (!nextAccessToken) {
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
    return apiClient(originalRequest)
  }
)
