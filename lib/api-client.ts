import axios from "axios"
import { getSession } from "next-auth/react"

const baseURL = process.env.NEXT_PUBLIC_BASE_URL

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})
