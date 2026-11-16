'use client'

import styles from './ThemeSwitch.module.css'

function toggleTheme(): void {
  const root = document.documentElement
  root.dataset.theme = getComputedStyle(root).colorScheme === 'dark' ? 'light' : 'dark'
}

export default function ThemeSwitch() {
  return (
    <button
      className={styles.switch}
      type="button"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={toggleTheme}
    >
      <span className={styles.thumb} aria-hidden="true" />
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </svg>
      <svg className={`${styles.icon} ${styles.moon}`} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z" />
      </svg>
    </button>
  )
}
