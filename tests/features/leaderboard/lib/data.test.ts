import { describe, expect, test } from '@jest/globals'
import { key, parseData, placesForResults } from '../../../../src/features/leaderboard/lib/data'

test('parseData rejects a date that is not in YYYY-MM-DD format', () => {
  const input = {
    results: [
      {
        game: 'Azul',
        date: '21-11-2026',
        results: [{ name: 'Sam' }, { name: 'Alex' }],
      },
    ],
  }

  expect(() => parseData(input)).toThrow('Entry 1: date must be a valid YYYY-MM-DD date.')
})

describe('key', () => {
  test.each([
    ['  Alex  ', 'alex'],
    ['AZUL', 'azul'],
    ['  Board Game  ', 'board game'],
    ['', ''],
  ])('normalizes %j to %j', (input, expected) => {
    expect(key(input)).toBe(expected)
  })
})

describe('placesForResults', () => {
  test('returns no places for no players', () => {
    expect(placesForResults([])).toEqual([])
  })

  test('uses finishing order when points are absent', () => {
    expect(placesForResults([{ name: 'Sam' }, { name: 'Alex' }, { name: 'Jo' }])).toEqual([1, 2, 3])
  })

  test('gives tied scores the same place without skipping the next place', () => {
    expect(
      placesForResults([
        { name: 'Sam', points: 10 },
        { name: 'Alex', points: 10 },
        { name: 'Jo', points: 0 },
        { name: 'Pat', points: 0 },
        { name: 'Kim', points: -5 },
      ]),
    ).toEqual([1, 1, 2, 2, 3])
  })
})

describe('parseData', () => {
  test.each([undefined, null, 1, 'results', [], {}, { results: null }, { results: {} }])(
    'rejects input without a results array: %j',
    (input) => {
      expect(() => parseData(input)).toThrow('Expected a results array.')
    },
  )

  test('accepts an empty list of sessions', () => {
    expect(parseData({ results: [] })).toEqual([])
  })

  test.each([null, [], 'Azul', {}, { game: 1 }, { game: '   ' }])(
    'rejects a session without a game name: %j',
    (entry) => {
      expect(() => parseData({ results: [entry] })).toThrow('Entry 1: game is required.')
    },
  )

  test.each([undefined, null, 'Sam, Alex', [], [{ name: 'Sam' }]])(
    'requires at least two players: %j',
    (results) => {
      expect(() => parseData({ results: [{ game: 'Azul', results }] })).toThrow(
        'Entry 1: at least two players are required.',
      )
    },
  )

  test.each([null, 20261121, '2026-1-01', '2026-13-01', '2026-02-30', '2025-02-29'])(
    'rejects an invalid date: %j',
    (date) => {
      const input = {
        results: [{ game: 'Azul', date, results: [{ name: 'Sam' }, { name: 'Alex' }] }],
      }

      expect(() => parseData(input)).toThrow('Entry 1: date must be a valid YYYY-MM-DD date.')
    },
  )

  test.each(['2026-11-21', '2024-02-29'])('preserves a valid date: %s', (date) => {
    const session = { game: 'Azul', date, results: [{ name: 'Sam' }, { name: 'Alex' }] }

    expect(parseData({ results: [session] })).toEqual([session])
  })

  test.each([null, [], 'Sam', {}, { name: 1 }, { name: '   ' }])(
    'rejects a player without a name: %j',
    (player) => {
      const input = { results: [{ game: 'Azul', results: [player, { name: 'Alex' }] }] }

      expect(() => parseData(input)).toThrow('Entry 1: every player needs a name.')
    },
  )

  test('rejects duplicate names regardless of whitespace and case', () => {
    const input = {
      results: [{ game: 'Azul', results: [{ name: 'Sam' }, { name: '  SAM  ' }] }],
    }

    expect(() => parseData(input)).toThrow('Entry 1: SAM appears more than once.')
  })

  test.each(['10', null, NaN, Infinity, -Infinity])('rejects invalid points: %s', (points) => {
    const input = {
      results: [
        {
          game: 'Azul',
          results: [
            { name: 'Sam', points },
            { name: 'Alex', points: 5 },
          ],
        },
      ],
    }

    expect(() => parseData(input)).toThrow('Entry 1: Sam has invalid points.')
  })

  test('requires points for every player when any player has points', () => {
    const input = {
      results: [{ game: 'Azul', results: [{ name: 'Sam', points: 0 }, { name: 'Alex' }] }],
    }

    expect(() => parseData(input)).toThrow(
      'Entry 1: provide points for every player or none of them.',
    )
  })

  test('trims names, keeps unscored finishing order, and leaves an omitted date absent', () => {
    const input = {
      results: [{ game: '  Azul  ', results: [{ name: ' Sam ' }, { name: ' Alex ' }] }],
    }

    expect(parseData(input)).toStrictEqual([
      { game: 'Azul', results: [{ name: 'Sam' }, { name: 'Alex' }] },
    ])
  })

  test('sorts scores highest first, preserves ties, and accepts zero and negative points', () => {
    const input = {
      results: [
        {
          game: 'Azul',
          results: [
            { name: 'Sam', points: -5 },
            { name: 'Alex', points: 10.5 },
            { name: 'Jo', points: 0 },
            { name: 'Pat', points: 10.5 },
          ],
        },
      ],
    }

    const parsed = parseData(input)

    expect(parsed).toEqual([
      {
        game: 'Azul',
        results: [
          { name: 'Alex', points: 10.5 },
          { name: 'Pat', points: 10.5 },
          { name: 'Jo', points: 0 },
          { name: 'Sam', points: -5 },
        ],
      },
    ])
    expect(input.results[0].results).toEqual([
      { name: 'Sam', points: -5 },
      { name: 'Alex', points: 10.5 },
      { name: 'Jo', points: 0 },
      { name: 'Pat', points: 10.5 },
    ])
  })

  test('allows the same player in different sessions', () => {
    const sessions = [
      { game: 'Azul', results: [{ name: 'Sam' }, { name: 'Alex' }] },
      { game: 'Chess', results: [{ name: 'Sam' }, { name: 'Alex' }] },
    ]

    expect(parseData({ results: sessions })).toEqual(sessions)
  })

  test('identifies the failing entry in a list of sessions', () => {
    const input = {
      results: [{ game: 'Azul', results: [{ name: 'Sam' }, { name: 'Alex' }] }, { game: '' }],
    }

    expect(() => parseData(input)).toThrow('Entry 2: game is required.')
  })
})
