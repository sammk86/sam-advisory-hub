"use client";
import React from 'react';

interface NewsletterPreviewCardProps {
  title: string;
  subject: string;
  publishedDate: string;
  authorName?: string;
  authorTitle?: string;
}

export default function NewsletterPreviewCard({
  title,
  subject,
  publishedDate,
  authorName = "Dr. Sam Mokhtari",
  authorTitle = "Data & AI Expert | Mentor & Advisor"
}: NewsletterPreviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl max-w-2xl mx-auto">
      {/* Header with branding */}
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
            <h3 className="text-white font-semibold text-lg">{authorName}</h3>
            <p className="text-slate-300 text-sm">{authorTitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">Newsletter</p>
          <p className="text-slate-300 text-sm">{formatDate(publishedDate)}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
          {title}
        </h1>
        <p className="text-slate-300 text-lg leading-relaxed">
          {subject}
        </p>
      </div>

      {/* AI/Data theme visual */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 mb-6 border border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-semibold">AI Insights</h4>
            <p className="text-slate-300 text-sm">Latest in Data & AI Innovation</p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300 text-sm">Live on SamAdvisoryHub</span>
        </div>
        <div className="flex space-x-2">
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
            <span className="text-white font-medium text-sm">Read Full Article</span>
          </div>
        </div>
      </div>

      {/* Footer branding */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-slate-400 text-sm">Powered by</span>
          <span className="text-cyan-400 font-semibold">SamAdvisoryHub</span>
        </div>
      </div>
    </div>
  );
}
