import Link from "next/link"
import { Home, Plus, Settings, FileText, History } from "lucide-react"

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/projects"
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        Projects
      </Link>
      <Link
        href="/templates"
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Templates
      </Link>
      <Link
        href="/new-project"
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Project
      </Link>
      <Link
        href="/version-history"
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
      >
        <History className="h-4 w-4" />
        Version History
      </Link>
      <Link
        href="/settings"
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </nav>
  )
} 