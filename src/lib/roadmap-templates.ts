export interface RoadmapTemplate {
  id: string
  name: string
  description: string
  serviceType: 'MENTORSHIP' | 'ADVISORY'
  milestones: Array<{
    title: string
    description: string
    tasks: Array<{
      title: string
      description: string
      resources: string[]
      dueDate?: string // Relative date like "+7d", "+2w", "+1m"
    }>
  }>
}

export const roadmapTemplates: RoadmapTemplate[] = [
  {
    id: 'mentorship-basic',
    name: 'Basic Mentorship Program',
    description: 'A comprehensive 3-month mentorship program covering foundational skills and career development',
    serviceType: 'MENTORSHIP',
    milestones: [
      {
        title: 'Foundation Phase',
        description: 'Build the foundation for your learning journey',
        tasks: [
          {
            title: 'Complete onboarding process',
            description: 'Review program materials and set up your learning environment',
            resources: [
              'https://example.com/onboarding-guide',
              'https://example.com/program-overview'
            ],
            dueDate: '+3d'
          },
          {
            title: 'Set learning goals',
            description: 'Define your specific learning objectives and career goals',
            resources: ['https://example.com/goal-setting-worksheet'],
            dueDate: '+1w'
          },
          {
            title: 'Initial mentor meeting',
            description: 'Meet with your assigned mentor to discuss your goals and create a learning plan',
            resources: ['https://example.com/mentor-meeting-prep'],
            dueDate: '+2w'
          }
        ]
      },
      {
        title: 'Development Phase',
        description: 'Focus on skill development and practical application',
        tasks: [
          {
            title: 'Complete skills assessment',
            description: 'Take the technical skills assessment to identify areas for improvement',
            resources: ['https://example.com/skills-assessment'],
            dueDate: '+1m'
          },
          {
            title: 'Attend weekly mentoring sessions',
            description: 'Participate in scheduled mentoring sessions with your assigned mentor',
            resources: ['https://example.com/mentoring-best-practices'],
            dueDate: '+2m'
          },
          {
            title: 'Complete assigned projects',
            description: 'Work on hands-on projects to apply your learning',
            resources: ['https://example.com/project-guidelines'],
            dueDate: '+2m'
          }
        ]
      },
      {
        title: 'Advanced Phase',
        description: 'Master advanced concepts and prepare for career advancement',
        tasks: [
          {
            title: 'Complete capstone project',
            description: 'Work on a comprehensive project that demonstrates your learning',
            resources: ['https://example.com/capstone-guidelines'],
            dueDate: '+3m'
          },
          {
            title: 'Prepare portfolio',
            description: 'Create a portfolio showcasing your work and achievements',
            resources: ['https://example.com/portfolio-templates'],
            dueDate: '+3m'
          },
          {
            title: 'Final presentation',
            description: 'Present your capstone project and learning journey',
            resources: ['https://example.com/presentation-tips'],
            dueDate: '+3m'
          }
        ]
      }
    ]
  },
  {
    id: 'mentorship-advanced',
    name: 'Advanced Mentorship Program',
    description: 'An intensive 6-month mentorship program for experienced professionals',
    serviceType: 'MENTORSHIP',
    milestones: [
      {
        title: 'Assessment & Planning',
        description: 'Comprehensive assessment and strategic planning phase',
        tasks: [
          {
            title: 'Complete advanced skills assessment',
            description: 'Take comprehensive assessment covering technical and leadership skills',
            resources: ['https://example.com/advanced-assessment'],
            dueDate: '+1w'
          },
          {
            title: 'Create leadership development plan',
            description: 'Develop a personalized leadership development roadmap',
            resources: ['https://example.com/leadership-framework'],
            dueDate: '+2w'
          }
        ]
      },
      {
        title: 'Leadership Development',
        description: 'Focus on leadership skills and team management',
        tasks: [
          {
            title: 'Complete leadership modules',
            description: 'Work through interactive leadership development modules',
            resources: ['https://example.com/leadership-modules'],
            dueDate: '+2m'
          },
          {
            title: 'Lead a team project',
            description: 'Take on a leadership role in a real-world project',
            resources: ['https://example.com/team-leadership-guide'],
            dueDate: '+3m'
          }
        ]
      },
      {
        title: 'Strategic Thinking',
        description: 'Develop strategic thinking and business acumen',
        tasks: [
          {
            title: 'Complete business strategy course',
            description: 'Learn strategic planning and business analysis',
            resources: ['https://example.com/strategy-course'],
            dueDate: '+4m'
          },
          {
            title: 'Develop strategic proposal',
            description: 'Create a strategic proposal for your organization',
            resources: ['https://example.com/proposal-templates'],
            dueDate: '+5m'
          }
        ]
      },
      {
        title: 'Implementation & Impact',
        description: 'Implement learnings and measure impact',
        tasks: [
          {
            title: 'Implement strategic initiative',
            description: 'Lead the implementation of your strategic proposal',
            resources: ['https://example.com/implementation-guide'],
            dueDate: '+6m'
          },
          {
            title: 'Measure and report impact',
            description: 'Analyze the impact of your strategic initiative',
            resources: ['https://example.com/impact-measurement'],
            dueDate: '+6m'
          }
        ]
      }
    ]
  },
  {
    id: 'advisory-business',
    name: 'Business Advisory Program',
    description: 'Comprehensive business advisory program for growth and optimization',
    serviceType: 'ADVISORY',
    milestones: [
      {
        title: 'Business Analysis',
        description: 'Comprehensive analysis of current business state',
        tasks: [
          {
            title: 'Complete business assessment',
            description: 'Conduct thorough analysis of business operations, finances, and market position',
            resources: ['https://example.com/business-assessment-tool'],
            dueDate: '+2w'
          },
          {
            title: 'Identify growth opportunities',
            description: 'Analyze market trends and identify potential growth areas',
            resources: ['https://example.com/market-analysis-framework'],
            dueDate: '+1m'
          }
        ]
      },
      {
        title: 'Strategic Planning',
        description: 'Develop comprehensive strategic plan',
        tasks: [
          {
            title: 'Create strategic roadmap',
            description: 'Develop detailed strategic roadmap with timelines and milestones',
            resources: ['https://example.com/strategic-planning-templates'],
            dueDate: '+2m'
          },
          {
            title: 'Define key performance indicators',
            description: 'Establish KPIs to measure success and progress',
            resources: ['https://example.com/kpi-framework'],
            dueDate: '+2m'
          }
        ]
      },
      {
        title: 'Implementation Support',
        description: 'Support implementation of strategic initiatives',
        tasks: [
          {
            title: 'Develop implementation plan',
            description: 'Create detailed implementation plan with resource allocation',
            resources: ['https://example.com/implementation-planning'],
            dueDate: '+3m'
          },
          {
            title: 'Monitor progress and adjust',
            description: 'Regular monitoring and adjustment of implementation strategy',
            resources: ['https://example.com/progress-monitoring'],
            dueDate: '+4m'
          }
        ]
      }
    ]
  },
  {
    id: 'advisory-tech',
    name: 'Technology Advisory Program',
    description: 'Technology strategy and digital transformation advisory',
    serviceType: 'ADVISORY',
    milestones: [
      {
        title: 'Technology Assessment',
        description: 'Evaluate current technology stack and infrastructure',
        tasks: [
          {
            title: 'Complete technology audit',
            description: 'Comprehensive review of current technology infrastructure and systems',
            resources: ['https://example.com/tech-audit-checklist'],
            dueDate: '+2w'
          },
          {
            title: 'Identify technology gaps',
            description: 'Identify areas where technology can improve business operations',
            resources: ['https://example.com/tech-gap-analysis'],
            dueDate: '+1m'
          }
        ]
      },
      {
        title: 'Digital Strategy',
        description: 'Develop digital transformation strategy',
        tasks: [
          {
            title: 'Create digital roadmap',
            description: 'Develop comprehensive digital transformation roadmap',
            resources: ['https://example.com/digital-transformation-guide'],
            dueDate: '+2m'
          },
          {
            title: 'Select technology solutions',
            description: 'Research and recommend appropriate technology solutions',
            resources: ['https://example.com/tech-solution-evaluation'],
            dueDate: '+2m'
          }
        ]
      },
      {
        title: 'Implementation Planning',
        description: 'Plan and prepare for technology implementation',
        tasks: [
          {
            title: 'Create implementation timeline',
            description: 'Develop detailed timeline for technology implementation',
            resources: ['https://example.com/implementation-timeline'],
            dueDate: '+3m'
          },
          {
            title: 'Prepare change management plan',
            description: 'Develop plan for managing organizational change',
            resources: ['https://example.com/change-management'],
            dueDate: '+3m'
          }
        ]
      }
    ]
  }
]

