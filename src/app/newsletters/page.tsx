"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaEnvelope, FaExternalLinkAlt, FaCalendarAlt, FaCheck, FaUsers, FaTimes } from 'react-icons/fa';

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  textContent: string;
  sentAt: string;
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
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-all overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <FaCalendarAlt className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {formatDate(newsletter.sentAt)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-card-foreground mb-3">
          {newsletter.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 flex-grow">
          {truncateContent(newsletter.content)}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FaUsers className="w-3 h-3" />
            <span>{newsletter.totalSent} sent</span>
          </div>
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
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

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
    setSelectedNewsletter(newsletter);
  };

  const handleCloseModal = () => {
    setSelectedNewsletter(null);
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

      {/* Newsletter Modal */}
      {selectedNewsletter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="bg-black border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-black">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedNewsletter.title}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Sent on {formatDate(selectedNewsletter.sentAt)} to {selectedNewsletter.totalSent} subscribers
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-black">
              <div 
                className="prose prose-invert max-w-none text-white prose-headings:text-white prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-h4:text-white prose-p:text-gray-200 prose-a:text-primary prose-strong:text-white prose-code:text-accent-foreground prose-pre:bg-gray-900 prose-blockquote:border-primary prose-blockquote:text-gray-300 prose-li:text-gray-200 prose-ul:text-gray-200 prose-ol:text-gray-200"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'transparent'
                }}
                dangerouslySetInnerHTML={{ __html: selectedNewsletter.content }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default NewslettersPage;
