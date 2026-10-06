export interface PlayerResult {
  name: string;
  points?: number;
}

export interface Session {
  game: string;
  date?: string;
  results: PlayerResult[];
}

export const key = (value: string): string => value.trim().toLowerCase();

export function parseData(input: unknown): Session[] {
  if (!isObject(input) || !Array.isArray(input.results)) {
    throw new Error('Expected a results array.');
  }

  return input.results.map((entry, index) => {
    const label = `Entry ${index + 1}`;
    if (!isObject(entry) || typeof entry.game !== 'string' || !entry.game.trim()) {
      throw new Error(`${label}: game is required.`);
    }
    if (!Array.isArray(entry.results) || entry.results.length < 2) {
      throw new Error(`${label}: at least two players are required.`);
    }
    if (entry.date !== undefined && (typeof entry.date !== 'string' || !validDate(entry.date))) {
      throw new Error(`${label}: date must be a valid YYYY-MM-DD date.`);
    }

    const seen = new Set<string>();
    const results: PlayerResult[] = entry.results.map((result) => {
      if (!isObject(result) || typeof result.name !== 'string' || !result.name.trim()) {
        throw new Error(`${label}: every player needs a name.`);
      }
      const name = result.name.trim();
      if (seen.has(key(name))) throw new Error(`${label}: ${name} appears more than once.`);
      if (result.points !== undefined && (typeof result.points !== 'number' || !Number.isFinite(result.points))) {
        throw new Error(`${label}: ${name} has invalid points.`);
      }
      seen.add(key(name));
      return result.points === undefined ? { name } : { name, points: result.points };
    });

    return {
      game: entry.game.trim(),
      ...(entry.date === undefined ? {} : { date: entry.date }),
      results,
    };
  });
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
