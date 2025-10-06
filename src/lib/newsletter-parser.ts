export interface Newsletter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  link: string;
}

export function parseNewslettersFromMarkdown(content: string): Newsletter[] {
  const newsletters: Newsletter[] = [];
  const lines = content.split('\n');
  
  let currentNewsletter: Partial<Newsletter> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and headers
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    // Check if this is a new newsletter entry (starts with "- **")
    if (line.startsWith('- **')) {
      // Save previous newsletter if it exists
      if (currentNewsletter.title && currentNewsletter.link) {
        newsletters.push(currentNewsletter as Newsletter);
      }
      
      // Start new newsletter entry
      currentNewsletter = {};
      
      // Extract title (remove "- **" and "**")
      const titleMatch = line.match(/- \*\*(.+?)\*\*/);
      if (titleMatch) {
        currentNewsletter.title = titleMatch[1];
      }
    }
    
    // Check for date
    else if (line.startsWith('date:')) {
      currentNewsletter.date = line.replace('date:', '').trim();
    }
    
    // Check for description
    else if (line.startsWith('description:')) {
      currentNewsletter.description = line.replace('description:', '').trim();
    }
    
    // Check for tags
    else if (line.startsWith('tags:')) {
      const tagsMatch = line.match(/tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        currentNewsletter.tags = tagsMatch[1]
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
    }
    
    // Check for link
    else if (line.startsWith('link:')) {
      currentNewsletter.link = line.replace('link:', '').trim();
    }
  }
  
  // Don't forget the last newsletter
  if (currentNewsletter.title && currentNewsletter.link) {
    newsletters.push(currentNewsletter as Newsletter);
  }
  
  return newsletters;
}

export async function fetchNewsletters(): Promise<Newsletter[]> {
  try {
    const response = await fetch('/data/newsletters.md');
    if (!response.ok) {
      throw new Error('Failed to fetch newsletters');
    }
    
    const content = await response.text();
    return parseNewslettersFromMarkdown(content);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return [];
  }
}

export function formatDate(dateString: string): string {
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
}
