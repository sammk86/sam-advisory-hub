export interface BlogPost {
  title: string;
  link: string;
  description: string;
  tags: string[];
}

export function parseBlogsFromMarkdown(content: string): BlogPost[] {
  const blogs: BlogPost[] = [];
  const lines = content.split('\n');
  
  let currentBlog: Partial<BlogPost> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and headers
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    // Check if this is a new blog entry (starts with "- **")
    if (line.startsWith('- **')) {
      // Save previous blog if it exists
      if (currentBlog.title && currentBlog.link) {
        blogs.push(currentBlog as BlogPost);
      }
      
      // Start new blog entry
      currentBlog = {};
      
      // Extract title (remove "- **" and "**")
      const titleMatch = line.match(/- \*\*(.+?)\*\*/);
      if (titleMatch) {
        currentBlog.title = titleMatch[1];
      }
    }
    
    // Check for link
    else if (line.startsWith('link:')) {
      currentBlog.link = line.replace('link:', '').trim();
    }
    
    // Check for description
    else if (line.startsWith('description:')) {
      currentBlog.description = line.replace('description:', '').trim();
    }
    
    // Check for tags
    else if (line.startsWith('tags:')) {
      const tagsMatch = line.match(/tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        currentBlog.tags = tagsMatch[1]
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
    }
  }
  
  // Don't forget the last blog
  if (currentBlog.title && currentBlog.link) {
    blogs.push(currentBlog as BlogPost);
  }
  
  return blogs;
}

export async function fetchBlogs(): Promise<BlogPost[]> {
  try {
    const response = await fetch('/data/blogs.md');
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    const content = await response.text();
    return parseBlogsFromMarkdown(content);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}
