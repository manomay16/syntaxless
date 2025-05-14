"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, Code, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SampleProject } from "@/components/sample-project"

interface Project {
  id: string
  name: string
  updated_at: string
}

// Sample projects data
const sampleProjects = [
  {
    title: "Hello World",
    description: "A simple hello world program",
    code: "Print 'Hello, World!' to the console",
    generatedCode: "print('Hello, World!')",
  },
  {
    title: "Fibonacci Sequence",
    description: "Generate the Fibonacci sequence",
    code: "Generate the first 10 numbers in the Fibonacci sequence",
    generatedCode: `def fibonacci(n):
    """Generate the first n numbers in the Fibonacci sequence"""
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# Generate the first 10 Fibonacci numbers
fib_sequence = fibonacci(10)
print(f"First 10 Fibonacci numbers: {fib_sequence}")`,
  },
  {
    title: "Sorting Algorithm",
    description: "Sort an array of numbers",
    code: "Sort an array of numbers using bubble sort",
    generatedCode: `def bubble_sort(arr):
    """Sort an array using bubble sort algorithm"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers.copy())
print(f"Original array: {numbers}")
print(f"Sorted array: {sorted_numbers}")`,
  },
]

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("my-projects")

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, updated_at")
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching projects:", error)
        return
      }

      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProjectName.trim()) return

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
          name: newProjectName.trim(),
          user_id: userData.user.id,
          code: "",
          generated_code: "",
        })
        .select()

      if (error) {
        console.error("Error creating project:", error)
        return
      }

      if (data && data[0]) {
        setProjects([data[0], ...projects])
        setNewProjectName("")
        setIsDialogOpen(false)
        router.push(`/ide/${data[0].id}`)
      }
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  function handleProjectClick(id: string) {
    router.push(`/ide/${id}`)
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Give your project a name to get started.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="mt-2"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating || !newProjectName.trim()}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-24" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-4 w-1/2" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Create your first project to start coding in plain English
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <Code className="h-8 w-8" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sampleProjects.map((project, index) => (
              <SampleProject
                key={index}
                title={project.title}
                description={project.description}
                code={project.code}
                generatedCode={project.generatedCode}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
