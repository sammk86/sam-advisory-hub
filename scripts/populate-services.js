const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateServices() {
  try {
    console.log('Clearing existing services...')
    await prisma.service.deleteMany({})

    console.log('Creating sample services...')

    // Mentorship Service
    const mentorshipService = await prisma.service.create({
      data: {
        name: "1:1 Mentorship Program",
        description: "Personalized mentorship program designed to accelerate your career growth and technical expertise in data & AI.",
        type: "MENTORSHIP",
        status: "PUBLISHED",
        oneOffPrice: 15000, // $150 one-time
        hourlyRate: null,
        features: [
          "Personalized 1-on-1 sessions tailored to your goals",
          "Custom learning roadmap with milestone tracking",
          "Progress monitoring and regular feedback sessions",
          "Access to industry expert mentors and advisors",
          "Flexible scheduling to fit your busy lifestyle",
          "Comprehensive career development resources",
          "Networking opportunities with like-minded professionals",
          "Ongoing support and guidance throughout your journey"
        ],
        benefits: [
          "Accelerated career growth and skill development",
          "Increased confidence in professional decisions",
          "Expanded professional network and connections",
          "Better work-life balance and career satisfaction",
          "Higher earning potential and job opportunities",
          "Leadership skills and management capabilities"
        ],
        process: [
          "Initial consultation to discuss your goals, challenges, and expectations",
          "Customized approach based on your needs with a tailored strategy and timeline",
          "Implementation & support working together with ongoing guidance",
          "Results & growth tracking progress and celebrating achievements"
        ],
        testimonials: [
          {
            name: "Sarah Chen",
            quote: "Sam's mentorship transformed my career trajectory. His insights on data architecture helped me land my dream job.",
            role: "Data Engineer"
          },
          {
            name: "Alex Thompson",
            quote: "Professional, insightful, and results-driven. Sam's approach to career development is second to none.",
            role: "Product Manager"
          }
        ]
      }
    })

    // Advisory Service
    const advisoryService = await prisma.service.create({
      data: {
        name: "Strategic Advisory & Consulting",
        description: "Expert consultation on technical architecture, system design, and engineering team scaling strategies.",
        type: "ADVISORY",
        status: "PUBLISHED",
        oneOffPrice: null,
        hourlyRate: 25000, // $250/hour
        features: [
          "Strategic business guidance from experienced professionals",
          "Project-specific consulting for immediate impact",
          "Expert industry insights and market analysis",
          "Actionable recommendations with implementation support",
          "Results-driven approach with measurable outcomes",
          "Access to cutting-edge tools and methodologies",
          "Risk assessment and mitigation strategies",
          "Long-term strategic planning and roadmap development"
        ],
        benefits: [
          "Optimized business processes and operations",
          "Reduced risks and improved decision-making",
          "Enhanced competitive advantage in the market",
          "Increased revenue and profitability",
          "Better resource allocation and efficiency",
          "Strategic positioning for future growth"
        ],
        process: [
          "Initial consultation to understand your business challenges and objectives",
          "Comprehensive analysis of your current systems and processes",
          "Strategic recommendations with detailed implementation roadmap",
          "Ongoing support and guidance during implementation phase"
        ],
        testimonials: [
          {
            name: "Michael Rodriguez",
            quote: "The advisory sessions provided invaluable strategic guidance that saved our company months of trial and error.",
            role: "CTO"
          },
          {
            name: "Jennifer Liu",
            quote: "Sam's technical expertise and business acumen helped us scale our engineering team efficiently.",
            role: "VP Engineering"
          }
        ]
      }
    })

    console.log('✅ Services created successfully!')
    console.log('Mentorship Service ID:', mentorshipService.id)
    console.log('Advisory Service ID:', advisoryService.id)

  } catch (error) {
    console.error('❌ Error creating services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateServices()
