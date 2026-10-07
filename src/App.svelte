<script lang="ts">
  import { onMount } from 'svelte';
  import { key, parseData, type Session } from './data';
  import { averagePlace, games, standings } from './stats';

  const sampleMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('sample') === '1';
  const toggleUrl = new URL(window.location.href);
  if (sampleMode) toggleUrl.searchParams.delete('sample');
  else toggleUrl.searchParams.set('sample', '1');

  let sessions = $state<Session[]>([]);
  let selectedGame = $state<string | null>(null);
  let loading = $state(true);
  let error = $state('');
  let theme = $state<'light' | 'dark'>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  function toggleTheme(): void {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('podium-theme', theme);
    } catch {
      // The switch still works when browser storage is unavailable.
    }
  }

  let allGames = $derived(games(sessions));
  let selected = $derived(allGames.find((game) => key(game.name) === selectedGame));
  let visible = $derived(selected
    ? sessions.filter((session) => key(session.game) === selectedGame)
    : sessions);
  let players = $derived(standings(visible));
  let recent = $derived.by(() => visible
    .map((session, index) => ({ session, index }))
    .sort((a, b) => (b.session.date ?? '').localeCompare(a.session.date ?? '') || b.index - a.index)
    .slice(0, selectedGame ? 30 : 10)
    .map(({ session }) => session));

  function number(value: number): string {
    return (Math.round(value * 10) / 10).toString();
  }

  function ordinal(value: number): string {
    if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
    return `${value}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[value % 10] ?? 'th'}`;
  }

  function formatDate(value: string): string {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC' });
  }

  onMount(() => {
    async function load(): Promise<void> {
      const filename = sampleMode ? 'fixtures/results.sample.json' : 'results.json';
      try {
        const url = sampleMode ? `/${filename}` : `${import.meta.env.BASE_URL}${filename}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        sessions = parseData(await response.json() as unknown);
      } catch (cause) {
        error = cause instanceof SyntaxError
          ? `Invalid JSON in ${filename}.`
          : `${filename}: ${cause instanceof Error ? cause.message : 'Could not load results.'}`;
      } finally {
        loading = false;
      }
    }

    void load();
  });
</script>

<main>
  <header>
    <div class="header-top">
      <h1>Podium</h1>
      <button class="theme-switch" type="button" role="switch" aria-label="Dark theme" aria-checked={theme === 'dark'} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onclick={toggleTheme}>
        <span class="theme-switch-thumb" aria-hidden="true"></span>
        <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
        <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z"/></svg>
      </button>
    </div>
    <p class="muted" aria-live="polite">
      {#if loading}
        Loading results…
      {:else if sessions.length}
        {sampleMode ? 'Sample data · ' : ''}{visible.length} {visible.length === 1 ? 'session' : 'sessions'} recorded{selected ? ` of ${selected.name}` : ''}
      {:else if error}
        Could not load results.
      {:else}
        {sampleMode ? 'Sample data · ' : ''}Who wins, who loses, who has bragging rights.
      {/if}
    </p>
    {#if import.meta.env.DEV}
      <a class="data-toggle" href={toggleUrl.toString()}>{sampleMode ? 'View your results' : 'View sample data'}</a>
    {/if}
  </header>

  {#if allGames.length}
    <nav class="filters" aria-label="Filter by game">
      <button type="button" class="filter" class:active={selectedGame === null} aria-pressed={selectedGame === null} onclick={() => selectedGame = null}>All</button>
      {#each allGames as game (key(game.name))}
        <button type="button" class="filter" class:active={selectedGame === key(game.name)} aria-pressed={selectedGame === key(game.name)} onclick={() => selectedGame = key(game.name)}>{game.name}</button>
      {/each}
    </nav>
  {/if}

  {#if error}<p class="message" role="alert">{error}</p>{/if}

  <section aria-labelledby="standings-title">
    <h2 id="standings-title">{selected?.name ?? 'Overall'}</h2>
    <div class="table-scroll">
      {#if players.length}
        <table>
          <caption class="visually-hidden">Player standings</caption>
          <thead>
            <tr>
              <th scope="col" class="rank">Rank</th>
              <th scope="col" class="name">Player</th>
              <th scope="col">Wins</th>
              <th scope="col">Played</th>
              <th scope="col">Win %</th>
              <th scope="col">Avg place</th>
            </tr>
          </thead>
          <tbody>
            {#each players as player, index (key(player.name))}
              <tr>
                <td class="rank">{index + 1}</td>
                <td class="name">{player.name}</td>
                <td>{player.wins}</td>
                <td>{player.played}</td>
                <td>{Math.round(player.wins / player.played * 100)}%</td>
                <td>{number(averagePlace(player))}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="muted">No results yet.</p>
      {/if}
    </div>
  </section>

  {#if !selected}
    <section aria-labelledby="games-title">
      <h2 id="games-title">By game</h2>
      {#each allGames as game (key(game.name))}
        <article class="game">
          <h3>{game.name}</h3>
          <p class="muted">{game.count} {game.count === 1 ? 'session' : 'sessions'} played</p>
          <div class="chips">
            {#each game.standings as player (key(player.name))}
              <span class="chip">
                {player.name} <strong>{player.wins}/{player.played}</strong>
                <span class="muted"> · avg {number(averagePlace(player))}{player.hasPoints ? ` · ${number(player.points)} pts` : ''}</span>
              </span>
            {/each}
          </div>
        </article>
      {/each}
    </section>
  {/if}

  <section aria-labelledby="history-title">
    <h2 id="history-title">{selected ? 'History' : 'Recent'}</h2>
    {#if recent.length}
      {#each recent as session (session)}
        <article class="history-item">
          <p>
            {session.results[0].name} won {session.game}
            {#if session.date} · <time datetime={session.date} class="muted">{formatDate(session.date)}</time>{/if}
          </p>
          <p class="muted">
            {#each session.results as result, index (key(result.name))}
              {index ? ' · ' : ''}{ordinal(index + 1)} {result.name}{result.points === undefined ? '' : ` (${number(result.points)})`}
            {/each}
          </p>
        </article>
      {/each}
    {:else}
      <p class="muted">Nothing yet.</p>
    {/if}
  </section>
</main>
