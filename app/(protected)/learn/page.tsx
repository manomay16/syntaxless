"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Code, FileText, Terminal, Zap, CheckCircle, Play } from "lucide-react"

// Mock data for tutorials with video URLs
const tutorials = [
  {
    id: 1,
    title: "Getting Started with Syntaxless",
    description: "Learn the basics of using Syntaxless to write code in plain English.",
    progress: 100,
    icon: BookOpen,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    duration: "5:30",
    completed: true,
  },
  {
    id: 2,
    title: "Writing Your First Program",
    description: "Create a simple program using natural language instructions.",
    progress: 75,
    icon: Code,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    duration: "8:45",
    completed: false,
  },
  {
    id: 3,
    title: "Working with Data Structures",
    description: "Learn how to create and manipulate lists, dictionaries, and more.",
    progress: 50,
    icon: FileText,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    duration: "12:20",
    completed: false,
  },
  {
    id: 4,
    title: "Control Flow and Logic",
    description: "Master conditionals, loops, and logical operations in natural language.",
    progress: 25,
    icon: Terminal,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    duration: "10:15",
    completed: false,
  },
  {
    id: 5,
    title: "Advanced Techniques",
    description: "Explore more complex programming concepts with Syntaxless.",
    progress: 0,
    icon: Zap,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    duration: "15:30",
    completed: false,
  },
]

export default function LearnPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<(typeof tutorials)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [completedTutorials, setCompletedTutorials] = useState<number[]>([1])

  const handleTutorialClick = (tutorial: (typeof tutorials)[0]) => {
    setSelectedTutorial(tutorial)
    setIsDialogOpen(true)
  }

  const handleCompleteTutorial = (id: number) => {
    if (!completedTutorials.includes(id)) {
      setCompletedTutorials([...completedTutorials, id])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Learn</h1>
        <p className="text-muted-foreground">Watch video tutorials to master coding with natural language.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => {
          const isCompleted = completedTutorials.includes(tutorial.id)
          return (
            <Card
              key={tutorial.id}
              className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleTutorialClick(tutorial)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <div className="flex items-center">
                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                    <tutorial.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <CardDescription>{tutorial.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground relative">
                  <Play className="h-8 w-8" />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{tutorial.progress}%</span>
                  </div>
                  <Progress value={tutorial.progress} className="h-2" />
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] sm:max-h-[600px]">
          {selectedTutorial && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTutorial.title}</DialogTitle>
                <DialogDescription>{selectedTutorial.description}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video w-full">
                <iframe
                  src={selectedTutorial.videoUrl}
                  title={selectedTutorial.title}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                {!selectedTutorial.completed && (
                  <Button onClick={() => handleCompleteTutorial(selectedTutorial.id)}>Mark as Complete</Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
