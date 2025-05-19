"use client"

import { useSearchParams } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardContent, CustomCardHeader, CustomCardTitle } from "@/components/ui/custom-card"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An unknown error occurred during authentication."

  if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration."
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to sign in."
  } else if (error === "Verification") {
    errorMessage = "The verification token has expired or has already been used."
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <CustomCard className="w-full max-w-md">
        <CustomCardHeader className="text-center">
          <CustomCardTitle className="text-2xl">Authentication Error</CustomCardTitle>
        </CustomCardHeader>
        <CustomCardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{errorMessage}</div>

          <div className="flex justify-center">
            <CustomButton href="/auth/signin">Try Again</CustomButton>
          </div>
        </CustomCardContent>
      </CustomCard>
    </div>
  )
}
