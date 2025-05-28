"use client"

import React, { useState, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { CreationModeSelector } from "@/components/project/creation-mode-selector"
import { AiCreationForm } from "@/components/project/ai-creation-form"
import { ManualCreationForm } from "@/components/project/manual-creation-form"

type CreationMode = 'selector' | 'ai' | 'manual'

function NewProjectFlow() {
  const [currentMode, setCurrentMode] = useState<CreationMode>('selector')

  const handleModeSelect = (mode: 'ai' | 'manual') => {
    setCurrentMode(mode)
  }

  const handleBack = () => {
    setCurrentMode('selector')
  }

  switch (currentMode) {
    case 'ai':
      return <AiCreationForm onBack={handleBack} />
    case 'manual':
      return <ManualCreationForm onBack={handleBack} />
    default:
      return <CreationModeSelector onModeSelect={handleModeSelect} />
  }
}

export default function NewProject() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      }
    >
      <NewProjectFlow />
    </Suspense>
  )
}
