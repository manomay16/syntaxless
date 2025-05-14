"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Save, Share, Download, MessageSquare, ArrowLeft } from "lucide-react"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { xcodeLight } from "@uiw/codemirror-theme-xcode"
import { useTheme } from "next-themes"

interface Project {
  id: string
  name: string
  code: string | null
  generated_code: string | null
}

export default function IDEPage() {
  const { projectId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [naturalLanguageCode, setNaturalLanguageCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [consoleOutput, setConsoleOutput] = useState("")
  const [clarifications, setClarifications] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId as string)
    }
  }, [projectId])

  async function fetchProject(id: string) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code, generated_code")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching project:", error)
        setError("Failed to load project")
        return
      }

      setProject(data)
      setNaturalLanguageCode(data.code || "")
      setGeneratedCode(data.generated_code || "")
    } catch (error) {
      console.error("Error fetching project:", error)
      setError("Failed to load project")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!project) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          code: naturalLanguageCode,
          generated_code: generatedCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) {
        console.error("Error saving project:", error)
        setError("Failed to save project")
        return
      }

      setSuccess("Project saved successfully")
    } catch (error) {
      console.error("Error saving project:", error)
      setError("Failed to save project")
    } finally {
      setIsSaving(false)
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000)
      }
    }
  }

  async function handleRun() {
    setIsRunning(true)
    setError(null)
    setConsoleOutput("")
    setClarifications([])

    try {
      // Mock API call to /api/translate
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: naturalLanguageCode,
          projectId: project?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to translate code")
      }

      const data = await response.json()

      // Set the generated code
      setGeneratedCode(data.generatedCode)

      // Set console output
      setConsoleOutput(data.output || "Code executed successfully!")

      // Set clarifications if any
      if (data.clarifications && data.clarifications.length > 0) {
        setClarifications(data.clarifications)
      }

      // Save the project with the new generated code
      await handleSave()
    } catch (error) {
      console.error("Error running code:", error)
      setError("Failed to run code")
      setConsoleOutput("Error: Failed to run code")
    } finally {
      setIsRunning(false)
    }
  }

  function handleDownload() {
    if (!generatedCode) return

    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project?.name || "code"}.py`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleShare() {
    if (!project) return

    // In a real app, this would generate a shareable link
    const shareableLink = `${window.location.origin}/ide/${project.id}`

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        setSuccess("Link copied to clipboard")
        setTimeout(() => setSuccess(null), 3000)
      })
      .catch(() => {
        setError("Failed to copy link")
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold mr-4">{project?.name || "Untitled Project"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning || !naturalLanguageCode}>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Translate and run your code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share your project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={!generatedCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download generated code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="m-2">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main IDE Area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Natural Language Editor */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full">
            <div className="p-2 border-b font-medium">Natural Language</div>
            <div className="flex-1 overflow-auto">
              <CodeMirror
                value={naturalLanguageCode}
                onChange={setNaturalLanguageCode}
                height="100%"
                theme={isDarkTheme ? vscodeDark : xcodeLight}
                placeholder="Write instructions in plain English…"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                }}
                className="text-foreground"
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Generated Code and Console */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            {/* Generated Code Panel */}
            <ResizablePanel defaultSize={70} minSize={30}>
              <div className="flex flex-col h-full">
                <div className="p-2 border-b font-medium">Generated Python Code</div>
                <div className="flex-1 overflow-auto">
                  <CodeMirror
                    value={generatedCode}
                    height="100%"
                    theme={isDarkTheme ? vscodeDark : xcodeLight}
                    extensions={[python()]}
                    readOnly={true}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: false,
                    }}
                    className="text-foreground"
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Console Output Panel */}
            <ResizablePanel defaultSize={30} minSize={20}>
              <Tabs defaultValue="console">
                <div className="flex items-center justify-between border-b p-2">
                  <TabsList>
                    <TabsTrigger value="console">Console</TabsTrigger>
                    <TabsTrigger value="clarifications">
                      Clarifications
                      {clarifications.length > 0 && (
                        <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                          {clarifications.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="console" className="p-0 h-full">
                  <div className="h-full bg-muted/30 p-4 font-mono text-sm overflow-auto">
                    {isRunning ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Running code...</span>
                      </div>
                    ) : consoleOutput ? (
                      <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                    ) : (
                      <div className="text-muted-foreground">
                        Console output will appear here after running your code.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="clarifications" className="p-0 h-full">
                  <div className="h-full overflow-auto">
                    {clarifications.length > 0 ? (
                      <div className="p-4 space-y-4">
                        {clarifications.map((clarification, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                            <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Clarification needed:</p>
                              <p className="text-muted-foreground">{clarification}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          When your code needs clarification, questions will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
