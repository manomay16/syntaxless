"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Save, Share, Download, MessageSquare, ArrowLeft, ToggleLeft, ToggleRight, Code2 } from "lucide-react"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { javascript } from "@codemirror/lang-javascript"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { xcodeLight } from "@uiw/codemirror-theme-xcode"
import { useTheme } from "next-themes"

interface Project {
  id: string
  name: string
  code: string | null
  generated_code: string | null
}

const languages = [
  { value: "python", label: "Python", extension: python() },
  { value: "javascript", label: "JavaScript", extension: javascript() },
  { value: "java", label: "Java", extension: java() },
  { value: "cpp", label: "C++", extension: cpp() },
]

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
  const [selectedLanguage, setSelectedLanguage] = useState("python")
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(true)
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
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving project:", error)
      setError("Failed to save project")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRun() {
    setIsRunning(true)
    setError(null)
    setConsoleOutput("")        // clear old output
    setClarifications([])

    try {
      // 1️⃣ Translate NL → code
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: naturalLanguageCode,
          projectId: project?.id,
          language: selectedLanguage,
        }),
      })
      if (!translateRes.ok) throw new Error("Translation failed")
      const { generatedCode: newCode, clarifications: newClars } = await translateRes.json()
      setGeneratedCode(newCode)
      if (newClars?.length) setClarifications(newClars)

      // 2️⃣ Run the generated code
      const runRes = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, language: selectedLanguage }),
      })
      if (!runRes.ok) throw new Error("Execution failed")
      const runData = await runRes.json()

      // 3️⃣ Display real output or errors
      if (runData.success) {
        setConsoleOutput(runData.output)
      } else {
        setConsoleOutput(runData.output ?? runData.error ?? "Unknown execution error")
      }

      // 4️⃣ Switch to code view and auto-save
      setShowNaturalLanguage(false)
      await handleSave()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Run pipeline error")
      setConsoleOutput(`Error: ${err.message || "Something went wrong"}`)
    } finally {
      setIsRunning(false)
    }
  }

  function handleDownload() {
    if (!generatedCode) return

    const languageExtensions = {
      python: "py",
      javascript: "js",
      java: "java",
      cpp: "cpp",
    }

    const extension = languageExtensions[selectedLanguage as keyof typeof languageExtensions] || "txt"
    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project?.name || "code"}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleShare() {
    if (!project) return

    const shareableLink = `${window.location.origin}/ide/${project.id}`

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

  const currentLanguage = languages.find((lang) => lang.value === selectedLanguage)

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
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{project?.name || "Untitled Project"}</h1>

          {/* Language Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Language:</span>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

      {/* Main Code Area */}
      <div className="flex-1 flex flex-col">
        {/* Code Section Header with Toggle */}
        <div className="flex items-center justify-between border-b p-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {showNaturalLanguage ? "Natural Language" : `Generated ${currentLanguage?.label} Code`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNaturalLanguage(!showNaturalLanguage)}
            className="flex items-center gap-2"
          >
            {showNaturalLanguage ? (
              <>
                <Code2 className="h-4 w-4" />
                Show Generated Code
                <ToggleRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                Show Natural Language
                <MessageSquare className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto">
          {showNaturalLanguage ? (
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
              className="text-foreground h-full"
            />
          ) : (
            <CodeMirror
              value={generatedCode}
              height="100%"
              theme={isDarkTheme ? vscodeDark : xcodeLight}
              extensions={currentLanguage ? [currentLanguage.extension] : []}
              readOnly={true}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: false,
              }}
              className="text-foreground h-full"
            />
          )}
        </div>
      </div>

      {/* Bottom Console/Clarifications Section */}
      <div className="border-t bg-background" style={{ height: "200px" }}>
        <Tabs defaultValue="console" className="h-full flex flex-col">
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

          <TabsContent value="console" className="flex-1 p-0 m-0">
            <div className="h-full bg-muted/30 p-4 font-mono text-sm overflow-auto">
              {isRunning ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Running code...</span>
                </div>
              ) : consoleOutput ? (
                <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
              ) : (
                <div className="text-muted-foreground">Console output will appear here after running your code.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="clarifications" className="flex-1 p-0 m-0">
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
      </div>
    </div>
  )
}
