import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const BlogsPage = () => {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Blogs & Articles</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Explore my latest thoughts and insights on Data & AI, technology trends, and industry best practices.
          </p>
          
          <div className="space-y-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-3">
                Building Scalable AI Solutions: A Comprehensive Guide
              </h2>
              <p className="text-muted-foreground mb-4">
                Learn how to design and implement AI solutions that can scale with your business needs, from initial concept to production deployment.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">AI</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Architecture</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Scalability</span>
              </div>
              <a
                href="https://example.com/blog/scalable-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                Read Full Article →
              </a>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-3">
                Data Engineering Best Practices for Modern Organizations
              </h2>
              <p className="text-muted-foreground mb-4">
                Essential practices for building robust data pipelines and infrastructure that can handle the demands of modern analytics and AI workloads.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Data Engineering</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Best Practices</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Infrastructure</span>
              </div>
              <a
                href="https://example.com/blog/data-engineering"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                Read Full Article →
              </a>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-3">
                Cloud-Native AI Development: Leveraging Modern Platforms
              </h2>
              <p className="text-muted-foreground mb-4">
                How to leverage cloud platforms effectively for AI development and deployment, including cost optimization and performance considerations.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Cloud</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">AI</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Development</span>
              </div>
              <a
                href="https://example.com/blog/cloud-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                Read Full Article →
              </a>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-3">
                The Future of Data & AI: Trends to Watch in 2024
              </h2>
              <p className="text-muted-foreground mb-4">
                An analysis of emerging trends in data and AI technologies, and how they're shaping the future of business and technology.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Trends</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Future</span>
                <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">Analysis</span>
              </div>
              <a
                href="https://example.com/blog/future-trends"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                Read Full Article →
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default BlogsPage;
