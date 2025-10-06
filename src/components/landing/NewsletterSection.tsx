"use client";
import React, { useState, useEffect } from "react";
import { FaEnvelope, FaExternalLinkAlt, FaCalendarAlt, FaCheck } from "react-icons/fa";
import { fetchNewsletters, Newsletter, formatDate } from "@/lib/newsletter-parser";

const NewsletterCard: React.FC<{ newsletter: Newsletter }> = ({ newsletter }) => {
  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-all overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <FaCalendarAlt className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {formatDate(newsletter.date)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-card-foreground mb-3">
          {newsletter.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 flex-grow">
          {newsletter.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {newsletter.tags.map((tag, i) => (
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
            href={newsletter.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-magenta-cyan hover:opacity-90 text-white transition-all duration-200 gap-2 w-full"
          >
            <span>Read Newsletter</span>
            <FaExternalLinkAlt className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

const NewsletterSection = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadNewsletters = async () => {
      try {
        const newsletterData = await fetchNewsletters();
        setNewsletters(newsletterData.slice(0, 6)); // Show latest 6 newsletters
      } catch (error) {
        console.error('Error loading newsletters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNewsletters();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail("");
        setTimeout(() => setIsSubmitted(false), 3000);
      } else {
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  return (
    <section className="py-16" id="newsletter">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <FaEnvelope className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Newsletter & Insights
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl mx-auto">
            Stay updated with my latest insights on Data & AI, technology trends, and industry best practices. 
            Join thousands of professionals who receive my weekly newsletter.
          </p>
        </div>

        {/* Newsletter Archive */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Latest Newsletters
          </h3>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-3"></div>
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-muted rounded-full"></div>
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                  </div>
                  <div className="h-10 w-full bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map((newsletter, index) => (
                <NewsletterCard key={index} newsletter={newsletter} />
              ))}
            </div>
          )}
        </div>

        {/* Subscription Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Subscribe to Get Updates
            </h3>
            
            <p className="text-muted-foreground text-lg mb-8">
              Get the latest newsletters, articles, and insights on Data & AI delivered straight to your inbox. 
              Join our community of professionals transforming their careers and organizations.
            </p>

            {isSubmitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <FaCheck className="w-5 h-5" />
                  <span>Thank you for subscribing! Check your email for confirmation.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-magenta-cyan hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Subscribe
                </button>
              </form>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
