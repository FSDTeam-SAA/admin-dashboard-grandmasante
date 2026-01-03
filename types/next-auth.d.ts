import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken: string
    role: string
    _id: string
    user: {
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

  interface User {
    accessToken: string
    refreshToken: string
    role: string
    _id: string
    user: {
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
    role: string
    _id: string
    user: any
  }
}
