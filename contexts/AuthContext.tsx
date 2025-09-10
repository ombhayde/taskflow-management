"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { authApi } from "@/lib/api"
import toast from "react-hot-toast"

interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get("token")
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authApi.getProfile()
      setUser(response.data.data.user)
    } catch (error) {
      Cookies.remove("token")
      setUser(null)
      toast.error("Session expired. Please login again.")
      // Redirect to login if currently on a protected route
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/register' && window.location.pathname !== '/') {
        router.push('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      const { user, token } = response.data.data

      Cookies.set("token", token, { expires: 7 })
      setUser(user)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed")
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password)
      const { user, token } = response.data.data

      Cookies.set("token", token, { expires: 7 })
      setUser(user)
      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed")
      throw error
    }
  }

  const logout = () => {
    Cookies.remove("token")
    setUser(null)
    toast.success("Logged out successfully")
    router.push("/auth/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
