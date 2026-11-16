import styles from '../Leaderboard.module.css';
import { key } from '../lib/data';
import type { GameStats } from '../lib/stats';

interface GameFiltersProps {
  games: GameStats[];
  selectedGame: string | null;
  onSelect: (game: string | null) => void;
}

export default function GameFilters({ games, selectedGame, onSelect }: GameFiltersProps) {
  if (!games.length) return null;

  return (
    <nav className={styles.filters} aria-label="Filter by game">
      <button
        type="button"
        className={`${styles.filter}${selectedGame === null ? ` ${styles.active}` : ''}`}
        aria-pressed={selectedGame === null}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {games.map((game) => (
        <button
          key={key(game.name)}
          type="button"
          className={`${styles.filter}${selectedGame === key(game.name) ? ` ${styles.active}` : ''}`}
          aria-pressed={selectedGame === key(game.name)}
          onClick={() => onSelect(key(game.name))}
        >
          {game.name}
        </button>
      ))}
    </nav>
  );
}
