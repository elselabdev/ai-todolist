"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardContent, CustomCardHeader, CustomCardTitle } from "@/components/ui/custom-card"
import { Loader2 } from "lucide-react"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl })
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <CustomCard className="w-full max-w-md">
        <CustomCardHeader className="text-center">
          <CustomCardTitle className="text-2xl">Sign In to TaskAI</CustomCardTitle>
        </CustomCardHeader>
        <CustomCardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error === "OAuthSignin" && "Error starting the sign in process. Please try again."}
              {error === "OAuthCallback" && "Error completing the sign in process. Please try again."}
              {error === "OAuthAccountNotLinked" && "This email is already associated with another account."}
              {error === "Callback" && "Error during the sign in callback. Please try again."}
              {!["OAuthSignin", "OAuthCallback", "OAuthAccountNotLinked", "Callback"].includes(error) &&
                "An error occurred during sign in. Please try again."}
            </div>
          )}

          <CustomButton
            onClick={handleGoogleSignIn}
            fullWidth
            disabled={isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
          </CustomButton>

          <div className="text-center text-sm text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CustomCardContent>
      </CustomCard>
    </div>
  )
}
