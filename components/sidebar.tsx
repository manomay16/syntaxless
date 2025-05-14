"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, LayoutDashboard, Code, BookOpen, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createClient()

  // Check for saved preference in localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === "true")
    }
  }, [])

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "IDE",
      href: "/ide",
      icon: Code,
    },
    {
      title: "Learn",
      href: "/learn",
      icon: BookOpen,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-14 items-center border-b px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          {!collapsed && <span className="text-xl font-bold">Pseudolang</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn("absolute right-2 top-3", collapsed && "rotate-180")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-accent text-accent-foreground"
                  : "transparent",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed && "h-6 w-6")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-2">
        <Button
          variant="ghost"
          className={cn("w-full justify-start", collapsed && "justify-center px-0")}
          onClick={handleSignOut}
        >
          <LogOut className={cn("h-5 w-5 mr-2", collapsed && "mr-0")} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  )
}
