import styles from '../Leaderboard.module.css';
import { key } from '../lib/data';
import { formatNumber } from '../lib/format';
import { averagePlace, type Standing } from '../lib/stats';

interface StandingsTableProps {
  players: Standing[];
  title: string;
}

export default function StandingsTable({ players, title }: StandingsTableProps) {
  return (
    <section aria-labelledby="standings-title">
      <h2 id="standings-title">{title}</h2>
      <div className={styles.tableScroll}>
        {players.length ? (
          <table className={styles.standingsTable}>
            <caption className={styles.visuallyHidden}>Player standings</caption>
            <thead>
              <tr>
                <th scope="col" className={styles.rank}>Rank</th>
                <th scope="col" className={styles.name}>Player</th>
                <th scope="col">Wins</th>
                <th scope="col">Played</th>
                <th scope="col">Win %</th>
                <th scope="col">Avg place</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={key(player.name)}>
                  <td className={styles.rank}>{index + 1}</td>
                  <td className={styles.name}>{player.name}</td>
                  <td>{player.wins}</td>
                  <td>{player.played}</td>
                  <td>{`${Math.round(player.wins / player.played * 100)}%`}</td>
                  <td>{formatNumber(averagePlace(player))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className={styles.muted}>No results yet.</p>}
      </div>
    </section>
  );
}
