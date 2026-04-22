import { Player, Match, Tournament } from '../types';
import { PlayerCard } from './PlayerCard';
import { Plus, Swords, Trophy } from 'lucide-react';

interface DashboardViewProps {
  players: Player[];
  recentMatches: Match[];
  activeTournaments: Tournament[];
  onCreateMatch: (format: '1v1' | '2v2') => void;
  onCreateTournament: () => void;
}

export function DashboardView({
  players,
  recentMatches,
  activeTournaments,
  onCreateMatch,
  onCreateTournament,
}: DashboardViewProps) {
  const topPlayers = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <button
          onClick={() => onCreateMatch('1v1')}
          className="p-6 border-2 border-dashed border-border hover:border-[var(--competitive-accent)] hover:bg-[var(--competitive-accent)]/5 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-muted group-hover:bg-[var(--competitive-accent)]/20 flex items-center justify-center transition-colors">
              <Swords className="text-muted-foreground group-hover:text-[var(--competitive-accent)] transition-colors" />
            </div>
            <div>
              <h3>Create 1v1 Match</h3>
              <p className="text-muted-foreground mt-1">Start a ranked duel</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onCreateMatch('2v2')}
          className="p-6 border-2 border-dashed border-border hover:border-[var(--competitive-accent)] hover:bg-[var(--competitive-accent)]/5 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-muted group-hover:bg-[var(--competitive-accent)]/20 flex items-center justify-center transition-colors">
              <Swords className="text-muted-foreground group-hover:text-[var(--competitive-accent)] transition-colors" />
            </div>
            <div>
              <h3>Create 2v2 Match</h3>
              <p className="text-muted-foreground mt-1">Team battle</p>
            </div>
          </div>
        </button>

        <button
          onClick={onCreateTournament}
          className="p-6 border-2 border-dashed border-border hover:border-[var(--competitive-accent)] hover:bg-[var(--competitive-accent)]/5 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-muted group-hover:bg-[var(--competitive-accent)]/20 flex items-center justify-center transition-colors">
              <Trophy className="text-muted-foreground group-hover:text-[var(--competitive-accent)] transition-colors" />
            </div>
            <div>
              <h3>Create Tournament</h3>
              <p className="text-muted-foreground mt-1">Organize competition</p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4">Top Players</h2>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                rank={index + 1}
                showStats
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentMatches.slice(0, 5).map((match) => (
              <div key={match.id} className="bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground font-mono">{match.format}</span>
                  <span className="text-muted-foreground">
                    {match.date.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={match.winner?.id === match.team1.id ? 'text-[var(--tier-c)]' : ''}>
                      {match.team1.players.map(p => p.name).join(' & ')}
                    </div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className={match.winner?.id === match.team2.id ? 'text-[var(--tier-c)]' : ''}>
                      {match.team2.players.map(p => p.name).join(' & ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeTournaments.length > 0 && (
            <>
              <h2 className="mb-4 mt-8">Active Tournaments</h2>
              <div className="space-y-3">
                {activeTournaments.map((tournament) => (
                  <div key={tournament.id} className="bg-card border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4>{tournament.name}</h4>
                        <div className="text-muted-foreground mt-1 font-mono">
                          Round {tournament.currentRound}/{tournament.totalRounds}
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded bg-[var(--competitive-accent)]/20 text-[var(--competitive-accent)] font-mono">
                        {tournament.format}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
