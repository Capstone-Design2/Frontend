import { describe, it, expect } from 'vitest'
import { sma } from '@/utils/indicators'

describe('sma', () => {
  it('handles empty array', () => {
    expect(sma([], 3)).toEqual([])
  })
  it('computes simple moving average', () => {
    const values = [1,2,3,4,5]
    const out = sma(values, 3)
    expect(out.length).toBe(5)
    expect(out.slice(0,2).every(Number.isNaN)).toBe(true)
    expect(out[2]).toBeCloseTo((1+2+3)/3)
    expect(out[3]).toBeCloseTo((2+3+4)/3)
    expect(out[4]).toBeCloseTo((3+4+5)/3)
  })
})
