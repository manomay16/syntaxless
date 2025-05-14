import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Pseudolang. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/about" className="text-sm font-medium hover:underline">
            About
          </Link>
          <Link href="/docs" className="text-sm font-medium hover:underline">
            Docs
          </Link>
          <Link
            href="https://github.com"
            className="text-sm font-medium hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}