export function getTemplateById(id: string): RoadmapTemplate | undefined {
  return roadmapTemplates.find(template => template.id === id)
}

export function getTemplatesByServiceType(serviceType: 'MENTORSHIP' | 'ADVISORY'): RoadmapTemplate[] {
  return roadmapTemplates.filter(template => template.serviceType === serviceType)
}

export function convertTemplateToRoadmap(template: RoadmapTemplate, enrollmentId: string): any {
  const now = new Date()
  
  const parseRelativeDate = (relativeDate: string): Date => {
    const match = relativeDate.match(/^\+(\d+)([dwmy])$/)
    if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    const newDate = new Date(now)
    switch (unit) {
      case 'd': // days
        newDate.setDate(newDate.getDate() + value)
        break
      case 'w': // weeks
        newDate.setDate(newDate.getDate() + (value * 7))
        break
      case 'm': // months
        newDate.setMonth(newDate.getMonth() + value)
        break
      case 'y': // years
        newDate.setFullYear(newDate.getFullYear() + value)
        break
    }
    
    return newDate
  }

  return {
    enrollmentId,
    title: template.name,
    description: template.description,
    milestones: template.milestones.map((milestone, milestoneIndex) => ({
      title: milestone.title,
      description: milestone.description,
      order: milestoneIndex,
      status: 'NOT_STARTED',
      tasks: milestone.tasks.map((task, taskIndex) => ({
        title: task.title,
        description: task.description,
        resources: task.resources,
        dueDate: task.dueDate ? parseRelativeDate(task.dueDate).toISOString() : null,
        order: taskIndex,
        status: 'NOT_STARTED'
      }))
    }))
  }
}

