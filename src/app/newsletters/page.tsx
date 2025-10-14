"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaEnvelope, FaExternalLinkAlt, FaCalendarAlt, FaCheck, FaUsers } from 'react-icons/fa';

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  textContent: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  sentAt: string | null;
  totalSent: number;
  createdAt: string;
}

interface NewsletterResponse {
  success: boolean;
  data: {
    newsletters: Newsletter[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const NewsletterCard: React.FC<{ newsletter: Newsletter; onReadMore: (newsletter: Newsletter) => void }> = ({ newsletter, onReadMore }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    // Remove HTML tags
    let textContent = content.replace(/<[^>]*>/g, '');
    
    // Remove CSS styling and other unwanted content
    textContent = textContent
      .replace(/body\s*\{[^}]*\}/g, '') // Remove body CSS rules
      .replace(/@media[^{]*\{[^}]*\}/g, '') // Remove media queries
      .replace(/[.#][a-zA-Z0-9_-]*\s*\{[^}]*\}/g, '') // Remove CSS class/id rules
      .replace(/margin:\s*[^;]*;/g, '') // Remove margin rules
      .replace(/padding:\s*[^;]*;/g, '') // Remove padding rules
      .replace(/-webkit-[^;]*;/g, '') // Remove webkit rules
      .replace(/-ms-[^;]*;/g, '') // Remove ms rules
      .replace(/font-[^;]*;/g, '') // Remove font rules
      .replace(/color:\s*[^;]*;/g, '') // Remove color rules
      .replace(/background[^;]*;/g, '') // Remove background rules
      .replace(/border[^;]*;/g, '') // Remove border rules
      .replace(/\{[^}]*\}/g, '') // Remove any remaining CSS blocks
      .replace(/View in browser/g, '') // Remove "View in browser" text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Find the actual newsletter content (skip the CSS and get to the real content)
    const contentMatch = textContent.match(/(Weekly AI Intelligence Brief|SamAdvisoryHub|This week's AI landscape)/i);
    if (contentMatch) {
      const startIndex = textContent.indexOf(contentMatch[0]);
      textContent = textContent.substring(startIndex);
    }
    
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  const displayDate = newsletter.sentAt || newsletter.createdAt;

  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-all overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <FaCalendarAlt className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {formatDate(displayDate)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-card-foreground mb-3">
          {newsletter.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 flex-grow">
          {truncateContent(newsletter.textContent || newsletter.content)}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FaCheck className="w-3 h-3" />
            <span>Published</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <button
            onClick={() => onReadMore(newsletter)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-magenta-cyan hover:opacity-90 text-white transition-all duration-200 gap-2 w-full"
          >
            <span>Read Newsletter</span>
            <FaExternalLinkAlt className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NewslettersPage = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadNewsletters();
  }, [pagination.page]);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/newsletter?page=${pagination.page}&limit=${pagination.limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch newsletters');
      }
      
      const data: NewsletterResponse = await response.json();
      if (data.success && data.data.newsletters) {
        setNewsletters(data.data.newsletters);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Failed to load newsletters');
      }
    } catch (error) {
      console.error('Error loading newsletters:', error);
      setError('Failed to load newsletters. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleReadMore = (newsletter: Newsletter) => {
    // Open newsletter in new tab
    window.open(`/newsletters/${newsletter.id}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <FaEnvelope className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Newsletter Archive
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Explore our latest newsletters covering Data & AI insights, technology trends, 
            and industry best practices. Stay updated with expert knowledge delivered to your inbox.
          </p>
        </div>

        {/* Subscription Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center mb-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Subscribe to Get Updates
            </h2>
            
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

        {/* Newsletter Archive */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Latest Newsletters ({pagination.total} total)
          </h2>
          
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
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={loadNewsletters}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : newsletters.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletters.map((newsletter) => (
                  <NewsletterCard key={newsletter.id} newsletter={newsletter} onReadMore={handleReadMore} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <FaEnvelope className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-4">No Newsletters Available</h3>
              <p className="text-muted-foreground">
                Check back later for new newsletters and insights.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default NewslettersPage;
