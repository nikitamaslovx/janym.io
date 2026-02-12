"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/utils/cn"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        isDark ? "bg-primary" : "bg-input"
      )}
    >
      <span className="sr-only">Switch theme</span>
      <span
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-background shadow-lg ring-0 transition-transform",
          isDark ? "translate-x-5" : "translate-x-0.5"
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
            {isDark ? (
                <Moon className="h-3 w-3 text-foreground" />
            ) : (
                <Sun className="h-3 w-3 text-foreground" />
            )}
        </div>
      </span>
    </button>
  )
}
