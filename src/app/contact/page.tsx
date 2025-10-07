'use client';

import React, { useState } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaEnvelope, FaLinkedin, FaYoutube } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the data to your API
      console.log('Form submitted:', formData);
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email',
      value: 'sam.mokhtari87@gmail.com',
      link: 'mailto:sam.mokhtari87@gmail.com'
    },
    {
      icon: FaLinkedin,
      title: 'LinkedIn',
      value: 'linkedin.com/in/sam-mokhtari-59b32971',
      link: 'https://www.linkedin.com/in/sam-mokhtari-59b32971/'
    },
    {
      icon: FaYoutube,
      title: 'YouTube',
      value: '@aiiwisdom',
      link: 'https://www.youtube.com/@aiiwisdom'
    },
    {
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
        </svg>
      ),
      title: 'Medium',
      value: '@sammokhtari',
      link: 'https://medium.com/@sammokhtari'
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Ready to transform your data and AI strategy? Let's discuss how I can help your organization 
              leverage cutting-edge technologies for competitive advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">Contact Information</h2>
              
              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.link}
                      target={info.link.startsWith('http') ? '_blank' : undefined}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition-all group"
                    >
                      <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{info.title}</h3>
                        <p className="text-muted-foreground">{info.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent-foreground/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Quick Response</h3>
                <p className="text-muted-foreground text-sm">
                  I typically respond to inquiries within 24 hours. For urgent matters, 
                  please mention "URGENT" in your subject line.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">Send a Message</h2>
              
              {isSubmitted ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Thank you for your message!</h3>
                  <p>I'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="mentoring">1:1 Mentoring</option>
                      <option value="consulting">Enterprise Consulting</option>
                      <option value="speaking">Speaking Engagement</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Tell me about your project, goals, or how I can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Response Time</h3>
                <p className="text-muted-foreground">Within 24 hours</p>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Availability</h3>
                <p className="text-muted-foreground">Monday - Friday</p>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Timezone</h3>
                <p className="text-muted-foreground">GMT+0 (UTC)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ContactPage;