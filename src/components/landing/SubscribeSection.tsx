"use client";
import React, { useState } from "react";
import { FaEnvelope, FaCheck, FaArrowRight } from "react-icons/fa";

const SubscribeSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <section className="pt-24 pb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left side - Text */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Stay Updated with Latest Insights
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Get exclusive Data & AI insights, career tips, and industry trends delivered to your inbox.
              </p>
            </div>

            {/* Right side - Subscribe Form */}
            <div className="flex-shrink-0">
              {isSubmitted ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <FaCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Subscribed! Check your email.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="pl-10 pr-4 py-3 w-full sm:w-80 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-magenta-cyan hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>Subscribe</span>
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscribeSection;
