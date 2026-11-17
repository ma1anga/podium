import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { parseData, type Session } from '../lib/data'

interface ResultsState {
  sessions: Session[]
  loading: boolean
  error: string
  sampleMode: boolean
}

export function useResults() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<ResultsState>({
    sessions: [],
    loading: true,
    error: '',
    sampleMode: false,
  })

  useEffect(() => {
    const sample =
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).get('sample') === '1'
    const controller = new AbortController()

    async function load(): Promise<void> {
      const filename = sample ? 'fixtures/results.sample.json' : 'results.json'
      let sessions: Session[] = []
      let error = ''
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
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          data = (await response.json()) as unknown
        }
        if (!controller.signal.aborted) {
          sessions = parseData(data)
        }
      } catch (cause) {
        error =
          cause instanceof SyntaxError
            ? `Invalid JSON in ${filename}.`
            : `${filename}: ${cause instanceof Error ? cause.message : 'Could not load results.'}`
      }
      if (!controller.signal.aborted) {
        setResults({
          sessions,
          loading: false,
          error,
          sampleMode: sample,
        })
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  const toggleParams = new URLSearchParams(searchParams.toString())
  if (results.sampleMode) {
    toggleParams.delete('sample')
  } else {
    toggleParams.set('sample', '1')
  }

  return { ...results, toggleUrl: `?${toggleParams.toString()}` }
}
