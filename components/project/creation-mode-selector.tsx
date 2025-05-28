"use client"

import React from "react"
import { CustomCard, CustomCardContent } from "@/components/ui/custom-card"
import { Zap, Edit3, ArrowRight } from "lucide-react"

interface CreationModeSelectorProps {
  onModeSelect: (mode: 'ai' | 'manual') => void
}

export function CreationModeSelector({ onModeSelect }: CreationModeSelectorProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Project</h1>
          <p className="text-lg text-gray-600">Choose how you'd like to create your project</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI-Generated Tasks Option */}
          <div 
            className="cursor-pointer"
            onClick={() => onModeSelect('ai')}
          >
            <CustomCard className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
              <CustomCardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Generated Tasks</h3>
                <p className="text-gray-600 mb-6">
                  Describe your project and let AI automatically generate a comprehensive task list with subtasks and structure.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Intelligent task breakdown</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Automatic subtask creation</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Smart project structure</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CustomCardContent>
            </CustomCard>
          </div>

          {/* Manual Creation Option */}
          <div 
            className="cursor-pointer"
            onClick={() => onModeSelect('manual')}
          >
            <CustomCard className="hover:shadow-lg transition-shadow border-2 hover:border-green-300">
            <CustomCardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manual Creation</h3>
              <p className="text-gray-600 mb-6">
                Start with a blank project and manually add tasks as you go. Perfect for custom workflows and specific requirements.
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Full control over structure</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Custom task organization</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Add tasks when needed</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CustomCardContent>
          </CustomCard>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Don't worry - you can always add more tasks or use AI to generate additional tasks later!
          </p>
        </div>
      </div>
    </div>
  )
}
