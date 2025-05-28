"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Code, FileText, Terminal, Zap, CheckCircle } from "lucide-react"

// Mock data for tutorials
const tutorials = [
  {
    id: 1,
    title: "Getting Started with Syntaxless",
    description: "Learn the basics of using Syntaxless to write code in plain English.",
    progress: 100,
    icon: BookOpen,
    content: `
      <h2>Welcome to Syntaxless!</h2>
      <p>Syntaxless allows you to write code using plain English. This tutorial will guide you through the basics.</p>
      <h3>How it works:</h3>
      <ol>
        <li>Write instructions in natural language</li>
        <li>Syntaxless translates your instructions into code</li>
        <li>Review and run the generated code</li>
      </ol>
      <p>Let's get started with your first project!</p>
    `,
    completed: true,
  },
  {
    id: 2,
    title: "Writing Your First Program",
    description: "Create a simple program using natural language instructions.",
    progress: 75,
    icon: Code,
    content: `
      <h2>Writing Your First Program</h2>
      <p>Let's create a simple "Hello World" program using natural language.</p>
      <h3>Steps:</h3>
      <ol>
        <li>Create a new project from the dashboard</li>
        <li>In the natural language editor, type: "Print 'Hello, World!' to the console"</li>
        <li>Click the "Run" button to generate and execute the code</li>
      </ol>
      <p>The generated code will be displayed in the right panel, and the output will appear in the console below.</p>
    `,
    completed: false,
  },
  {
    id: 3,
    title: "Working with Data Structures",
    description: "Learn how to create and manipulate lists, dictionaries, and more.",
    progress: 50,
    icon: FileText,
    content: `
      <h2>Working with Data Structures</h2>
      <p>Syntaxless makes it easy to work with common data structures like lists and dictionaries.</p>
      <h3>Example: Creating a List</h3>
      <p>Try typing: "Create a list of fruits containing apple, banana, and orange, then print each fruit"</p>
      <h3>Example: Creating a Dictionary</h3>
      <p>Try typing: "Create a dictionary with names as keys and ages as values, then print all names and ages"</p>
    `,
    completed: false,
  },
  {
    id: 4,
    title: "Control Flow and Logic",
    description: "Master conditionals, loops, and logical operations in natural language.",
    progress: 25,
    icon: Terminal,
    content: `
      <h2>Control Flow and Logic</h2>
      <p>You can express complex logic and control flow using natural language.</p>
      <h3>Example: Conditionals</h3>
      <p>Try typing: "Create a variable age set to 18, then print 'Adult' if age is at least 18, otherwise print 'Minor'"</p>
      <h3>Example: Loops</h3>
      <p>Try typing: "Print the numbers from 1 to 10 using a loop"</p>
    `,
    completed: false,
  },
  {
    id: 5,
    title: "Advanced Techniques",
    description: "Explore more complex programming concepts with Syntaxless.",
    progress: 0,
    icon: Zap,
    content: `
      <h2>Advanced Techniques</h2>
      <p>Syntaxless can handle more complex programming concepts too!</p>
      <h3>Example: Functions</h3>
      <p>Try typing: "Create a function that calculates the factorial of a number, then calculate factorial of 5"</p>
      <h3>Example: File Operations</h3>
      <p>Try typing: "Write the text 'Hello, World!' to a file named 'output.txt', then read and print the contents"</p>
    `,
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
        <p className="text-muted-foreground">Explore tutorials to master coding with natural language.</p>
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
                <div className="h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  <span className="text-sm">Tutorial Content</span>
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
        <DialogContent className="sm:max-w-[425px]">
          {selectedTutorial && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTutorial.title}</DialogTitle>
                <DialogDescription>{selectedTutorial.description}</DialogDescription>
              </DialogHeader>
              <div className="tutorial-content" dangerouslySetInnerHTML={{ __html: selectedTutorial.content }} />
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
