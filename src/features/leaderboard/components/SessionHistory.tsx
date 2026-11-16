import { Fragment } from 'react';
import styles from '../Leaderboard.module.css';
import { key, placesForResults, type Session } from '../lib/data';
import { formatDate, formatNumber, ordinal } from '../lib/format';

interface SessionHistoryProps {
  sessions: Session[];
  filtered: boolean;
}

function winnerNames(session: Session): string {
  const places = placesForResults(session.results);
  const names = session.results.filter((_, index) => places[index] === 1).map((result) => result.name);
  return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(names);
}

export default function SessionHistory({ sessions, filtered }: SessionHistoryProps) {
  return (
    <section aria-labelledby="history-title">
      <h2 id="history-title">{filtered ? 'History' : 'Recent'}</h2>
      {sessions.length ? sessions.map((session, sessionIndex) => {
        const places = placesForResults(session.results);
        return (
          <article key={sessionIndex} className={styles.historyItem}>
            <p>
              {`${winnerNames(session)} won ${session.game}`}
              {session.date && <> · <time dateTime={session.date} className={styles.muted}>{formatDate(session.date)}</time></>}
            </p>
            <p className={styles.muted}>
              {session.results.map((result, index) => (
                <Fragment key={key(result.name)}>
                  {`${index ? ' · ' : ''}${ordinal(places[index])} ${result.name}${result.points === undefined ? '' : ` (${formatNumber(result.points)})`}`}
                </Fragment>
              ))}
            </p>
          </article>
        );
      }) : <p className={styles.muted}>Nothing yet.</p>}
    </section>
  );
}
