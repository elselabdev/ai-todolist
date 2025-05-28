"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Save, Loader2, Globe, Bot } from "lucide-react"

export default function Settings() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [bio, setBio] = useState("Product manager with 5 years of experience.")
  const [language, setLanguage] = useState("en")
  const [aiModel, setAiModel] = useState("gpt-4o")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("app-language")
    const savedAiModel = localStorage.getItem("ai-model")
    
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedAiModel) setAiModel(savedAiModel)
  }, [])

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    localStorage.setItem("app-language", newLanguage)
    setSuccess("Language preference saved!")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleAiModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value
    setAiModel(newModel)
    localStorage.setItem("ai-model", newModel)
    setSuccess("AI model preference saved!")
    setTimeout(() => setSuccess(""), 3000)
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
            <CustomCardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & AI Preferences
            </CustomCardTitle>
            <CustomCardDescription>Configure your language and AI model preferences</CustomCardDescription>
          </CustomCardHeader>

          <CustomCardContent className="space-y-6">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="it">Italiano (Italian)</option>
                <option value="pt">Português (Portuguese)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="tr">Türkçe (Turkish)</option>
                <option value="nl">Nederlands (Dutch)</option>
                <option value="sv">Svenska (Swedish)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select your preferred language for AI-generated content and task descriptions.
              </p>
            </div>

            <div>
              <label htmlFor="ai-model-select" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Model
              </label>
              <select
                id="ai-model-select"
                value={aiModel}
                onChange={handleAiModelChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gpt-4o">GPT-4o (Latest, Most Capable)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Fast, Cost-Effective)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo (High Performance)</option>
                <option value="gpt-4">GPT-4 (Standard)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Choose which AI model to use for task generation. GPT-4o is recommended for best results.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Model Comparison</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>GPT-4o:</strong> Latest model with best reasoning and creativity</div>
                <div><strong>GPT-4o Mini:</strong> Faster responses, lower cost, good for simple tasks</div>
                <div><strong>GPT-4 Turbo:</strong> High performance with large context window</div>
                <div><strong>GPT-4:</strong> Reliable standard model for general use</div>
              </div>
            </div>
          </CustomCardContent>
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
