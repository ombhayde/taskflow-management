"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "react-query"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, 
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
