import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Image from 'next/image';

const AboutPage = () => {
  const skills = [
    'Data & AI Architecture',
    'Cloud Solutions (AWS, Azure, GCP)',
    'Machine Learning & Deep Learning',
    'Python, R, SQL',
    'Data Engineering',
    'AI Strategy & Consulting',
    'Project Management',
    'Team Leadership'
  ];

  const experience = [
    {
      title: 'Senior Data & AI Consultant',
      company: 'Independent Consulting',
      period: '2020 - Present',
      description: 'Providing strategic guidance and technical expertise to organizations worldwide in developing and implementing data & AI solutions.'
    },
    {
      title: 'Solutions Architect',
      company: 'Amazon Web Services (AWS)',
      period: '2018 - 2020',
      description: 'Led cloud architecture projects for enterprise clients, specializing in data analytics and machine learning solutions.'
    },
    {
      title: 'Senior Consultant',
      company: 'Deloitte',
      period: '2015 - 2018',
      description: 'Managed large-scale data transformation projects and provided strategic consulting on AI adoption and implementation.'
    },
    {
      title: 'Data Scientist',
      company: 'Various Organizations',
      period: '2008 - 2015',
      description: 'Developed and implemented machine learning models and data analytics solutions across various industries.'
    }
  ];

  const education = [
    {
      degree: 'PhD in Electrical and Electronics Engineering',
      institution: 'University of Technology',
      year: '2008'
    },
    {
      degree: 'Master of Science in Computer Science',
      institution: 'Technical University',
      year: '2005'
    },
    {
      degree: 'Bachelor of Engineering in Electrical Engineering',
      institution: 'Engineering College',
      year: '2003'
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground">SM</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Dr. Sam Mokhtari</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Data & AI Technology Leader | Consultant | Mentor
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              With over 15 years of experience in data and AI, I have a proven track record of designing and building cloud-native data & AI solutions for more than 100 clients globally across sectors such as financial services, aviation, health, and mining.
            </p>
          </div>

          {/* About Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">About Me</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                As a data and AI advisor, I assist organizations in developing robust AI strategies and solutions, ranging from initial concept to large-scale deployment. My expertise spans the full data and AI landscape, from strategy development and proof of concept to full-scale implementation.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                I have a strong background in software development, data analytics, and AI, with a PhD in Electrical and Electronics Engineering. I have also authored several publications and books on AI and cloud topics and delivered public speaking engagements at various events and conferences.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Previously, I worked at AWS and Deloitte, leading projects across the full data and AI landscape. My approach combines technical expertise with business acumen to deliver solutions that drive real value for organizations.
              </p>
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Core Competencies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-border p-4 text-center hover:border-primary transition-colors"
                >
                  <span className="text-card-foreground font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Experience Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Professional Experience</h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                    <h3 className="text-xl font-semibold text-card-foreground">{exp.title}</h3>
                    <span className="text-sm text-muted-foreground mt-1 md:mt-0">{exp.period}</span>
                  </div>
                  <h4 className="text-lg font-medium text-primary mb-2">{exp.company}</h4>
                  <p className="text-muted-foreground">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Education</h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-1">{edu.degree}</h3>
                      <h4 className="text-lg font-medium text-primary mb-2">{edu.institution}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1 md:mt-0">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Impact & Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-muted-foreground">Clients Served Globally</div>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground">Years of Experience</div>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Successful Projects</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-accent-foreground/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Transform Your Data & AI Strategy?
              </h3>
              <p className="text-muted-foreground mb-6">
                Let's discuss how I can help your organization leverage data and AI for competitive advantage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Start Mentorship
                </a>
                <a
                  href="mailto:sam.mokhtari87@gmail.com"
                  className="px-8 py-3 border border-border hover:bg-accent text-foreground rounded-lg font-medium transition-colors"
                >
                  Contact Me
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default AboutPage;