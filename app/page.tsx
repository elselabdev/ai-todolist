import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardContent } from "@/components/ui/custom-card"
import { CheckSquare, ArrowRight, Zap, List, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Manage Tasks with</span>
          <span className="block text-blue-600">AI Assistance</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          TaskAI helps you break down complex projects into manageable tasks using the power of artificial intelligence.
        </p>
        <div className="mt-8 flex justify-center">
          <CustomButton href="/new-project" size="lg" icon={<Zap className="h-5 w-5" />}>
            Create New Project
          </CustomButton>
          <CustomButton
            href="/projects"
            variant="outline"
            size="lg"
            className="ml-4"
            icon={<List className="h-5 w-5" />}
          >
            View Projects
          </CustomButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">How TaskAI Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <CustomCard className="h-full">
            <CustomCardContent>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Describe Your Project</h3>
                <p className="mt-2 text-gray-500">
                  Simply describe your project or goal in natural language, and our AI will understand what you need.
                </p>
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard className="h-full">
            <CustomCardContent>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">AI Task Generation</h3>
                <p className="mt-2 text-gray-500">
                  Our AI breaks down your project into manageable tasks and subtasks with a clear structure.
                </p>
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard className="h-full">
            <CustomCardContent>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Track Progress</h3>
                <p className="mt-2 text-gray-500">
                  Easily track your progress as you complete tasks and see your project come to life.
                </p>
              </div>
            </CustomCardContent>
          </CustomCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-12 sm:px-12 lg:flex lg:items-center lg:py-16">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Ready to get started?</h2>
            <p className="mt-3 max-w-3xl text-lg text-blue-100">
              Create your first AI-powered project and see how TaskAI can help you stay organized and productive.
            </p>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <CustomButton href="/new-project" variant="secondary" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
              Create Project Now
            </CustomButton>
          </div>
        </div>
      </section>
    </div>
  )
}
