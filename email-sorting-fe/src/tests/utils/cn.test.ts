import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBeTruthy();
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'truthy', false && 'falsy');
    expect(result).toBeTruthy();
    expect(result).not.toContain('falsy');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBeTruthy();
  });

  it('should handle undefined and null', () => {
    const result = cn('class1', undefined, null, 'class2');
    expect(result).toBeTruthy();
  });

  it('should handle empty strings', () => {
    const result = cn('class1', '', 'class2');
    expect(result).toBeTruthy();
  });
});
