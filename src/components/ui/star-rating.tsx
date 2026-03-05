import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({ value, onChange, readonly = false, size = 'md', showLabel = false }: StarRatingProps) {
  const [hover, setHover] = React.useState<number | null>(null);

  const handleClick = (star: number) => {
    if (readonly) return;
    // Toggle off if clicking same star
    onChange?.(value === star ? null : star);
  };

  const displayValue = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(null)}
          className={cn(
            'transition-colors focus:outline-none',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              'transition-colors',
              star <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-muted-foreground/40'
            )}
          />
        </button>
      ))}
      {showLabel && value !== null && value !== undefined && value > 0 && (
        <span className="text-sm text-muted-foreground ml-1">{value}/5</span>
      )}
    </div>
  );
}

interface StarRatingDisplayProps {
  value: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRatingDisplay({ value, size = 'sm' }: StarRatingDisplayProps) {
  if (!value || value <= 0) return null;

  // Support fractional values for averages
  const fullStars = Math.floor(value);
  const fraction = value - fullStars;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            star <= fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : star === fullStars + 1 && fraction >= 0.5
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-transparent text-muted-foreground/30'
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value.toFixed(1)}</span>
    </div>
  );
}
