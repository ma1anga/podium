'use client'

import { useSearchParams } from 'next/navigation'
import GameBreakdown from './components/GameBreakdown'
import GameFilters from './components/GameFilters'
import LeaderboardHeader from './components/LeaderboardHeader'
import SessionHistory from './components/SessionHistory'
import StandingsTable from './components/StandingsTable'
import { useResults } from './hooks/useResults'
import { key } from './lib/data'
import { games, standings } from './lib/stats'
import styles from './Leaderboard.module.css'

export default function Leaderboard() {
  const { sessions, loading, error, sampleMode, toggleUrl } = useResults()
  const searchParams = useSearchParams()

  const allGames = games(sessions)
  const requestedGame = key(searchParams.get('game') ?? '')
  const selected = allGames.find((game) => key(game.name) === requestedGame)
  const selectedGame = selected ? key(selected.name) : null
  const visible = selected
    ? sessions.filter((session) => key(session.game) === selectedGame)
    : sessions
  const players = standings(visible)
  const recent = visible
    .map((session, index) => ({ session, index }))
    .sort((a, b) => (b.session.date ?? '').localeCompare(a.session.date ?? '') || b.index - a.index)
    .slice(0, selectedGame ? 30 : 10)
    .map(({ session }) => session)
  const status = loading
    ? 'Loading results…'
    : sessions.length
      ? `${sampleMode ? 'Sample data · ' : ''}${visible.length} ${visible.length === 1 ? 'session' : 'sessions'} recorded${selected ? ` of ${selected.name}` : ''}`
      : error
        ? 'Could not load results.'
        : `${sampleMode ? 'Sample data · ' : ''}Who wins, who loses, who has bragging rights.`

  function selectGame(game: string | null) {
    const url = new URL(window.location.href)
    if (game === null) {
      url.searchParams.delete('game')
    } else {
      url.searchParams.set('game', game)
    }

    if (url.href === window.location.href) {
      return
    }
    // Native history syncs Next.js hooks without reloading the static page or its results.
    // https://nextjs.org/docs/app/getting-started/linking-and-navigating#native-history-api
    window.history.pushState(null, '', url)
  }

  return (
    <main className={styles.leaderboard}>
      <LeaderboardHeader status={status} sampleMode={sampleMode} toggleUrl={toggleUrl} />
      <GameFilters games={allGames} selectedGame={selectedGame} onSelect={selectGame} />
      {error && (
        <p className={styles.message} role="alert">
          {error}
        </p>
      )}
      <StandingsTable players={players} title={selected?.name ?? 'Overall'} />
      {!selected && <GameBreakdown games={allGames} />}
      <SessionHistory sessions={recent} filtered={Boolean(selected)} />
    </main>
  )
}
