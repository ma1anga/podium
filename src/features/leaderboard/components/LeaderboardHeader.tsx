import ThemeSwitch from '../../../components/theme/ThemeSwitch';
import styles from '../Leaderboard.module.css';

interface LeaderboardHeaderProps {
  status: string;
  sampleMode: boolean;
  toggleUrl: string;
}

export default function LeaderboardHeader({ status, sampleMode, toggleUrl }: LeaderboardHeaderProps) {
  return (
    <header>
      <div className={styles.headerTop}>
        <h1>Podium</h1>
        <ThemeSwitch />
      </div>
      <p className={`${styles.muted} ${styles.subtitle}`} aria-live="polite">{status}</p>
      {process.env.NODE_ENV === 'development' && (
        <a className={styles.dataToggle} href={toggleUrl}>
          {sampleMode ? 'View your results' : 'View sample data'}
        </a>
      )}
    </header>
  );
}
