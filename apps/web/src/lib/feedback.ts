import { createElement, type ReactNode } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  HAPTIC_SUCCESS_MS,
  HAPTIC_ERROR_PATTERN,
  TOAST_DURATION_SUCCESS,
  TOAST_DURATION_ERROR,
} from '@fidooo/shared';

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function makeIcon(
  Component: typeof Check,
  className: string,
): ReactNode {
  return createElement(Component, {
    className: `size-4 ${className}`,
    strokeWidth: 2,
    'aria-hidden': true,
  });
}

const successIcon = makeIcon(Check, 'text-success');
const errorIcon = makeIcon(AlertCircle, 'text-destructive');
const infoIcon = makeIcon(Info, 'text-muted-foreground');

export const feedback = {
  success(message: string): void {
    toast.success(message, {
      duration: TOAST_DURATION_SUCCESS,
      icon: successIcon,
    });
    vibrate(HAPTIC_SUCCESS_MS);
  },
  error(message: string): void {
    toast.error(message, {
      duration: TOAST_DURATION_ERROR,
      icon: errorIcon,
      closeButton: true,
    });
    vibrate(HAPTIC_ERROR_PATTERN);
  },
  info(message: string): void {
    toast.info(message, {
      duration: TOAST_DURATION_SUCCESS,
      icon: infoIcon,
    });
  },
  confirm(message: string): void {
    toast(message, {
      duration: TOAST_DURATION_SUCCESS,
      icon: successIcon,
    });
    vibrate(HAPTIC_SUCCESS_MS);
  },
};
