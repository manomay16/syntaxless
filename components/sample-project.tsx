"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"

interface SampleProjectProps {
  title: string
  description: string
  code: string
  generatedCode: string
}

export function SampleProject({ title, description, code, generatedCode }: SampleProjectProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isCreating, setIsCreating] = useState(false)

  const createFromSample = async () => {
    setIsCreating(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("Error getting user:", userError)
        return
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: title,
          user_id: userData.user.id,
          code,
          generated_code: generatedCode,
        })
        .select()

      if (error) {
        console.error("Error creating project:", error)
        return
      }

      if (data && data[0]) {
        router.push(`/ide/${data[0].id}`)
      }
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
          <Code className="h-8 w-8" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={createFromSample} disabled={isCreating}>
          {isCreating ? "Creating..." : "Use Template"}
        </Button>
      </CardFooter>
    </Card>
  )
}
