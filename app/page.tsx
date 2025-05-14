import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNavbar } from "@/components/public-navbar"
import { Footer } from "@/components/footer"
import { CodeIcon, BrainIcon, SparklesIcon, ZapIcon } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Code in Plain English
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transform your natural language instructions into working code. No programming experience required.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="mt-4">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <CodeIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Write in Plain English</h3>
                <p className="text-muted-foreground">
                  Describe what you want your code to do in natural language, and let Pseudolang handle the rest.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <BrainIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Translation</h3>
                <p className="text-muted-foreground">
                  Our advanced AI translates your instructions into clean, efficient code in multiple languages.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <SparklesIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Learn as You Go</h3>
                <p className="text-muted-foreground">
                  See the code generated from your instructions and learn programming concepts naturally.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 p-3">
                  <ZapIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Instant Execution</h3>
                <p className="text-muted-foreground">
                  Run your code directly in the browser and see the results immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
