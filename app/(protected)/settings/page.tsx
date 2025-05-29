"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("python")
  const [apiKey, setApiKey] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Error loading user:", userError)
          return
        }

        // Set email from auth
        setEmail(user.email || "")

        // Set display name from user metadata or email
        setDisplayName(user.user_metadata?.name || user.email?.split("@")[0] || "")

        // Set dark mode based on current theme
        setIsDarkMode(theme === "dark")

        // In a real app, you would load user preferences from a database
        // For now, we'll just use some defaults
        setTargetLanguage("python")
        setApiKey("sk-xxxxxxxxxxxxxxxxxxxx")
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [supabase, theme])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          name: displayName,
          preferences: {
            targetLanguage,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess("Profile updated successfully")
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsSaving(false)
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000)
      }
    }
  }

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked)
    setTheme(checked ? "dark" : "light")
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your profile information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                  <p className="text-sm text-muted-foreground">
                    Your email address is managed through your authentication provider.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-language">Target Language</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger id="target-language">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    The programming language your natural language will be translated to.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
                </div>
                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleThemeChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage your API keys and settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <Button variant="outline" onClick={() => setApiKey("")}>
                    Reset
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API key is used to authenticate requests to the Syntaxless API.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setSuccess("API settings saved successfully")
                  setTimeout(() => setSuccess(null), 3000)
                }}
              >
                Save API Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ) 
}
