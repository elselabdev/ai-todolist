"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { CustomButton } from "@/components/ui/custom-button"
import { User, LogOut, Settings } from "lucide-react"

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse">
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (!session) {
    return (
      <CustomButton href="/auth/signin" variant="outline" size="sm">
        Sign In
      </CustomButton>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center focus:outline-none"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image || "/placeholder.svg"}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
        )}
        <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
          {session.user?.name?.split(" ")[0]}
        </span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
            </div>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
