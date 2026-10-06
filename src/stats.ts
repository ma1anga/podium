import { key, type Session } from './data';

export interface Standing {
  name: string;
  wins: number;
  played: number;
  places: number;
  points: number;
  hasPoints: boolean;
}

export interface GameStats {
  name: string;
  count: number;
  standings: Standing[];
}

export const averagePlace = (standing: Standing): number => standing.places / standing.played;

export function standings(sessions: Session[]): Standing[] {
  const players = new Map<string, Standing>();
  for (const session of sessions) {
    session.results.forEach((result, index) => {
      const id = key(result.name);
      const player = players.get(id) ?? {
        name: result.name, wins: 0, played: 0, places: 0, points: 0, hasPoints: false,
      };
      player.played++;
      player.places += index + 1;
      if (index === 0) player.wins++;
      if (result.points !== undefined) {
        player.points += result.points;
        player.hasPoints = true;
      }
      players.set(id, player);
    });
  }
  return [...players.values()].sort((a, b) =>
    b.wins - a.wins || averagePlace(a) - averagePlace(b) || b.played - a.played || a.name.localeCompare(b.name),
  );
}

export function games(sessions: Session[]): GameStats[] {
  const groups = new Map<string, { name: string; sessions: Session[] }>();
  for (const session of sessions) {
    const id = key(session.game);
    const group = groups.get(id) ?? { name: session.game, sessions: [] };
    group.sessions.push(session);
    groups.set(id, group);
  }
  return [...groups.values()]
    .map((group) => ({ name: group.name, count: group.sessions.length, standings: standings(group.sessions) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
