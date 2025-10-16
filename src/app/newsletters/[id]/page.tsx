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
    
    // Try to fetch newsletter data, but don't fail if it's not available during build
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/newsletter/${id}`, {
        cache: 'no-store',
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        const newsletter = data.data;

        if (newsletter) {
          return {
            title: `${newsletter.title} | SamAdvisoryHub`,
            description: newsletter.subject,
            openGraph: {
              type: 'article',
              title: newsletter.title,
              description: newsletter.subject,
              images: ['https://sammokhtari.com/images/newsletter-preview.png'],
              url: `https://sammokhtari.com/newsletters/${id}`,
              siteName: 'SamAdvisoryHub',
              publishedTime: newsletter.sentAt || newsletter.createdAt,
            },
            twitter: {
              card: 'summary_large_image',
              title: newsletter.title,
              description: newsletter.subject,
              images: ['https://sammokhtari.com/images/newsletter-preview.png'],
            },
          };
        }
      }
    } catch (fetchError) {
      console.warn('Could not fetch newsletter for metadata:', fetchError);
      // Continue with fallback metadata
    }

    // Fallback metadata when newsletter data is not available
    return {
      title: 'Newsletter | SamAdvisoryHub',
      description: 'Latest insights on AI architecture and innovation',
      openGraph: {
        type: 'article',
        title: 'AI Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        images: ['https://sammokhtari.com/images/newsletter-preview.png'],
        siteName: 'SamAdvisoryHub',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        images: ['https://sammokhtari.com/images/newsletter-preview.png'],
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
        images: ['https://sammokhtari.com/images/newsletter-preview.png'],
        siteName: 'SamAdvisoryHub',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI Newsletter | SamAdvisoryHub',
        description: 'Latest insights on AI architecture and innovation',
        images: ['https://sammokhtari.com/images/newsletter-preview.png'],
      },
    };
  }
}

export default async function NewsletterPage({ params }: PageProps) {
  const { id } = await params;
  return <NewsletterPageClient newsletterId={id} />;
}