"use client"

import type React from "react"

import { useState } from "react"
import { CustomButton } from "@/components/ui/custom-button"
import {
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomCardFooter,
} from "@/components/ui/custom-card"
import { CustomInput } from "@/components/ui/custom-input"
import { CustomTextarea } from "@/components/ui/custom-textarea"
import { Save, Loader2 } from "lucide-react"

export default function Settings() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [bio, setBio] = useState("Product manager with 5 years of experience.")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setSuccess("")
    setError("")

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSuccess("Profile updated successfully!")
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-8">
        <CustomCard>
          <form onSubmit={handleSubmit}>
            <CustomCardHeader>
              <CustomCardTitle>Profile Information</CustomCardTitle>
              <CustomCardDescription>Update your account profile information</CustomCardDescription>
            </CustomCardHeader>

            <CustomCardContent className="space-y-6">
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">{success}</div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
              )}

              <CustomInput label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />

              <CustomInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />

              <CustomTextarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                fullWidth
                hint="Brief description for your profile"
              />
            </CustomCardContent>

            <CustomCardFooter className="flex justify-end">
              <CustomButton
                type="submit"
                disabled={isLoading}
                icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </CustomButton>
            </CustomCardFooter>
          </form>
        </CustomCard>

        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Notification Preferences</CustomCardTitle>
            <CustomCardDescription>Manage how you receive notifications</CustomCardDescription>
          </CustomCardHeader>

          <CustomCardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-notifications"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-notifications" className="font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-gray-500">Receive email notifications when tasks are updated.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="project-updates"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="project-updates" className="font-medium text-gray-700">
                    Project Updates
                  </label>
                  <p className="text-gray-500">Receive notifications about project progress and updates.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketing"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="marketing" className="font-medium text-gray-700">
                    Marketing Communications
                  </label>
                  <p className="text-gray-500">Receive updates about new features and improvements.</p>
                </div>
              </div>
            </div>
          </CustomCardContent>

          <CustomCardFooter className="flex justify-end">
            <CustomButton>Save Preferences</CustomButton>
          </CustomCardFooter>
        </CustomCard>
      </div>
    </div>
  )
}
