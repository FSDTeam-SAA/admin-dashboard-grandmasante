import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken: string
    refreshToken?: string
    accessTokenExpires?: number
    role: string
    _id?: string
    user: {
      id?: string
      _id?: string
      name?: string | null
      email?: string | null
      role?: string
      status?: string
      avatar?: {
        url: string
      }
    }
  }

  interface User {
    id: string
    accessToken: string
    refreshToken?: string
    accessTokenExpires?: number
    role: string
    _id?: string
    user?: {
      _id: string
      name: string
      email: string
      role: string
      status: string
      avatar: {
        url: string
      }
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    refreshToken?: string
    accessTokenExpires?: number
    role: string
    id: string
    _id?: string
    user: any
  }
}
