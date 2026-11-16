'use client';

import { useState } from 'react';
import GameBreakdown from './components/GameBreakdown';
import GameFilters from './components/GameFilters';
import LeaderboardHeader from './components/LeaderboardHeader';
import SessionHistory from './components/SessionHistory';
import StandingsTable from './components/StandingsTable';
import { useResults } from './hooks/useResults';
import { key } from './lib/data';
import { games, standings } from './lib/stats';
import styles from './Leaderboard.module.css';

export default function Leaderboard() {
  const { sessions, loading, error, sampleMode, toggleUrl } = useResults();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const allGames = games(sessions);
  const selected = allGames.find((game) => key(game.name) === selectedGame);
  const visible = selected
    ? sessions.filter((session) => key(session.game) === selectedGame)
    : sessions;
  const players = standings(visible);
  const recent = visible
    .map((session, index) => ({ session, index }))
    .sort((a, b) => (b.session.date ?? '').localeCompare(a.session.date ?? '') || b.index - a.index)
    .slice(0, selectedGame ? 30 : 10)
    .map(({ session }) => session);
  const status = loading ? 'Loading results…' : sessions.length
    ? `${sampleMode ? 'Sample data · ' : ''}${visible.length} ${visible.length === 1 ? 'session' : 'sessions'} recorded${selected ? ` of ${selected.name}` : ''}`
    : error ? 'Could not load results.'
      : `${sampleMode ? 'Sample data · ' : ''}Who wins, who loses, who has bragging rights.`;

  return (
    <main className={styles.leaderboard}>
      <LeaderboardHeader status={status} sampleMode={sampleMode} toggleUrl={toggleUrl} />
      <GameFilters games={allGames} selectedGame={selectedGame} onSelect={setSelectedGame} />
      {error && <p className={styles.message} role="alert">{error}</p>}
      <StandingsTable players={players} title={selected?.name ?? 'Overall'} />
      {!selected && <GameBreakdown games={allGames} />}
      <SessionHistory sessions={recent} filtered={Boolean(selected)} />
    </main>
  );
}
