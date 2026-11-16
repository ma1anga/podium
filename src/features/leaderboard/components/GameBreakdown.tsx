import styles from '../Leaderboard.module.css'
import { key } from '../lib/data'
import { formatNumber } from '../lib/format'
import { averagePlace, type GameStats } from '../lib/stats'

interface GameBreakdownProps {
  games: GameStats[]
}

export default function GameBreakdown({ games }: GameBreakdownProps) {
  return (
    <section aria-labelledby="games-title">
      <h2 id="games-title">By game</h2>
      {games.map((game) => (
        <article key={key(game.name)} className={styles.game}>
          <h3>{game.name}</h3>
          <p
            className={styles.muted}
          >{`${game.count} ${game.count === 1 ? 'session' : 'sessions'} played`}</p>
          <div className={styles.chips}>
            {game.standings.map((player) => (
              <span key={key(player.name)} className={styles.chip}>
                {`${player.name} `}
                <strong>{`${player.wins}/${player.played}`}</strong>{' '}
                <span
                  className={styles.muted}
                >{` · avg ${formatNumber(averagePlace(player))}${player.hasPoints ? ` · ${formatNumber(player.points)} pts` : ''}`}</span>
              </span>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}
