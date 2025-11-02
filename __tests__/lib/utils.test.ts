import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class')
    expect(result).toContain('base-class')
    expect(result).toContain('conditional-class')
  })

  it('should handle false conditional classes', () => {
    const result = cn('base-class', false && 'should-not-be-included')
    expect(result).toContain('base-class')
    expect(result).not.toContain('should-not-be-included')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    // Later classes should override earlier ones
    expect(result).toContain('px-4')
  })

  it('should handle undefined and null', () => {
    const result = cn('base-class', undefined, null, 'valid-class')
    expect(result).toContain('base-class')
    expect(result).toContain('valid-class')
  })
})
