/**
 * Newsletter preview animation utilities
 */

export const NEWSLETTER_PREVIEW_ANIMATIONS = [
  'ai-brain',
  'neural-network', 
  'data-flow',
  'ai-robot'
] as const;

export type NewsletterPreviewAnimation = typeof NEWSLETTER_PREVIEW_ANIMATIONS[number];

/**
 * Get a random preview animation for a newsletter
 * Uses the newsletter ID to ensure consistent assignment
 */
export function getNewsletterPreviewAnimation(newsletterId: string): NewsletterPreviewAnimation {
  // Convert newsletter ID to a number for consistent random assignment
  const hash = newsletterId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % NEWSLETTER_PREVIEW_ANIMATIONS.length;
  return NEWSLETTER_PREVIEW_ANIMATIONS[index];
}

/**
 * Get the preview image URL for a newsletter
 */
export function getNewsletterPreviewUrl(newsletterId: string): string {
  const animation = getNewsletterPreviewAnimation(newsletterId);
  return `/animations/${animation}.json`;
}

/**
 * Get Open Graph image URL for social media sharing
 */
export function getNewsletterOgImageUrl(newsletterId: string): string {
  const animation = getNewsletterPreviewAnimation(newsletterId);
  // For now, we'll use the animation URL directly
  // In production, you might want to generate static images from these animations
  return `/animations/${animation}.json`;
}
