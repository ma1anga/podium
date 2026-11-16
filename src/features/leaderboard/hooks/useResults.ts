import { useEffect, useState } from 'react'
import { parseData, type Session } from '../lib/data'

export function useResults() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sampleMode, setSampleMode] = useState(false)
  const [toggleUrl, setToggleUrl] = useState('?sample=1')

  useEffect(() => {
    const sample =
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).get('sample') === '1'
    const url = new URL(window.location.href)
    if (sample) url.searchParams.delete('sample')
    else url.searchParams.set('sample', '1')
    setSampleMode(sample)
    setToggleUrl(url.toString())

    const controller = new AbortController()

    async function load(): Promise<void> {
      const filename = sample ? 'fixtures/results.sample.json' : 'results.json'
      try {
        let data: unknown
        // The compile-time guard keeps the fixture out of the production export.
        if (process.env.NODE_ENV === 'development' && sample) {
          data = (await import('../../../../fixtures/results.sample.json')).default
        } else {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/results.json`, {
            cache: 'no-store',
            signal: controller.signal,
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          data = (await response.json()) as unknown
        }
        if (!controller.signal.aborted) setSessions(parseData(data))
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof SyntaxError
              ? `Invalid JSON in ${filename}.`
              : `${filename}: ${cause instanceof Error ? cause.message : 'Could not load results.'}`,
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  return { sessions, loading, error, sampleMode, toggleUrl }
}
