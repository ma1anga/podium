import { describe, expect, test } from '@jest/globals'
import type { Session } from '../../../../src/features/leaderboard/lib/data'
import { averagePlace, games, standings } from '../../../../src/features/leaderboard/lib/stats'

const unscoredSession = (game: string, ...names: string[]): Session => ({
  game,
  results: names.map((name) => ({ name })),
})

describe('standings', () => {
  test('returns an empty leaderboard without sessions', () => {
    expect(standings([])).toEqual([])
  })

  test('combines case-insensitive names and totals finishes and points across sessions', () => {
    const sessions: Session[] = [
      {
        game: 'Azul',
        results: [
          { name: 'Alex', points: 8 },
          { name: 'Cam', points: 0 },
          { name: 'Blair', points: -3 },
        ],
      },
      {
        game: 'Azul',
        results: [
          { name: 'aLEX', points: 5 },
          { name: 'Blair', points: -2 },
        ],
      },
      unscoredSession('Azul', 'Dina', 'Alex', 'Cam'),
    ]

    expect(standings(sessions)).toEqual([
      { name: 'Alex', wins: 2, played: 3, places: 4, points: 13, hasPoints: true },
      { name: 'Dina', wins: 1, played: 1, places: 1, points: 0, hasPoints: false },
      { name: 'Blair', wins: 0, played: 2, places: 5, points: -5, hasPoints: true },
      { name: 'Cam', wins: 0, played: 2, places: 5, points: 0, hasPoints: true },
    ])
  })

  test('awards a win to each tied leader and assigns the next player second place', () => {
    const sessions: Session[] = [
      {
        game: 'Azul',
        results: [
          { name: 'Blair', points: 10 },
          { name: 'Alex', points: 10 },
          { name: 'Cam', points: 6 },
        ],
      },
    ]

    expect(standings(sessions)).toEqual([
      { name: 'Alex', wins: 1, played: 1, places: 1, points: 10, hasPoints: true },
      { name: 'Blair', wins: 1, played: 1, places: 1, points: 10, hasPoints: true },
      { name: 'Cam', wins: 0, played: 1, places: 2, points: 6, hasPoints: true },
    ])
  })

  test('sorts by wins first and lower average finish when wins are tied', () => {
    const sessions = [
      unscoredSession('Azul', 'Zoe', 'Amy'),
      unscoredSession('Azul', 'Zoe', 'Amy'),
      unscoredSession('Azul', 'Amy', 'Ben', 'Cam', 'Zoe'),
      unscoredSession('Azul', 'Ben', 'Amy', 'Cam', 'Zoe'),
    ]

    expect(standings(sessions).map(({ name }) => name)).toEqual(['Zoe', 'Ben', 'Amy', 'Cam'])
  })

  test('breaks equal wins and average finishes by sessions played, then by name', () => {
    const sessions = [
      unscoredSession('Azul', 'Dina', 'Ben'),
      unscoredSession('Azul', 'Dina', 'Amy'),
      unscoredSession('Azul', 'Dina', 'Zoe'),
      unscoredSession('Azul', 'Dina', 'Zoe'),
    ]

    expect(standings(sessions).map(({ name }) => name)).toEqual(['Dina', 'Zoe', 'Amy', 'Ben'])
  })
})

describe('games', () => {
  test('returns an empty game list without sessions', () => {
    expect(games([])).toEqual([])
  })

  test('groups game names case-insensitively and sorts by session count, then by name', () => {
    const sessions = [
      unscoredSession('Splendor', 'Cam', 'Alex'),
      unscoredSession('Wingspan', 'Alex', 'Blair'),
      unscoredSession('Azul', 'Blair', 'Alex'),
      unscoredSession('wingspan', 'Alex', 'Blair'),
    ]

    expect(games(sessions)).toEqual([
      {
        name: 'Wingspan',
        count: 2,
        standings: [
          { name: 'Alex', wins: 2, played: 2, places: 2, points: 0, hasPoints: false },
          { name: 'Blair', wins: 0, played: 2, places: 4, points: 0, hasPoints: false },
        ],
      },
      {
        name: 'Azul',
        count: 1,
        standings: [
          { name: 'Blair', wins: 1, played: 1, places: 1, points: 0, hasPoints: false },
          { name: 'Alex', wins: 0, played: 1, places: 2, points: 0, hasPoints: false },
        ],
      },
      {
        name: 'Splendor',
        count: 1,
        standings: [
          { name: 'Cam', wins: 1, played: 1, places: 1, points: 0, hasPoints: false },
          { name: 'Alex', wins: 0, played: 1, places: 2, points: 0, hasPoints: false },
        ],
      },
    ])
  })
})

test('averagePlace divides the total finishing places by the sessions played', () => {
  expect(
    averagePlace({ name: 'Alex', wins: 2, played: 4, places: 7, points: 0, hasPoints: false }),
  ).toBe(1.75)
})
