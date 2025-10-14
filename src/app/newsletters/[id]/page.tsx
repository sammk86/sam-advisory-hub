"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaEnvelope, FaCalendarAlt, FaUsers, FaCheck, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { LoadingPage } from '@/components/ui/LoadingStates';

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

const NewsletterPage = () => {
  const params = useParams();
  const router = useRouter();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadNewsletter(params.id as string);
    }
  }, [params.id]);

  const loadNewsletter = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/newsletter/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Newsletter not found');
        }
        throw new Error('Failed to fetch newsletter');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setNewsletter(data.data);
      } else {
        throw new Error('Failed to load newsletter');
      }
    } catch (error) {
      console.error('Error loading newsletter:', error);
      setError(error instanceof Error ? error.message : 'Failed to load newsletter. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubscribing(true);
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
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setIsSubscribing(false);
    }
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

  const handleBackToList = () => {
    router.push('/newsletters');
  };

  if (loading) {
    return (
      <LoadingPage
        title="Loading Newsletter..."
        description="Please wait while we fetch the newsletter content"
        showProgress={true}
        progress={75}
      />
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        
        <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md mx-auto">
              <FaEnvelope className="w-16 h-16 text-destructive mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-destructive mb-4">Newsletter Not Found</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button 
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Newsletters
              </button>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    );
  }

  if (!newsletter) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Newsletter Archive
          </button>
        </div>

        {/* Subscribe Section - Top of Page */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/20 rounded-full">
                <FaEnvelope className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Subscribe for More Insights
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8">
              Get the latest newsletters, articles, and insights on Data & AI delivered straight to your inbox. 
              Join our community of professionals transforming their careers and organizations.
            </p>

            {isSubmitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <FaCheck className="w-5 h-5" />
                  <span className="font-medium">Thank you for subscribing! Check your email for confirmation.</span>
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
                  disabled={isSubscribing}
                  className="px-6 py-3 bg-gradient-magenta-cyan hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>

        {/* Newsletter Content */}
        <article className="max-w-4xl mx-auto">
          {/* Newsletter Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaCalendarAlt className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Published on {formatDate(newsletter.sentAt)}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {newsletter.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FaUsers className="w-4 h-4" />
                <span>{newsletter.totalSent} subscribers</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="w-4 h-4" />
                <span>Published</span>
              </div>
            </div>
          </header>

          {/* Newsletter Content */}
          <div className="bg-card rounded-lg border border-border p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-h1:text-foreground prose-h2:text-foreground prose-h3:text-foreground prose-h4:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-accent-foreground prose-pre:bg-muted prose-blockquote:border-primary prose-blockquote:text-foreground prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
              dangerouslySetInnerHTML={{ __html: newsletter.content }}
            />
          </div>

          {/* Share Section */}
          <div className="mt-12 text-center">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Share this Newsletter</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: newsletter.title,
                        text: `Check out this newsletter: ${newsletter.title}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
      
      <Footer />
    </main>
  );
};

export default NewsletterPage;
