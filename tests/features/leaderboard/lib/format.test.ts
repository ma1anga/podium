import { afterEach, describe, expect, jest, test } from '@jest/globals'
import { formatDate, formatNumber, ordinal } from '../../../../src/features/leaderboard/lib/format'

describe('formatNumber', () => {
  test.each([
    [0, '0'],
    [12, '12'],
    [1.2, '1.2'],
    [1.24, '1.2'],
    [1.26, '1.3'],
    [1.25, '1.3'],
    [9.99, '10'],
    [-1.26, '-1.3'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatNumber(value)).toBe(expected)
  })
})

describe('ordinal', () => {
  test.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [10, '10th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [23, '23rd'],
    [101, '101st'],
    [111, '111th'],
    [112, '112th'],
    [113, '113th'],
  ])('formats %s as %s', (value, expected) => {
    expect(ordinal(value)).toBe(expected)
  })
})

describe('formatDate', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([
    ['2026-11-21', '21/11/2026'],
    ['2024-02-29', '29/02/2024'],
    ['2026-01-01', '01/01/2026'],
  ])('formats %s without shifting the calendar date', (value, expected) => {
    const toLocaleDateString = Date.prototype.toLocaleDateString

    // Fix only the locale so expectations are portable; keep real date and timezone formatting.
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function (
      this: Date,
      optionsLocale,
      options,
    ) {
      return toLocaleDateString.call(this, 'en-GB', options)
    })

    expect(formatDate(value)).toBe(expected)
  })
})
