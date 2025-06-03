"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PublicNavbar } from "@/components/public-navbar"
import { Footer } from "@/components/footer"
import { Typewriter } from "@/components/ui/typewriter"
import MatrixRain from "@/components/ui/matrix-code"
import { CodeIcon, BrainIcon, SparklesIcon, ZapIcon } from "lucide-react"

export default function LandingPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render matrix effect until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-background to-muted py-20 md:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="space-y-4">
                  <h1 className="text-3xl font-mono font-bold tracking-wide sm:text-4xl md:text-5xl lg:text-6xl">
                    <span className="text-muted-foreground/60">{"//"}</span>{" "}
                    <span className="text-emerald-500 dark:text-emerald-400">code_in_plain_english()</span>
                  </h1>
                  <p className="mx-auto max-w-[700px] text-lg font-body text-muted-foreground md:text-xl">
                    Transform your natural language instructions into working code. No programming experience required.
                  </p>
                </div>
                <div className="space-x-4">
                  <Button asChild size="lg" className="mt-4 font-heading text-base px-8 py-3">
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {/* Hero Section with Matrix Background */}
        <section className="relative bg-gradient-to-b from-background to-muted py-20 md:py-32 overflow-hidden">
          {/* Matrix Rain Background */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <MatrixRain
              fontSize={16}
              color={isDark ? "#10b981" : "#059669"} // emerald-500 for dark, emerald-600 for light
              characters="01"
              fadeOpacity={isDark ? 0.05 : 0.08}
              speed={0.8}
            />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 container px-4 md:px-6 text-foreground">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-mono font-bold tracking-wide sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="text-muted-foreground/60">{"//"}</span>{" "}
                  <Typewriter
                    text={[
                      "code_in_plain_english()",
                      "write_code_naturally()",
                      "transform_ideas_to_code()",
                      "programming_made_simple()",
                    ]}
                    speed={100}
                    waitTime={2500}
                    deleteSpeed={60}
                    className="text-emerald-500 dark:text-emerald-400 drop-shadow-lg"
                    cursorChar="|"
                  />
                </h1>
                <p className="mx-auto max-w-[700px] text-lg font-body text-muted-foreground md:text-xl">
                  Transform your natural language instructions into working code. No programming experience required. Learn how to think like a coder.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  asChild
                  size="lg"
                  className="mt-4 font-heading text-base px-8 py-3 shadow-lg backdrop-blur-sm bg-primary/90 hover:bg-primary border border-primary/20"
                >
                  <Link href="/auth/sign-up">Get Started!</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-muted/80 pointer-events-none" />
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 relative z-10 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <CodeIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-heading">Write in Plain English</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Describe what you want your code to do in natural language, and let Syntaxless handle the rest.
                </p>
              </div>
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <BrainIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-heading">AI-Powered Translation</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Our advanced AI translates your instructions into clean, efficient code in multiple languages.
                </p>
              </div>
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <SparklesIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-heading">Learn as You Go</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  See the code generated from your instructions and learn programming concepts naturally.
                </p>
              </div>
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <ZapIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-heading">Instant Execution</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Run your code directly in the browser and see the results immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
