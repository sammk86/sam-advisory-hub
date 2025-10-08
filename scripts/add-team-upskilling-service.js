const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTeamUpskillingService() {
  try {
    console.log('Adding Team Upskilling & Training service...')

    // Create Team Upskilling & Training Service
    const teamUpskillingService = await prisma.service.create({
      data: {
        name: "Team Upskilling & Training",
        description: "Comprehensive team training programs designed to elevate your entire organization's technical capabilities and drive innovation through structured learning and development.",
        type: "ADVISORY",
        status: "PUBLISHED",
        oneOffPrice: null,
        hourlyRate: 30000, // $300/hour
        features: [
          "Customized curriculum development tailored to your team's needs",
          "Interactive workshops and hands-on training sessions",
          "Assessment and skill gap analysis for your entire team",
          "Multi-level training tracks (junior, mid, senior, leadership)",
          "Real-world project-based learning with immediate application",
          "Progress tracking and performance metrics dashboard",
          "Ongoing support and mentorship throughout the program",
          "Certification and credentialing for completed modules"
        ],
        benefits: [
          "Accelerated team productivity and technical competency",
          "Reduced time-to-market for new projects and features",
          "Improved code quality and development standards",
          "Enhanced team collaboration and knowledge sharing",
          "Increased employee retention and job satisfaction",
          "Better alignment with industry best practices and trends"
        ],
        process: [
          "Initial assessment to understand current skill levels and identify gaps",
          "Custom curriculum design based on team needs and business objectives",
          "Program delivery through workshops, mentoring, and hands-on projects",
          "Continuous evaluation and adjustment to ensure maximum impact"
        ],
        testimonials: [
          {
            name: "David Chen",
            quote: "Sam's team training program transformed our engineering team. We saw a 40% improvement in code quality and 60% faster delivery times within 3 months.",
            role: "VP of Engineering"
          },
          {
            name: "Maria Rodriguez",
            quote: "The structured approach to upskilling helped our team stay current with the latest technologies while maintaining our project timelines.",
            role: "Engineering Manager"
          }
        ]
      }
    })

    console.log('✅ Team Upskilling & Training service created successfully!')
    console.log('Service ID:', teamUpskillingService.id)

  } catch (error) {
    console.error('❌ Error creating service:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTeamUpskillingService()
