"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import postmanApi from "@/lib/api/postman"
import { User } from "@/types"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: string) => Promise<void>
  register: (userData: {
    email: string;
    username?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("spotify_token")
      if (token) {
        try {
          const userData = await postmanApi.accounts.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error("Failed to get current user:", error)
          localStorage.removeItem("spotify_token")
          localStorage.removeItem("spotify_refresh_token")
          localStorage.removeItem("spotify_user")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Call the login API
      const { access, refresh } = await postmanApi.auth.login(email, password)

      // Save tokens
      localStorage.setItem("spotify_token", access)
      localStorage.setItem("spotify_refresh_token", refresh)

      // Get user data
      const userData = await postmanApi.accounts.getCurrentUser()

      // Save user data
      setUser(userData)
      localStorage.setItem("spotify_user", JSON.stringify(userData))

      // Redirect to admin or dashboard based on is_staff property
      if (userData.is_admin === true) {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login failed:", error)

      // Xử lý chi tiết các lỗi API
      if (error.response) {
        // Trường hợp API trả về response với status code
        const status = error.response.status

        if (status === 401) {
          throw new Error("No active account found with the given credentials")
        } else if (status === 404) {
          throw new Error("User not found")
        } else if (status === 400) {
          // Parse lỗi từ API nếu có
          try {
            const errorData = await error.response.json()
            if (errorData && errorData.detail) {
              throw new Error(errorData.detail)
            }
          } catch (parseError) {
            // Nếu không parse được JSON, trả về lỗi mặc định
            throw new Error("Invalid credentials")
          }
        }
      }

      // Trường hợp lỗi không xác định hoặc lỗi mạng
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithProvider = async (provider: string) => {
    setIsLoading(true)
    try {
      // Xác định URL OAuth dựa trên nhà cung cấp
      let authUrl = ""
      const redirectUri = encodeURIComponent(window.location.origin + "/auth/callback")

      switch (provider) {
        case "Google":
          authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login?redirect_uri=${redirectUri}`
          break
        case "Facebook":
          authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook/login?redirect_uri=${redirectUri}`
          break
        case "Apple":
          authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/apple/login?redirect_uri=${redirectUri}`
          break
        default:
          throw new Error(`Không hỗ trợ đăng nhập với ${provider}`)
      }

      // Mở cửa sổ popup cho đăng nhập OAuth
      const width = 600
      const height = 700
      const left = window.innerWidth / 2 - width / 2
      const top = window.innerHeight / 2 - height / 2

      const authWindow = window.open(
        authUrl,
        `Đăng nhập với ${provider}`,
        `width=${width},height=${height},top=${top},left=${left}`,
      )

      // Xử lý kết quả đăng nhập từ cửa sổ popup
      const checkAuthWindow = setInterval(async () => {
        if (authWindow && authWindow.closed) {
          clearInterval(checkAuthWindow)

          // Kiểm tra xem đã có token trong localStorage chưa
          const token = localStorage.getItem("spotify_token")
          if (token) {
            // Lấy thông tin người dùng
            try {
              const userData = await postmanApi.accounts.getCurrentUser()
              setUser(userData)
              localStorage.setItem("spotify_user", JSON.stringify(userData))

              // Chuyển hướng dựa trên vai trò
              if (userData.is_admin) {
                router.push("/admin")
              } else {
                router.push("/dashboard")
              }
            } catch (error) {
              console.error("Failed to get current user:", error)
              localStorage.removeItem("spotify_token")
              localStorage.removeItem("spotify_refresh_token")
              localStorage.removeItem("spotify_user")
            }
          } else {
            // Người dùng đã đóng cửa sổ mà không đăng nhập
            console.log(`Đăng nhập với ${provider} đã bị hủy`)
          }
        }
      }, 500)
    } catch (error) {
      console.error(`Đăng nhập với ${provider} thất bại:`, error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string;
    username?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
  }) => {
    setIsLoading(true)
    try {
      // Call the register API
      await postmanApi.auth.register(userData)

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("spotify_token")
    localStorage.removeItem("spotify_refresh_token")
    localStorage.removeItem("spotify_user")
    router.push("/")
  }

  const isAdmin = user?.is_admin === true
  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, loginWithProvider, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
