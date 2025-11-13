"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicNavbar } from "@/components/public-navbar"

export default function SignUp() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Check if Supabase client is properly initialized
      if (!supabase) {
        setError("Authentication service is not available. Please check your configuration.")
        setIsLoading(false)
        return
      }

      // Validate environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        setError("Missing Supabase configuration. Please check your environment variables.")
        console.error("Missing env vars:", { url: !!supabaseUrl, key: !!supabaseKey })
        setIsLoading(false)
        return
      }

      const signUpPromise = supabase.auth.signUp({
        email,
        password,
      })
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout - please check your internet connection and Supabase URL')), 25000)
      )

      const result = await Promise.race([signUpPromise, timeoutPromise]) as any

      if (result.error) {
        console.error("Sign up error:", result.error)
        // Provide more helpful error messages
        if (result.error.message.includes("fetch")) {
          setError("Failed to connect to authentication service. Please check your Supabase configuration.")
        } else if (result.error.message.includes("email")) {
          setError(result.error.message)
        } else if (result.error.message.includes("password")) {
          setError(result.error.message)
        } else {
          setError(result.error.message || "Failed to create account. Please try again.")
        }
        return
      }

      setMessage("Account created successfully! Redirecting to sign in...")
      setTimeout(() => {
        router.push("/auth/sign-in")
      }, 1500)
    } catch (error) {
      console.error("Sign up exception:", error)
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          setError("Connection timeout. Please check your internet connection and Supabase URL.")
        } else if (error.message.includes("fetch")) {
          setError("Failed to connect to authentication service. Please verify your Supabase URL in .env.local")
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred. Please check the browser console for details.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up for Syntaxless</CardTitle>
            <CardDescription>Create an account to get started with Syntaxless</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
