"use client";
import React, { useEffect } from "react";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const CalendarPage = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mx-auto px-12 py-4">
        <div className="py-12">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Schedule a Meeting</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Book a consultation session to discuss your data & AI strategy, mentorship needs, or project requirements. 
              Choose a time that works best for you.
            </p>
          </div>

          {/* Calendly inline widget */}
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/sam-mokhtari87/meet-with-sam"
            style={{ minWidth: "320px", height: "700px" }}
          />

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Flexible Scheduling</h3>
              <p className="text-muted-foreground text-sm">
                Book sessions at your convenience with flexible time slots available across different time zones.
              </p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Prepared Sessions</h3>
              <p className="text-muted-foreground text-sm">
                Come prepared with your questions and goals to make the most of our time together.
              </p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Actionable Insights</h3>
              <p className="text-muted-foreground text-sm">
                Walk away with concrete next steps and actionable strategies for your data & AI initiatives.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-accent-foreground/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Need Immediate Assistance?
              </h3>
              <p className="text-muted-foreground mb-6">
                For urgent matters or if you can't find a suitable time slot, feel free to reach out directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:sam.mokhtari87@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default CalendarPage;