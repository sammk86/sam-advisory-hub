import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
      case 'outline':
        return 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/80'
    }
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        getVariantClasses(variant),
        className
      )}
    >
      {children}
    </span>
  )
}
