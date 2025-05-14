"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  onMenuClick: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const pathname = usePathname()
  const [title, setTitle] = useState("Dashboard")

  useEffect(() => {
    if (pathname.startsWith("/dashboard")) {
      setTitle("Dashboard")
    } else if (pathname.startsWith("/ide")) {
      setTitle("IDE")
    } else if (pathname.startsWith("/learn")) {
      setTitle("Learn")
    } else if (pathname.startsWith("/settings")) {
      setTitle("Settings")
    }
  }, [pathname])

  return (
    <header
      className={cn("sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4")}
    >
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  )
}
