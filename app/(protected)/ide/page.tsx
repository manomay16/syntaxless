"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, ArrowLeft } from "lucide-react"

export default function DefaultIDEPage() {
  const router = useRouter()
  const supabase = createClient()

  // Check if user has any projects and redirect to the first one
  useEffect(() => {
    async function checkForProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id")
          .order("updated_at", { ascending: false })
          .limit(1)

        if (error) {
          console.error("Error fetching projects:", error)
          return
        }

        if (data && data.length > 0) {
          router.push(`/ide/${data[0].id}`)
        }
      } catch (error) {
        console.error("Error checking for projects:", error)
      }
    }

    checkForProjects()
  }, [router, supabase])

  const handleCreateProject = () => {
    router.push("/dashboard?new=true")
  }

  return (
    <div className="container py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">No Project Selected</CardTitle>
          <CardDescription>Select an existing project or create a new one to start coding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You need to select a project to use the IDE. You can create a new project or go back to the dashboard to
            select an existing one.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleCreateProject}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
