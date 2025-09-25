import { cn } from '@/lib/utils';

describe('cn (className utility)', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', {
      'conditional-true': true,
      'conditional-false': false,
    });
    
    expect(result).toContain('base');
    expect(result).toContain('conditional-true');
    expect(result).not.toContain('conditional-false');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('merges Tailwind classes correctly', () => {
    // Test that twMerge works - later classes should override earlier ones
    const result = cn('p-2', 'p-4');
    
    // Should only contain p-4, not p-2 (due to Tailwind merge)
    expect(result).toContain('p-4');
    expect(result).not.toContain('p-2');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    
    expect(result).toContain('base');
    expect(result).toContain('valid');
  });

  it('handles empty strings', () => {
    const result = cn('base', '', 'valid');
    
    expect(result).toContain('base');
    expect(result).toContain('valid');
  });

  it('handles complex conditional scenarios', () => {
    const isActive = true;
    const isDisabled = false;
    const variant = 'primary';
    
    const result = cn(
      'btn',
      {
        'btn-active': isActive,
        'btn-disabled': isDisabled,
      },
      variant === 'primary' && 'btn-primary',
      variant === 'secondary' && 'btn-secondary'
    );
    
    expect(result).toContain('btn');
    expect(result).toContain('btn-active');
    expect(result).toContain('btn-primary');
    expect(result).not.toContain('btn-disabled');
    expect(result).not.toContain('btn-secondary');
  });

  it('works with no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('deduplicates identical classes', () => {
    const result = cn('text-red-500', 'bg-blue-200', 'text-red-500');
    
    // Should not contain duplicate text color classes
    const classes = result.split(' ');
    const textRedCount = classes.filter(cls => cls === 'text-red-500').length;
    expect(textRedCount).toBeLessThanOrEqual(1);
    
    // Should still contain the background class
    expect(result).toContain('bg-blue-200');
  });

  it('handles complex Tailwind merge scenarios', () => {
    // Test conflicting margin classes
    const result1 = cn('m-2', 'm-4');
    expect(result1).toBe('m-4');
    
    // Test conflicting padding with different directions
    const result2 = cn('p-2', 'px-4');
    expect(result2).toContain('p-2');
    expect(result2).toContain('px-4');
    
    // Test conflicting background colors
    const result3 = cn('bg-red-500', 'bg-blue-500');
    expect(result3).toBe('bg-blue-500');
  });

  it('preserves non-conflicting Tailwind classes', () => {
    const result = cn('text-white', 'bg-blue-500', 'p-4', 'rounded');
    
    expect(result).toContain('text-white');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('p-4');
    expect(result).toContain('rounded');
  });

  it('handles responsive and state variants correctly', () => {
    const result = cn(
      'p-2',
      'md:p-4',
      'lg:p-6',
      'hover:bg-gray-100',
      'focus:ring-2'
    );
    
    expect(result).toContain('p-2');
    expect(result).toContain('md:p-4');
    expect(result).toContain('lg:p-6');
    expect(result).toContain('hover:bg-gray-100');
    expect(result).toContain('focus:ring-2');
  });
});