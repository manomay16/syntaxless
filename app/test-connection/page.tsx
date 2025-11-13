"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus("")
    setError("")

    try {
      // Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        setError("Environment variables are not set. Please check your .env.local file.")
        setLoading(false)
        return
      }

      setStatus("Environment variables found. Testing connection...")

      // Test Supabase client creation
      const supabase = createClient()
      setStatus("Supabase client created. Testing authentication endpoint...")

      // Test a simple auth operation
      const { data, error: authError } = await supabase.auth.getSession()

      if (authError) {
        setError(`Connection failed: ${authError.message}`)
        setStatus("")
      } else {
        setStatus("✅ Connection successful! Supabase is reachable.")
      }
    } catch (err: any) {
      setError(`Error: ${err.message || "Unknown error"}`)
      setStatus("")
      console.error("Connection test error:", err)
    } finally {
      setLoading(false)
    }
  }

  const testDirectFetch = async () => {
    setLoading(true)
    setStatus("")
    setError("")

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        setError("Environment variables are not set.")
        setLoading(false)
        return
      }

      setStatus("Testing direct fetch to Supabase...")

      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      })

      if (response.ok) {
        setStatus("✅ Direct fetch successful! Supabase is reachable.")
      } else {
        setError(`Direct fetch failed: ${response.status} ${response.statusText}`)
      }
    } catch (err: any) {
      setError(`Direct fetch error: ${err.message}`)
      console.error("Direct fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test your Supabase configuration and connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Environment Variables:</p>
            <div className="text-sm space-y-1">
              <div>
                URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <span className="text-green-600">✅ Set ({process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...)</span>
                ) : (
                  <span className="text-red-600">❌ Missing</span>
                )}
              </div>
              <div>
                Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <span className="text-green-600">✅ Set (length: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})</span>
                ) : (
                  <span className="text-red-600">❌ Missing</span>
                )}
              </div>
            </div>
          </div>

          {status && (
            <Alert>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? "Testing..." : "Test Supabase Client"}
            </Button>
            <Button onClick={testDirectFetch} disabled={loading} variant="outline">
              {loading ? "Testing..." : "Test Direct Fetch"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p className="font-medium">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>If environment variables are missing, create a <code>.env.local</code> file</li>
              <li>Make sure your Supabase URL starts with <code>https://</code> and ends with <code>.supabase.co</code></li>
              <li>Check that your Supabase project is active (not paused) in the dashboard</li>
              <li>Verify your anon key is correct in Supabase Dashboard → Settings → API</li>
              <li>Restart your dev server after changing <code>.env.local</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

