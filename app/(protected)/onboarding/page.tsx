"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  CodeIcon, 
  SparklesIcon, 
  PlayIcon, 
  PlusIcon, 
  FileCodeIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from "lucide-react"

interface OnboardingStep {
  title: string
  description: string
  content: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Syntaxless!",
      description: "Code in Plain English",
      icon: SparklesIcon,
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Transform Ideas into Code</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Syntaxless lets you write code using natural language. Just describe what you want,
              and our AI will translate it into working code in Python, JavaScript, Java, or C++.
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-6 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">No programming experience needed</p>
                <p className="text-sm text-muted-foreground">Write in plain English, learn as you code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Multiple languages supported</p>
                <p className="text-sm text-muted-foreground">Python, JavaScript, Java, and C++</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Run code instantly</p>
                <p className="text-sm text-muted-foreground">See results immediately in your browser</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Create Your First Project",
      description: "Start coding with a new project",
      icon: PlusIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                <PlusIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Step 1: Click "New Project"</h4>
                <p className="text-sm text-muted-foreground">
                  You'll find this button on the dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                <FileCodeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Step 2: Give it a name</h4>
                <p className="text-sm text-muted-foreground">
                  Choose any name you like for your project
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                <CodeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Step 3: Start coding</h4>
                <p className="text-sm text-muted-foreground">
                  You'll be taken to the IDE where you can start writing
                </p>
              </div>
            </div>
          </div>
          <div className="border-l-4 border-primary pl-4 space-y-1">
            <p className="text-sm font-medium">💡 Tip</p>
            <p className="text-sm text-muted-foreground">
              You can create as many projects as you want. Each project is saved automatically.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Write in Natural Language",
      description: "Describe what you want your code to do",
      icon: CodeIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-mono text-muted-foreground mb-2">Example:</p>
            <div className="space-y-2">
              <div className="bg-background rounded p-3 border border-border">
                <p className="text-sm font-medium mb-1">Your input (plain English):</p>
                <code className="text-sm">Print hello world to the console</code>
              </div>
              <div className="text-center text-muted-foreground">↓</div>
              <div className="bg-background rounded p-3 border border-border">
                <p className="text-sm font-medium mb-1">Generated code:</p>
                <code className="text-sm text-primary">print("hello world")</code>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">How it works:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Write instructions in plain English in the editor</p>
              <p>• Choose your target language (Python, JavaScript, Java, or C++)</p>
              <p>• Click "Translate" to generate code instantly</p>
              <p>• View the generated code and learn from it</p>
            </div>
          </div>
          <div className="border-l-4 border-primary pl-4 space-y-1">
            <p className="text-sm font-medium">💡 Tip</p>
            <p className="text-sm text-muted-foreground">
              Be specific in your instructions. For example, "print the first 10 even numbers" 
              is better than "print some numbers".
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Run Your Code",
      description: "Execute and see results instantly",
      icon: PlayIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <PlayIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Click the "Run" button</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Located in the top toolbar of the IDE
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <CodeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">View output</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Results appear in the console at the bottom of the screen
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Features:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Run code directly in your browser</p>
              <p>• See errors and debug messages</p>
              <p>• Code execution is sandboxed for safety</p>
              <p>• Automatic timeout protection for infinite loops</p>
            </div>
          </div>
          <div className="border-l-4 border-primary pl-4 space-y-1">
            <p className="text-sm font-medium">⚠️ Note</p>
            <p className="text-sm text-muted-foreground">
              If the AI needs clarification about your instructions, it will ask questions 
              before running the code. Answer them to get better results!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Switch Between Modes",
      description: "Code mode and Natural Language mode",
      icon: FileCodeIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">NL</span>
                </div>
                <div>
                  <h4 className="font-semibold">Natural Language Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Write in plain English, see generated code
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <CodeIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Code Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Write code directly, get natural language explanations
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Toggle anytime:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Switch between modes using the toggle in the IDE</p>
              <p>• Your content is preserved when switching</p>
              <p>• Learn by seeing both perspectives</p>
            </div>
          </div>
          <div className="border-l-4 border-primary pl-4 space-y-1">
            <p className="text-sm font-medium">💡 Tip</p>
            <p className="text-sm text-muted-foreground">
              Start in Natural Language mode to learn, then switch to Code mode as you get more comfortable!
            </p>
          </div>
        </div>
      ),
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding")
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      // Still redirect even if API call fails
      router.push("/dashboard")
    } finally {
      setIsCompleting(false)
    }
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6 min-h-[400px]">
          {currentStepData.content}
        </CardContent>
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? "Completing..." : "Get Started!"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

