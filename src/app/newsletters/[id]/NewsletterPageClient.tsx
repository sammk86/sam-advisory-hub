"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/LoadingStates';
import Header from '@/components/landing/Header';

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

interface NewsletterPageClientProps {
  newsletterId: string;
}

export default function NewsletterPageClient({ newsletterId }: NewsletterPageClientProps) {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/newsletter/${newsletterId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch newsletter');
        }
        
        const data = await response.json();
        setNewsletter(data.data);
      } catch (error) {
        console.error('Error fetching newsletter:', error);
        setError('Failed to load newsletter');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [newsletterId]);

  const handleBackToList = () => {
    router.push('/newsletters');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    setSubscriptionMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        setSubscriptionMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setSubscriptionMessage('Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsletter?.title || 'Newsletter',
        text: newsletter?.subject || 'Check out this newsletter',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSubscriptionMessage('Link copied to clipboard!');
      setTimeout(() => setSubscriptionMessage(''), 3000);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center mt-24">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4">
            <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✉️</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center mb-4">Newsletter Not Found</h1>
          <p className="text-muted-foreground text-center mb-6">
            The newsletter you're looking for could not be found or may have been removed.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleBackToList}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Back to Archive
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-medium transition-colors"
          >
            <span>←</span>
            Back to Newsletter Archive
          </button>
        </div>

        {/* Subscribe Section */}
        <div className="bg-gradient-to-r from-card to-card/80 rounded-2xl p-8 mb-12 border border-border shadow-lg">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gradient-magenta-cyan mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8">
              Get the latest insights on AI architecture and innovation delivered to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {subscriptionMessage && (
              <p className={`mt-4 text-sm ${subscriptionMessage.includes('Thank you') ? 'text-green-400' : 'text-destructive'}`}>
                {subscriptionMessage}
              </p>
            )}
          </div>
        </div>

        {/* Professional Preview Card */}
        {newsletter && (
          <div className="mb-12">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400">
                    <img 
                      src="/images/4.png" 
                      alt="Dr. Sam Mokhtari" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Dr. Sam Mokhtari</h3>
                    <p className="text-slate-300 text-sm">Data & AI Expert | Mentor & Advisor</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  Newsletter
                </span>
                <h2 className="text-3xl font-bold text-gradient-magenta-cyan mb-4">
                  {newsletter.title}
                </h2>
                <p className="text-lg text-slate-300 mb-6">
                  {newsletter.subject}
                </p>
                <p className="text-sm text-slate-400">
                  {newsletter.sentAt ? `Published: ${new Date(newsletter.sentAt).toLocaleDateString()}` : `Created: ${new Date(newsletter.createdAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Content */}
        <article className="max-w-4xl mx-auto text-center">
          {/* Newsletter Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-magenta-cyan mb-4">
              {newsletter.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{new Date(newsletter.sentAt || newsletter.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </header>

          {/* Newsletter Content */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-12 overflow-hidden">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-secondary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-border"
              dangerouslySetInnerHTML={{ 
                __html: newsletter.content 
              }}
              style={{
                // Force consistent styling for embedded HTML content
                color: 'var(--foreground)',
                backgroundColor: 'var(--card)',
              }}
            />
          </div>
        </article>

        {/* Share Section */}
        <div className="mt-12 bg-gradient-to-r from-card/50 to-card/30 rounded-2xl p-8 border border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Share this Newsletter</h3>
            <p className="text-muted-foreground mb-6">
              Help others discover valuable insights by sharing this newsletter.
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <span>↗</span>
              Share Newsletter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
