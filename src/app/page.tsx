import { Suspense } from 'react'
import Leaderboard from '../features/leaderboard/Leaderboard'

export default function Page() {
  return (
    <Suspense
      fallback={
        <main>
          <p role="status">Loading results…</p>
        </main>
      }
    >
      <Leaderboard />
    </Suspense>
  )
}
