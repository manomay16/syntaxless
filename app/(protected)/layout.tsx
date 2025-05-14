"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex flex-1 flex-col">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
