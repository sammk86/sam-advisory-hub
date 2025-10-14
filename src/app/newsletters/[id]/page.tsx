import { Metadata } from 'next';
import NewsletterPageClient from './NewsletterPageClient';

interface PageProps {
  params: { id: string };
}

// Generate metadata for the newsletter page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    // Await params to fix Next.js 15 async params issue
    const { id } = await params;
    
    // Fetch newsletter data to generate dynamic metadata
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/newsletter/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: 'Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        openGraph: {
          type: 'article',
          title: 'AI Newsletter | SamAdvisoryHub',
          description: 'Latest insights on AI architecture and innovation',
          images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
          siteName: 'SamAdvisoryHub',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'AI Newsletter | SamAdvisoryHub',
          description: 'Latest insights on AI architecture and innovation',
          images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
        },
      };
    }

    const data = await response.json();
    const newsletter = data.data?.newsletter;

    if (!newsletter) {
      return {
        title: 'Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        openGraph: {
          type: 'article',
          title: 'AI Newsletter | SamAdvisoryHub',
          description: 'Latest insights on AI architecture and innovation',
          images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
          siteName: 'SamAdvisoryHub',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'AI Newsletter | SamAdvisoryHub',
          description: 'Latest insights on AI architecture and innovation',
          images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
        },
      };
    }

    return {
      title: `${newsletter.title} | SamAdvisoryHub`,
      description: newsletter.subject,
      openGraph: {
        type: 'article',
        title: newsletter.title,
        description: newsletter.subject,
        images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
        url: `https://samadvisoryhub.com/newsletters/${id}`,
        siteName: 'SamAdvisoryHub',
        publishedTime: newsletter.sentAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: newsletter.title,
        description: newsletter.subject,
        images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Newsletter | SamAdvisoryHub',
      description: 'Latest insights on AI architecture and innovation',
      openGraph: {
        type: 'article',
        title: 'AI Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
        siteName: 'SamAdvisoryHub',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        images: ['https://samadvisoryhub.com/images/newsletter-og-preview.svg'],
      },
    };
  }
}

export default async function NewsletterPage({ params }: PageProps) {
  const { id } = await params;
  return <NewsletterPageClient newsletterId={id} />;
}