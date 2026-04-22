import { Tournament, Player } from '../types';
import { TournamentBracket } from './TournamentBracket';
import { Plus } from 'lucide-react';

interface TournamentsViewProps {
  tournaments: Tournament[];
  players: Player[];
  onCreateTournament: () => void;
  onMatchResult?: (tournamentId: string, matchId: string, winnerId: string) => void;
}

export function TournamentsView({
  tournaments,
  players,
  onCreateTournament,
  onMatchResult,
}: TournamentsViewProps) {
  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Tournaments</h1>
        <button
          onClick={onCreateTournament}
          className="px-4 py-2 bg-[var(--competitive-accent)] text-white rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={18} />
          Create Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No tournaments yet</p>
          <button
            onClick={onCreateTournament}
            className="px-6 py-3 bg-[var(--competitive-accent)] text-white rounded hover:opacity-90"
          >
            Create Your First Tournament
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-card border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2>{tournament.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-muted rounded font-mono text-sm">
                        {tournament.format}
                      </span>
                      <span className="px-3 py-1 bg-muted rounded font-mono text-sm">
                        {tournament.participants.length} participants
                      </span>
                      <span
                        className={`px-3 py-1 rounded font-mono text-sm ${
                          tournament.status === 'completed'
                            ? 'bg-[var(--tier-c)]/20 text-[var(--tier-c)]'
                            : tournament.status === 'in_progress'
                            ? 'bg-[var(--competitive-accent)]/20 text-[var(--competitive-accent)]'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {tournament.status === 'completed'
                          ? 'Completed'
                          : tournament.status === 'in_progress'
                          ? `In Progress - Round ${tournament.currentRound}/${tournament.totalRounds}`
                          : 'Not Started'}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {tournament.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {tournament.matches.length > 0 ? (
                <TournamentBracket
                  tournament={tournament}
                  players={players}
                  onMatchResult={
                    onMatchResult
                      ? (matchId, winnerId) => onMatchResult(tournament.id, matchId, winnerId)
                      : undefined
                  }
                />
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  Tournament bracket will appear here once matches are generated
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
