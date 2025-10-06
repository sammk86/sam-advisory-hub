"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { fetchBlogs, BlogPost } from '@/lib/blog-parser';
import { FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const blogData = await fetchBlogs();
        setBlogs(blogData);
      } catch (error) {
        console.error('Error loading blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="container mt-24 mx-auto px-12 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-8">Blogs & Articles</h1>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-muted rounded-full"></div>
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                  </div>
                  <div className="h-4 w-32 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Blogs & Articles</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Explore my latest thoughts and insights on Data & AI, technology trends, and industry best practices.
          </p>
          
          {error && (
            <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {blogs.length > 0 ? (
            <div className="space-y-8">
              {blogs.map((blog, index) => (
                <div key={index} className="bg-card rounded-lg border border-border hover:border-primary transition-all p-6">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-3">
                    {blog.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {blog.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors gap-2"
                  >
                    <span>Read Full Article</span>
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : !error && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-4">No Blogs Available</h3>
              <p className="text-muted-foreground">
                Check back later for new blog posts and articles.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default BlogsPage;
