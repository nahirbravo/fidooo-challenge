'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'default';
}

function SegmentedControlInner<T extends string>(
  { options, value, onValueChange, className, size = 'default' }: SegmentedControlProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      className={cn('segmented-warm', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onValueChange(option.value)}
          data-size={size}
          data-state={value === option.value ? 'checked' : 'unchecked'}
          className="segmented-warm-button"
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const SegmentedControl = forwardRef(SegmentedControlInner) as <
  T extends string,
>(
  props: SegmentedControlProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

(SegmentedControl as { displayName?: string }).displayName = 'SegmentedControl';
