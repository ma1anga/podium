'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeSwitch.module.css'

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    let initialTheme: 'light' | 'dark' = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    try {
      const savedTheme = localStorage.getItem('podium-theme')
      if (savedTheme === 'light' || savedTheme === 'dark') initialTheme = savedTheme
    } catch {
      // Keep the system preference when browser storage is unavailable.
    }
    document.documentElement.dataset.theme = initialTheme
    setTheme(initialTheme)
  }, [])

  function toggleTheme(): void {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    try {
      localStorage.setItem('podium-theme', nextTheme)
    } catch {
      // The switch still works when browser storage is unavailable.
    }
  }

  return (
    <button
      className={styles.switch}
      type="button"
      role="switch"
      aria-label="Dark theme"
      aria-checked={theme === 'dark'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
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
