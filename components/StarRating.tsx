'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex gap-1"
        role="group"
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoveredRating(value)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            disabled={readonly}
            className={cn(
              'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
              readonly ? 'cursor-default' : 'cursor-pointer',
              sizeClasses[size]
            )}
            aria-label={`${value} star${value !== 1 ? 's' : ''}`}
            aria-pressed={value <= displayRating}
          >
            <Star
              className={cn(
                sizeClasses[size],
                value <= displayRating
                  ? 'fill-warning text-warning'
                  : 'text-gray-300',
                !readonly && 'hover:scale-110 transition-transform'
              )}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-text-muted">
          {rating > 0 ? `${rating.toFixed(1)}` : 'No rating'}
        </span>
      )}
    </div>
  );
}

