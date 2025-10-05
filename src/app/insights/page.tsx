import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaExternalLinkAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const InsightsPage = () => {
  const insights = [
    {
      title: "The Evolution of AI in Enterprise: From Experimentation to Production",
      excerpt: "Exploring how enterprises are moving beyond AI pilots to full-scale production deployments and the key factors driving this transformation.",
      content: "Artificial Intelligence has evolved from being a buzzword to becoming a core component of enterprise strategy. In this comprehensive analysis, we explore the journey from AI experimentation to production deployment...",
      date: "2024-01-15",
      readTime: "8 min read",
      category: "AI Strategy",
      tags: ["AI", "Enterprise", "Strategy", "Production"],
      featured: true
    },
    {
      title: "Data Governance in the Age of AI: Best Practices and Challenges",
      excerpt: "A deep dive into implementing effective data governance frameworks that support AI initiatives while ensuring compliance and security.",
      content: "As organizations increasingly rely on AI for decision-making, the importance of robust data governance cannot be overstated. This article examines the critical components of AI-ready data governance...",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Data Governance",
      tags: ["Data Governance", "AI", "Compliance", "Security"],
      featured: false
    },
    {
      title: "Building Resilient Data Pipelines for Real-Time Analytics",
      excerpt: "Technical insights on designing and implementing data pipelines that can handle the demands of real-time analytics and AI workloads.",
      content: "Real-time analytics requires robust, scalable data pipelines that can process high-velocity data streams. This technical guide covers the architecture patterns and technologies needed for building resilient pipelines...",
      date: "2024-01-05",
      readTime: "10 min read",
      category: "Data Engineering",
      tags: ["Data Engineering", "Real-time", "Analytics", "Architecture"],
      featured: false
    },
    {
      title: "The Future of Cloud-Native AI Development",
      excerpt: "Examining emerging trends in cloud-native AI development and how they're reshaping the way we build and deploy AI applications.",
      content: "Cloud-native approaches to AI development are revolutionizing how organizations build, deploy, and scale AI applications. This analysis looks at the key trends and technologies driving this transformation...",
      date: "2023-12-28",
      readTime: "7 min read",
      category: "Cloud Computing",
      tags: ["Cloud", "AI", "Development", "Trends"],
      featured: true
    },
    {
      title: "Ethical AI: Building Responsible AI Systems in Enterprise",
      excerpt: "A comprehensive guide to implementing ethical AI practices in enterprise environments, covering bias mitigation, transparency, and accountability.",
      content: "As AI becomes more pervasive in enterprise applications, ensuring ethical AI practices is crucial for maintaining trust and compliance. This guide explores the key principles and implementation strategies...",
      date: "2023-12-20",
      readTime: "9 min read",
      category: "AI Ethics",
      tags: ["AI Ethics", "Responsible AI", "Bias", "Transparency"],
      featured: false
    },
    {
      title: "Machine Learning Operations (MLOps): Streamlining AI Deployment",
      excerpt: "Best practices for implementing MLOps to streamline the deployment and management of machine learning models in production environments.",
      content: "MLOps has emerged as a critical discipline for organizations looking to scale their AI initiatives. This article covers the essential components and best practices for implementing effective MLOps...",
      date: "2023-12-15",
      readTime: "11 min read",
      category: "MLOps",
      tags: ["MLOps", "Deployment", "Operations", "Best Practices"],
      featured: false
    }
  ];

  const categories = ["All", "AI Strategy", "Data Governance", "Data Engineering", "Cloud Computing", "AI Ethics", "MLOps"];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Insights & Analysis</h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Deep-dive articles and analysis on Data & AI trends, technologies, and best practices. 
              Stay ahead of the curve with expert insights and practical guidance.
            </p>
          </div>

          {/* Featured Insights */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Featured Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {insights.filter(insight => insight.featured).map((insight, index) => (
                <article
                  key={index}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                        {insight.category}
                      </span>
                      <span className="text-muted-foreground text-sm">Featured</span>
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-3 line-clamp-2">
                      {insight.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {insight.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>{new Date(insight.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        <span>{insight.readTime}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {insight.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href={`/insights/${insight.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Read Full Article
                      <FaExternalLinkAlt className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* All Insights */}
          <section>
            <div className="flex flex-wrap gap-4 mb-8">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === "All"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {insights.map((insight, index) => (
                <article
                  key={index}
                  className="bg-card rounded-lg border border-border p-6 hover:border-primary transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                          {insight.category}
                        </span>
                        {insight.featured && (
                          <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-3">
                        {insight.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {insight.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {insight.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end gap-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{new Date(insight.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaUser className="w-3 h-3" />
                          <span>{insight.readTime}</span>
                        </div>
                      </div>
                      <a
                        href={`/insights/${insight.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Read Article
                        <FaExternalLinkAlt className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="mt-16">
            <div className="bg-gradient-to-r from-primary/10 to-accent-foreground/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Stay Updated with Latest Insights
              </h3>
              <p className="text-muted-foreground mb-6">
                Get the latest articles and analysis delivered directly to your inbox. 
                Join our community of data and AI professionals.
              </p>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium"
              >
                Subscribe to Newsletter
              </a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default InsightsPage;