"use client"

import type React from "react"

// Override the protected layout for onboarding - no sidebar
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}

