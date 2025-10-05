"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

interface Blog {
  title: string;
  description: string;
  link: string;
  tags: string[];
}

const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => {
  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-all overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {blog.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {blog.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <a
            href={blog.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-primary to-accent-foreground hover:bg-slate-200 text-primary-foreground transition-all duration-200 gap-2 w-full hover:opacity-90"
          >
            <span>Read Article</span>
            <FaExternalLinkAlt className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

const BlogSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/data/blogs.md');
        const text = await response.text();
        parseContent(text);
      } catch (error) {
        console.error('Error loading blogs:', error);
        // Fallback data if markdown file is not available
        setBlogs([
          {
            title: "Building Scalable AI Solutions",
            description: "Learn how to design and implement AI solutions that can scale with your business needs.",
            link: "https://example.com/blog/scalable-ai",
            tags: ["AI", "Architecture", "Scalability"]
          },
          {
            title: "Data Engineering Best Practices",
            description: "Essential practices for building robust data pipelines and infrastructure.",
            link: "https://example.com/blog/data-engineering",
            tags: ["Data Engineering", "Best Practices", "Infrastructure"]
          },
          {
            title: "Cloud-Native AI Development",
            description: "How to leverage cloud platforms for AI development and deployment.",
            link: "https://example.com/blog/cloud-ai",
            tags: ["Cloud", "AI", "Development"]
          }
        ]);
      }
    };

    fetchContent();
  }, []);

  const parseContent = (text: string) => {
    const blogsList: Blog[] = [];
    let currentBlog: Partial<Blog> | null = null;

    text.split('\n').forEach(line => {
      if (line.startsWith('- **')) {
        if (currentBlog && currentBlog.title) {
          blogsList.push(currentBlog as Blog);
        }
        currentBlog = {
          title: line.replace('- **', '').replace('**', '').trim()
        };
      } else if (line.includes('link:')) {
        if (currentBlog) {
          currentBlog.link = line.split('link:')[1].trim();
        }
      } else if (line.includes('description:')) {
        if (currentBlog) {
          currentBlog.description = line.split('description:')[1].trim();
        }
      } else if (line.includes('tags:')) {
        if (currentBlog) {
          currentBlog.tags = line.split('tags:')[1]
            .trim()
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map(tag => tag.trim());
        }
      }
    });

    if (currentBlog && currentBlog.title) {
      blogsList.push(currentBlog as Blog);
    }

    setBlogs(blogsList.slice(0, 3)); // Only take top 3 blogs
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Latest Blogs</h2>
          <Link 
            href="/blogs"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <BlogCard key={index} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;