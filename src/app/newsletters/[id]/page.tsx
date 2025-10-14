"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import NewsletterPreviewCard from '@/components/newsletter/NewsletterPreviewCard';
import Head from 'next/head';
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
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-destructive rounded text-destructive-foreground flex items-center justify-center text-sm font-bold">!</div>
              </div>
              <h1 className="text-2xl font-bold text-destructive mb-4">Newsletter Not Found</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button 
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-lg font-medium transition-colors duration-200"
              >
                <span className="text-lg">←</span>
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
    <>
      <Head>
        <title>{newsletter ? `${newsletter.title} | SamAdvisoryHub` : 'Newsletter | SamAdvisoryHub'}</title>
        <meta name="description" content={newsletter ? newsletter.subject : 'Latest insights on AI architecture and innovation'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={newsletter ? newsletter.title : 'AI Newsletter | SamAdvisoryHub'} />
        <meta property="og:description" content={newsletter ? newsletter.subject : 'Latest insights on AI architecture and innovation'} />
        <meta property="og:image" content="https://samadvisoryhub.com/images/newsletter-og-preview.svg" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
        <meta property="og:site_name" content="SamAdvisoryHub" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={newsletter ? newsletter.title : 'AI Newsletter | SamAdvisoryHub'} />
        <meta name="twitter:description" content={newsletter ? newsletter.subject : 'Latest insights on AI architecture and innovation'} />
        <meta name="twitter:image" content="https://samadvisoryhub.com/images/newsletter-og-preview.svg" />
      </Head>
      
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
      
      <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-medium transition-colors"
          >
            <span className="text-lg">←</span>
            Back to Newsletter Archive
          </button>
        </div>

        {/* Subscribe Section - Website Styling */}
        <div className="bg-card rounded-2xl p-8 mb-12 border border-border shadow-lg">
          <div className="max-w-lg mx-auto text-center">
            {isSubmitted ? (
              <div className="bg-card border border-border text-foreground px-6 py-4 rounded-xl">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                  <span className="font-medium">Thank you for subscribing!</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Stay Updated</h3>
                <form onSubmit={handleSubscribe} className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to subscribe"
                    required
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Professional Preview Card */}
        {newsletter && (
          <div className="mb-12">
            <NewsletterPreviewCard
              title={newsletter.title}
              subject={newsletter.subject}
              publishedDate={newsletter.sentAt}
            />
          </div>
        )}

        {/* Newsletter Content */}
        <article className="max-w-4xl mx-auto text-center">
          {/* Newsletter Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-4 h-4 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">📅</span>
              <span className="text-sm text-muted-foreground">
                Published on {formatDate(newsletter.sentAt)}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              <span className="text-gradient-magenta-cyan">{newsletter.title}</span>
            </h1>
          </header>

          {/* Newsletter Content */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-12 overflow-hidden">
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:text-foreground prose-h1:text-foreground prose-h2:text-foreground prose-h3:text-foreground prose-h4:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-b:text-foreground
                prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border
                prose-blockquote:border-l-primary prose-blockquote:bg-muted prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:text-muted-foreground
                prose-li:text-muted-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-img:rounded-lg prose-img:shadow-md
                prose-table:text-sm prose-th:bg-muted prose-th:text-foreground prose-td:text-muted-foreground prose-td:border prose-td:border-border
                prose-hr:border-border
                [&_table]:bg-card [&_table]:border-border [&_table]:rounded-lg [&_table]:overflow-hidden
                [&_td]:bg-card [&_td]:border-border
                [&_tr]:bg-card
                [&_body]:bg-card
                [&_html]:bg-card
                [&_*]:!bg-card [&_*]:!color-foreground
                [&_.container]:bg-card
                [&_table[role='presentation']]:bg-card
                [&_table[role='presentation']_td]:bg-card"
              dangerouslySetInnerHTML={{ __html: newsletter.content }}
            />
          </div>

          {/* Share Section */}
          <div className="mt-12 text-center">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
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
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="w-4 h-4 bg-muted rounded flex items-center justify-center text-secondary text-xs">↗</span>
                  Share
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
      
      <Footer />
      </main>
    </>
  );
};

export default NewsletterPage;
