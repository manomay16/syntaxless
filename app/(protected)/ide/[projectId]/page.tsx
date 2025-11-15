'use client'

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Save, Share, Download, MessageSquare, ArrowLeft, ToggleLeft, ToggleRight, Code2 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
  coding_mode?: string | null
}

const languages = [
  { value: "python", label: "Python", extension: python() },
  { value: "javascript", label: "JavaScript", extension: javascript() },
  { value: "java", label: "Java", extension: java() },
  { value: "cpp", label: "C++", extension: cpp() },
]

function IDEPageContent() {
  const { projectId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get("demo") === "true"
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [naturalLanguageCode, setNaturalLanguageCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("python")
  const [codingMode, setCodingMode] = useState<"natural_language" | "code">("natural_language")
  const [showAlternateView, setShowAlternateView] = useState(false) // For toggling between main and alternate view
  const [isTranslating, setIsTranslating] = useState(false)
  const [isExplaining, setIsExplaining] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState("")
  const [clarifications, setClarifications] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      if (isDemoMode) {
        // In demo mode, create a demo project
        setProject({
          id: projectId as string,
          name: "Demo Project",
          code: "",
          generated_code: ""
        })
        setLoading(false)
      } else {
        fetchProject(projectId as string)
      }
    }
  }, [projectId, isDemoMode])

  // Clear clarifications when natural language code changes (user resolved them)
  useEffect(() => {
    if (codingMode === "natural_language" && naturalLanguageCode) {
      // Clear clarifications when user edits NL code (they're resolving the issues)
      setClarifications([])
    }
  }, [naturalLanguageCode, codingMode])

  // NOTE: Removed auto-generation of NL explanation to reduce API calls
  // Generation now only happens when user explicitly clicks to view alternate view

  async function fetchProject(id: string) {
    try {
      // Try to fetch with coding_mode, fallback if column doesn't exist
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code, generated_code, coding_mode")
        .eq("id", id)
        .single()

      if (error) {
        // If coding_mode column doesn't exist, try without it
        if (error.message?.includes("coding_mode")) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("projects")
            .select("id, name, code, generated_code")
            .eq("id", id)
            .single()
          
          if (fallbackError || !fallbackData) {
            console.error("Error fetching project:", fallbackError)
            setError("Failed to load project")
            return
          }
          
          // Use fallback data with default mode
          const projectData: Project = { ...fallbackData, coding_mode: "natural_language" }
          setProject(projectData)
          setCodingMode("natural_language")
          setNaturalLanguageCode(fallbackData.code || "")
          setGeneratedCode(fallbackData.generated_code || "")
        } else {
          console.error("Error fetching project:", error)
          setError("Failed to load project")
          return
        }
      } else if (data && typeof data === 'object' && 'id' in data) {
        const projectData = data as unknown as Project
        setProject(projectData)
        const mode = (projectData.coding_mode as "natural_language" | "code") || "natural_language"
        setCodingMode(mode)
        
        // Load content based on mode
        if (mode === "natural_language") {
          setNaturalLanguageCode(projectData.code || "")
          setGeneratedCode(projectData.generated_code || "")
        } else {
          // Code mode: generated_code is the source, code is the explanation
          setGeneratedCode(projectData.generated_code || "")
          setNaturalLanguageCode(projectData.code || "")
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      setError("Failed to load project")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!project) return

    // In demo mode, skip saving to database
    if (isDemoMode) {
      setSuccess("Demo mode - changes not saved")
      setTimeout(() => setSuccess(null), 3000)
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Save based on current mode
      const updateData: any = {
        coding_mode: codingMode,
        updated_at: new Date().toISOString(),
      }

      if (codingMode === "natural_language") {
        // NL mode: code is NL, generated_code is programming code
        updateData.code = naturalLanguageCode
        updateData.generated_code = generatedCode
      } else {
        // Code mode: generated_code is programming code, code is NL explanation
        updateData.generated_code = generatedCode
        updateData.code = naturalLanguageCode
      }

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", project.id)

      if (error) {
        // If coding_mode column doesn't exist, try saving without it
        if (error.message?.includes("coding_mode")) {
          const { code, generated_code, ...dataWithoutMode } = updateData
          const fallbackData = codingMode === "natural_language" 
            ? { code, generated_code }
            : { generated_code, code }
          
          const { error: fallbackError } = await supabase
            .from("projects")
            .update(fallbackData)
            .eq("id", project.id)
          
          if (fallbackError) {
            console.error("Error saving project:", fallbackError)
            setError("Failed to save project. Please run the database migration to enable mode switching.")
            return
          }
        } else {
          console.error("Error saving project:", error)
          setError("Failed to save project")
          return
        }
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
    setIsRunning(true);
    setError(null);
    setConsoleOutput("");
    setClarifications([]); // Clear old clarifications - we'll check for new ones

    try {
      let codeToRun = "";
      
      if (codingMode === "natural_language") {
        // 1️⃣ Translate NL → code
        const translateRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: naturalLanguageCode,
            projectId: project?.id,
            language: selectedLanguage,
          }),
        });
        if (!translateRes.ok) throw new Error("Translation failed");
        const { generatedCode: newCode, clarifications: newClars } = await translateRes.json();
        
        // Check for clarifications - don't run if they exist
        if (newClars?.length > 0) {
          setClarifications(newClars);
          setError("Please resolve all clarifications before running your code.");
          setIsRunning(false);
          return;
        }
        
        setGeneratedCode(newCode);
        codeToRun = newCode;
      } else {
        // Code mode: use the code directly
        codeToRun = generatedCode;
      }
      // 2️⃣ Cleanup prompt‐strings so they don't echo in the console
      const cleanedCode = codeToRun.replace(
        /input\s*\(\s*(['"`]).*?\1\s*\)/g,
        "input()"
      );

      // 3️⃣ Detect all input(...) calls
      const inputPrompts: string[] = [];
      const inputRe = /input\s*\(\s*(?:(['"`])(.*?)\1)?\s*\)/g;
      let m: RegExpExecArray | null;
      while ((m = inputRe.exec(codeToRun)) !== null) {
        inputPrompts.push(m[2] ?? "");
      }

      // 4️⃣ Prompt the user for each input() call
      const answers: string[] = [];
      for (const promptText of inputPrompts) {
        const question = promptText.trim() || "Enter program input:";
        const ans = window.prompt(question, "");
        if (ans === null) {
          setError("Run cancelled by user");
          setIsRunning(false);
          return;
        }
        answers.push(ans);
      }

      const stdin = answers.join("\n");

      // 5️⃣ Execute with stdin
      const runRes = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanedCode,
          language: selectedLanguage,
          input: stdin,
        }),
      });
      const runData = await runRes.json();
      if (runRes.ok && runData.success) {
        setConsoleOutput(runData.output);
      } else {
        setConsoleOutput(runData.output ?? runData.error ?? "Execution error");
      }

      // 5️⃣ Auto‐save
      await handleSave();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Run pipeline error");
      setConsoleOutput(`Error: ${err.message || "Something went wrong"}`);
    } finally {
      setIsRunning(false);
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

  // Handle mode switching with state preservation
  async function handleModeSwitch(newMode: "natural_language" | "code") {
    if (newMode === codingMode) return // Already in this mode

    setError(null)
    
    if (newMode === "code") {
      // Switching to Code mode: generate code from NL if needed
      // Only generate if we don't have code yet (don't regenerate on every switch)
      if (!generatedCode && naturalLanguageCode) {
        setIsTranslating(true)
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: naturalLanguageCode,
              projectId,
              language: selectedLanguage,
            }),
          })
          if (!res.ok) throw new Error("Translation failed")
          const { generatedCode: newCode } = await res.json()
          setGeneratedCode(newCode)
        } catch (err: any) {
          console.error(err)
          setError(err.message || "Translation failed")
          return
        } finally {
          setIsTranslating(false)
        }
      }
    }
    // NOTE: Removed auto-generation of NL when switching to NL mode
    // NL will only be generated when user explicitly clicks to view it
    
    setCodingMode(newMode)
    setShowAlternateView(false) // Reset view toggle
  }

  // Explain code in natural language (line-by-line)
  // Preserves existing natural language style if available
  async function handleExplainCode() {
    if (!generatedCode) return
    
    setIsExplaining(true)
    setError(null)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: generatedCode,
          language: selectedLanguage,
          existingNaturalLanguage: naturalLanguageCode, // Pass existing NL to preserve style
        }),
      })
      if (!res.ok) throw new Error("Explanation failed")
      const { naturalLanguage } = await res.json()
      setNaturalLanguageCode(naturalLanguage)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to explain code")
    } finally {
      setIsExplaining(false)
    }
  }

  // Toggle between main view and alternate view
  async function handleToggleView() {
    if (codingMode === "natural_language") {
      // NL mode: toggle to show generated code
      if (!showAlternateView && !generatedCode && naturalLanguageCode) {
        setIsTranslating(true)
        setError(null)
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: naturalLanguageCode,
              projectId,
              language: selectedLanguage,
            }),
          })
          if (!res.ok) throw new Error("Translation failed")
          const { generatedCode: newCode } = await res.json()
          setGeneratedCode(newCode)
        } catch (err: any) {
          console.error(err)
          setError(err.message || "Translation failed")
          return
        } finally {
          setIsTranslating(false)
        }
      }
    } else {
      // Code mode: toggle to show NL explanation
      // Always regenerate to ensure it matches current code
      if (!showAlternateView && generatedCode && generatedCode.trim()) {
        await handleExplainCode()
      }
    }
    setShowAlternateView(v => !v)
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

  const currentLanguage = languages.find((lang) => lang.value === selectedLanguage)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{project?.name || "Untitled Project"}</h1>
          {/* Mode Selection */}
          <ToggleGroup 
            type="single" 
            value={codingMode} 
            onValueChange={(value) => {
              if (value) handleModeSwitch(value as "natural_language" | "code")
            }}
            className="border rounded-md"
          >
            <ToggleGroupItem value="natural_language" aria-label="Natural Language">
              Natural Language
            </ToggleGroupItem>
            <ToggleGroupItem value="code" aria-label="Code">
              Code
            </ToggleGroupItem>
          </ToggleGroup>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRun} 
                  disabled={isRunning || (codingMode === "natural_language" && !naturalLanguageCode) || (codingMode === "code" && !generatedCode)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{codingMode === "natural_language" ? "Translate and run your code" : "Run your code"}</p>
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
              {codingMode === "natural_language" 
                ? (showAlternateView ? `Generated ${currentLanguage?.label} Code` : "Natural Language")
                : (showAlternateView ? "Natural Language Explanation" : `${currentLanguage?.label} Code`)
              }
            </span>
            {codingMode === "code" && isExplaining && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                Updating explanation...
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleView}
            disabled={isTranslating || isExplaining}
            className="flex items-center gap-2"
          >
            {codingMode === "natural_language" ? (
              showAlternateView ? (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Show Natural Language
                  <MessageSquare className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4" />
                  Show Generated Code
                  <ToggleRight className="h-4 w-4" />
                </>
              )
            ) : (
              showAlternateView ? (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Show Code
                  <Code2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Show Natural Language Explanation
                  <ToggleRight className="h-4 w-4" />
                </>
              )
            )}
          </Button>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto">
          {codingMode === "natural_language" ? (
            showAlternateView ? (
              <CodeMirror
                value={generatedCode}
                height="100%"
                theme={isDarkTheme ? vscodeDark : xcodeLight}
                extensions={currentLanguage ? [currentLanguage.extension] : []}
                readOnly
                basicSetup={{ lineNumbers: true, highlightActiveLine: false }}
                className="text-foreground h-full"
              />
            ) : (
              <CodeMirror
                value={naturalLanguageCode}
                onChange={setNaturalLanguageCode}
                height="100%"
                theme={isDarkTheme ? vscodeDark : xcodeLight}
                placeholder="Write instructions in plain English…"
                basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                className="text-foreground h-full"
              />
            )
          ) : (
            showAlternateView ? (
              <CodeMirror
                value={naturalLanguageCode}
                height="100%"
                theme={isDarkTheme ? vscodeDark : xcodeLight}
                readOnly
                basicSetup={{ lineNumbers: true, highlightActiveLine: false }}
                className="text-foreground h-full"
              />
            ) : (
              <CodeMirror
                value={generatedCode}
                onChange={setGeneratedCode}
                height="100%"
                theme={isDarkTheme ? vscodeDark : xcodeLight}
                extensions={currentLanguage ? [currentLanguage.extension] : []}
                placeholder={`Write ${currentLanguage?.label} code here...`}
                basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                className="text-foreground h-full"
              />
            )
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

export default function IDEPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading IDE...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    }>
      <IDEPageContent />
    </Suspense>
  )
}
