import { Tournament, Match, Team, Player } from '../types';
import { Trophy } from 'lucide-react';

interface TournamentBracketProps {
  tournament: Tournament;
  players: Player[];
  onMatchResult?: (matchId: string, winnerId: string) => void;
}

export function TournamentBracket({ tournament, players, onMatchResult }: TournamentBracketProps) {
  const getRoundMatches = (round: number): Match[] => {
    return tournament.matches.filter((match) => {
      const matchIndex = tournament.matches.indexOf(match);
      const matchesPerRound = Math.ceil(tournament.participants.length / 2);
      const matchRound = Math.floor(matchIndex / matchesPerRound) + 1;
      return matchRound === round;
    });
  };

  const getTeamName = (team: Team): string => {
    return team.players.map(p => p.name).join(' & ');
  };

  const renderMatchCard = (match: Match, roundIndex: number) => {
    return (
      <div
        key={match.id}
        className="bg-card border-2 border-border min-w-[200px] mb-4"
      >
        <div className="p-3 border-b border-border bg-muted">
          <div className="text-xs text-muted-foreground font-mono text-center">
            Round {roundIndex + 1}
          </div>
        </div>

        <div className="divide-y divide-border">
          <div
            className={`p-3 transition-colors ${
              match.winner?.id === match.team1.id
                ? 'bg-[var(--tier-c)]/20 border-l-4 border-l-[var(--tier-c)]'
                : match.status === 'completed'
                ? 'opacity-50'
                : 'hover:bg-muted cursor-pointer'
            }`}
            onClick={() => match.status === 'pending' && onMatchResult?.(match.id, match.team1.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{getTeamName(match.team1)}</span>
              {match.winner?.id === match.team1.id && (
                <Trophy size={14} className="text-[var(--tier-c)] shrink-0" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {match.team1.players.map(p => p.rating).join(' / ')}
            </div>
          </div>

          <div
            className={`p-3 transition-colors ${
              match.winner?.id === match.team2.id
                ? 'bg-[var(--tier-c)]/20 border-l-4 border-l-[var(--tier-c)]'
                : match.status === 'completed'
                ? 'opacity-50'
                : 'hover:bg-muted cursor-pointer'
            }`}
            onClick={() => match.status === 'pending' && onMatchResult?.(match.id, match.team2.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{getTeamName(match.team2)}</span>
              {match.winner?.id === match.team2.id && (
                <Trophy size={14} className="text-[var(--tier-c)] shrink-0" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {match.team2.players.map(p => p.rating).join(' / ')}
            </div>
          </div>
        </div>

        {match.status === 'pending' && (
          <div className="p-2 bg-muted text-center text-xs text-muted-foreground">
            Click to select winner
          </div>
        )}
      </div>
    );
  };

  const renderEmptySlot = () => {
    return (
      <div className="bg-card border-2 border-dashed border-border min-w-[200px] mb-4">
        <div className="p-3 border-b border-border bg-muted/50">
          <div className="text-xs text-muted-foreground font-mono text-center">
            TBD
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-sm">Awaiting winner</div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {Array.from({ length: tournament.totalRounds }).map((_, roundIndex) => {
          const roundMatches = getRoundMatches(roundIndex + 1);
          const expectedMatches = Math.ceil(tournament.participants.length / Math.pow(2, roundIndex + 1));

          return (
            <div key={roundIndex} className="flex flex-col justify-center min-w-[220px]">
              <h3 className="mb-4 text-center">
                {roundIndex === tournament.totalRounds - 1 ? 'Final' : `Round ${roundIndex + 1}`}
              </h3>

              <div className="flex flex-col justify-around flex-1">
                {roundMatches.length > 0 ? (
                  roundMatches.map((match) => renderMatchCard(match, roundIndex))
                ) : (
                  Array.from({ length: expectedMatches }).map((_, i) => (
                    <div key={i}>{renderEmptySlot()}</div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {tournament.winner && (
          <div className="flex flex-col justify-center min-w-[220px]">
            <h3 className="mb-4 text-center text-[var(--competitive-accent)]">Champion</h3>
            <div className="bg-gradient-to-br from-[var(--competitive-accent)]/20 to-[var(--tier-c)]/20 border-2 border-[var(--competitive-accent)] p-6">
              <div className="flex flex-col items-center gap-3">
                <Trophy size={32} className="text-[var(--competitive-accent)]" />
                <div className="text-center">
                  <div className="mb-2">{getTeamName(tournament.winner)}</div>
                  <div className="text-muted-foreground font-mono">
                    {tournament.winner.players.map(p => p.rating).join(' / ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
