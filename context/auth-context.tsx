"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import postmanApi from "@/lib/api/postman"

type User = {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_image?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: string) => Promise<void>
  register: (userData: { email: string; username?: string; password?: string }) => Promise<void>
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

      // Redirect to home
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithProvider = async (provider: string) => {
    setIsLoading(true)
    try {
      // In a real app, you would implement OAuth login with the provider
      // For now, we'll just simulate it
      alert(`OAuth login with ${provider} would be implemented here`)

      // Redirect to home
      router.push("/dashboard")
    } catch (error) {
      console.error(`Login with ${provider} failed:`, error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: { email: string; username?: string; password?: string }) => {
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithProvider, register, logout }}>
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
