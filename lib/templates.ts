export interface ProjectTemplate {
  id: string
  title: string
  description: string
  aiPrompt: string
  category: 'personal' | 'work' | 'home' | 'education'
  icon: string // Lucide icon name
}

export const projectTemplates: ProjectTemplate[] = [
    {
        id: 'travel-planner',
        title: 'Trip Planner',
        description: 'Plan itineraries, bookings, and essentials for hassle-free travel.',
        category: 'personal',
        icon: 'Plane',
        aiPrompt: `Create a travel planning project that includes:
    - Destination research and itinerary drafting
    - Booking tasks (flights, accommodation, transport)
    - Budget tracking and expense logging
    - Packing checklist and documentation reminders
    - Daily activity scheduling with buffer time
    Include safety considerations and post-trip review tasks.`
      },
      {
        id: 'budget-planner',
        title: 'Budget Planner',
        description: 'Manage monthly income, expenses, and savings targets.',
        category: 'personal',
        icon: 'Wallet',
        aiPrompt: `Create a budgeting project with:
    - Income sources logging
    - Fixed and variable expense tracking
    - Savings and investment goals
    - Monthly reconciliation tasks
    Include quarterly financial reviews and adjustment checkpoints.`
      },
      {
        id: 'garden-maintenance',
        title: 'Garden Maintenance',
        description: 'Schedule and track gardening tasks for healthy plants.',
        category: 'home',
        icon: 'Leaf',
        aiPrompt: `Create a garden maintenance project that includes:
    - Seasonal planting and pruning tasks
    - Watering and fertilizing schedules
    - Pest and disease control checks
    - Tool and equipment upkeep
    Include harvest logs and soil health assessments.`
      },
      {
        id: 'product-launch',
        title: 'Product Launch Roadmap',
        description: 'Coordinate cross-functional tasks for a successful launch.',
        category: 'work',
        icon: 'Rocket',
        aiPrompt: `Create a product launch roadmap with:
    - Market research and positioning tasks
    - Feature freeze and QA checkpoints
    - Marketing collateral creation
    - Beta testing and feedback loops
    - Launch day checklist and communication plan
    Include post-launch performance review tasks.`
      },
      {
        id: 'career-development',
        title: 'Career Development Plan',
        description: 'Structure professional growth with clear objectives.',
        category: 'personal',
        icon: 'TrendingUp',
        aiPrompt: `Create a career development project including:
    - Skill-gap analysis and upskilling tasks
    - Certification or course enrollment tracking
    - Mentorship or networking sessions
    - Quarterly performance reflections
    Include measurable milestones and reward triggers.`
      },
      {
        id: 'language-learning',
        title: 'Language Learning Journey',
        description: 'Organize lessons, practice sessions, and progress tracking.',
        category: 'education',
        icon: 'Globe',
        aiPrompt: `Create a language learning project with:
    - Vocabulary and grammar modules
    - Daily speaking, listening, reading, and writing tasks
    - Conversation practice scheduling
    - Weekly quizzes and comprehension checks
    Include spaced-repetition review sessions.`
      },
      {
        id: 'event-planning',
        title: 'Event Planning Checklist',
        description: 'Plan and execute events with timelines and vendor coordination.',
        category: 'work',
        icon: 'CalendarCheck',
        aiPrompt: `Create an event planning project that includes:
    - Budget allocation and approval tasks
    - Venue and vendor selection with contract tracking
    - Marketing and attendee engagement tasks
    - Day-of logistics schedule
    Include contingency plans and post-event feedback collection.`
      },
      {
        id: 'self-care',
        title: 'Self-Care Routine',
        description: 'Maintain mental and physical well-being with scheduled activities.',
        category: 'personal',
        icon: 'HeartPulse',
        aiPrompt: `Create a self-care routine project including:
    - Daily mindfulness and relaxation practices
    - Weekly fitness and mobility sessions
    - Monthly health check-ins and goal reviews
    - Habit tracking and reflection notes
    Include flexibility for adjusting routines as needed.`
      },
    
    {
        id: 'pet-care',
        title: 'Pet Care Schedule',
        description: 'Routine tasks for feeding, grooming, and vet check-ups.',
        category: 'home',
        icon: 'Dog',
        aiPrompt: `Create a pet care project that includes:
    - Daily feeding and exercise logs
    - Weekly grooming tasks
    - Monthly preventative treatments
    - Vet appointment reminders
    Include supplies inventory tracking and training sessions.`
      },
      {
        id: 'agile-sprint',
        title: 'Agile Sprint Board',
        description: 'Organize sprint backlog, tasks, and reviews.',
        category: 'work',
        icon: 'Kanban',
        aiPrompt: `Create an agile sprint project with:
    - Sprint planning tasks
    - Task breakdown into user stories
    - Daily stand-up checkpoints
    - Mid-sprint review and adjustment
    - Sprint retrospective tasks
    Include definition of done and acceptance criteria tracking.`
      },
      {
        id: 'wedding-planning',
        title: 'Wedding Planning Checklist',
        description: 'Coordinate vendors, guests, and timelines for your wedding.',
        category: 'personal',
        icon: 'Diamond',
        aiPrompt: `Create a wedding planning project that includes:
    - Budget allocation and tracking
    - Venue and vendor selection tasks
    - Guest list management
    - Ceremony and reception timelines
    - Post-wedding follow-up
    Include contingency plans and deposit payment reminders.`
      },
      {
        id: 'writing-project',
        title: 'Writing Project',
        description: 'Structure outlines, drafts, and revision milestones for writing.',
        category: 'education',
        icon: 'Feather',
        aiPrompt: `Create a writing project that includes:
    - Outline and research tasks
    - Drafting schedule
    - Peer review or editor feedback loops
    - Revision checkpoints
    - Submission or publication tasks
    Include word count targets and deadline tracking.`
      },
      {
        id: 'habit-builder',
        title: 'Habit Builder',
        description: 'Develop and track new habits with daily checkpoints.',
        category: 'personal',
        icon: 'Repeat',
        aiPrompt: `Create a habit building project with:
    - Habit definition and motivation logging
    - Daily completion tracking
    - Weekly progress reviews
    - Habit stacking suggestions
    Include milestone rewards and reflection prompts.`
      },
      {
        id: 'emergency-preparedness',
        title: 'Emergency Preparedness Plan',
        description: 'Organize supplies, contacts, and procedures for emergencies.',
        category: 'home',
        icon: 'AlertTriangle',
        aiPrompt: `Create an emergency preparedness project that includes:
    - Risk assessment and plan development
    - Supply kit inventory and rotation tasks
    - Emergency contact list management
    - Evacuation and shelter-in-place drills
    Include periodic review and update reminders.`
      },
      {
        id: 'online-course',
        title: 'Online Course Creation',
        description: 'Plan curriculum, content production, and launch of an online course.',
        category: 'work',
        icon: 'Laptop',
        aiPrompt: `Create an online course creation project with:
    - Course outline and learning objectives
    - Content script writing and slide creation
    - Video recording and editing tasks
    - Platform setup and upload steps
    - Marketing and launch timeline
    Include student feedback collection and iterative improvements.`
      },
      {
        id: 'portfolio-update',
        title: 'Portfolio Refresh',
        description: 'Update and refine your professional portfolio.',
        category: 'personal',
        icon: 'Folder',
        aiPrompt: `Create a portfolio refresh project including:
    - Content audit and outdated item removal
    - New project description drafting
    - Design and layout enhancement tasks
    - Proofreading and quality checks
    - Deployment and promotion
    Include SEO optimization and periodic review checkpoints.`
      }
    
] 