"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, CheckSquare, PlusCircle, Home, FileText, History } from "lucide-react"
import { UserMenu } from "@/components/auth/user-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Projects", href: "/projects", icon: <CheckSquare className="h-5 w-5" /> },
    { name: "New Project", href: "/new-project", icon: <PlusCircle className="h-5 w-5" /> },
    { name: "Templates", href: "/templates", icon: <FileText className="h-5 w-5" /> },
    { name: "Version History", href: "/version-history", icon: <History className="h-5 w-5" /> },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">TaskAI</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.href)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <UserMenu />
            <div className="-mr-2 ml-4 flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-base font-medium ${
                isActive(item.href)
                  ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                  : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
