"use client";
import React from "react";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

const MentoringSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Mentoring & Services</h2>
          <Link 
            href="/register"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border hover:border-primary transition-all p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">1:1 Mentoring Sessions</h3>
            <p className="text-muted-foreground mb-6">
              Get personalized guidance in Data & AI architecture, career growth, and technical leadership through structured 1:1 mentoring sessions tailored to your goals.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-primary to-accent-foreground hover:bg-slate-200 text-primary-foreground transition-all duration-200 gap-2 w-full hover:opacity-90"
            >
              <span>Start Mentorship</span>
            </Link>
          </div>

          <div className="bg-card rounded-lg border border-border hover:border-primary transition-all p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">Enterprise Consulting</h3>
            <p className="text-muted-foreground mb-6">
              Comprehensive data & AI strategy consulting for organizations looking to transform their business through advanced analytics and AI solutions.
            </p>
            <a
              href="mailto:sam.mokhtari87@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-primary to-accent-foreground hover:bg-slate-200 text-primary-foreground transition-all duration-200 gap-2 w-full hover:opacity-90"
            >
              <span>Contact for Consulting</span>
              <FaExternalLinkAlt className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-muted-foreground">Clients Served Globally</div>
          </div>
          
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="text-3xl font-bold text-primary mb-2">15+</div>
            <div className="text-muted-foreground">Years of Experience</div>
          </div>
          
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Successful Projects</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentoringSection;