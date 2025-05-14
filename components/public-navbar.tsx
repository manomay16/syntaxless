"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Pseudolang</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="block md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/auth/sign-in" className="text-sm font-medium hover:underline">
            Sign In
          </Link>
          <Button asChild>
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
          <ModeToggle />
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <div className="container py-4 flex flex-col gap-4">
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Button asChild className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
              <div className="flex justify-end">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
