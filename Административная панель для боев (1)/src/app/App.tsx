import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PlayersView } from './components/PlayersView';
import { CreateMatchView } from './components/CreateMatchView';
import { TournamentsView } from './components/TournamentsView';
import { ThemeToggle } from './components/ThemeToggle';
import { mockPlayers, mockCharacters, mockMatches, mockTournaments } from './data/mockData';
import { Player, Match, MatchFormat, Team, Tournament } from './types';
import { calculateRatingChange } from './utils/balancing';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [createMatchFormat, setCreateMatchFormat] = useState<MatchFormat>('1v1');

  const handleCreateMatch = (format: MatchFormat) => {
    setCreateMatchFormat(format);
    setShowCreateMatch(true);
  };

  const handleMatchCreated = (data: {
    format: MatchFormat;
    team1PlayerIds: string[];
    team2PlayerIds: string[];
    characterSelections: { playerId: string; characterId: string }[];
  }) => {
    const team1Players = data.team1PlayerIds.map(id => players.find(p => p.id === id)!);
    const team2Players = data.team2PlayerIds.map(id => players.find(p => p.id === id)!);

    const newMatch: Match = {
      id: `m${matches.length + 1}`,
      format: data.format,
      status: 'pending',
      team1: {
        id: `t${Date.now()}_1`,
        players: team1Players,
      },
      team2: {
        id: `t${Date.now()}_2`,
        players: team2Players,
      },
      characterSelections: data.characterSelections,
      date: new Date(),
    };

    setMatches([newMatch, ...matches]);
    setShowCreateMatch(false);
  };

  return (
    <div className={`${isDarkTheme ? 'dark' : ''} min-h-screen bg-background text-foreground`}>
      <div className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Unmatched Ranking System</h1>
            <p className="text-muted-foreground mt-1">Competitive match operations panel</p>
          </div>
          <ThemeToggle isDark={isDarkTheme} onToggle={() => setIsDarkTheme(!isDarkTheme)} />
        </div>
      </div>

      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {currentView === 'dashboard' && (
        <DashboardView
          players={players}
          recentMatches={matches}
          activeTournaments={tournaments.filter(t => t.status !== 'completed')}
          onCreateMatch={handleCreateMatch}
          onCreateTournament={() => setCurrentView('tournaments')}
        />
      )}

      {currentView === 'players' && (
        <PlayersView
          players={players}
          onAddPlayer={() => alert('Add player feature coming soon')}
        />
      )}

      {currentView === 'matches' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1>Matches</h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleCreateMatch('1v1')}
                className="px-4 py-2 bg-[var(--competitive-accent)] text-white rounded hover:opacity-90"
              >
                New 1v1
              </button>
              <button
                onClick={() => handleCreateMatch('2v2')}
                className="px-4 py-2 bg-[var(--competitive-accent)] text-white rounded hover:opacity-90"
              >
                New 2v2
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-muted rounded font-mono">{match.format}</span>
                    <span className="px-3 py-1 bg-muted rounded font-mono">{match.status}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {match.date.toLocaleDateString()}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 items-center">
                  <div className="text-center md:text-left">
                    <h3 className={match.winner?.id === match.team1.id ? 'text-[var(--tier-c)]' : ''}>
                      {match.team1.players.map(p => p.name).join(' & ')}
                    </h3>
                    <div className="text-muted-foreground mt-1">
                      {match.team1.players.map(p => p.rating).join(' / ')}
                    </div>
                  </div>

                  <div className="text-center text-muted-foreground">
                    VS
                  </div>

                  <div className="text-center md:text-right">
                    <h3 className={match.winner?.id === match.team2.id ? 'text-[var(--tier-c)]' : ''}>
                      {match.team2.players.map(p => p.name).join(' & ')}
                    </h3>
                    <div className="text-muted-foreground mt-1">
                      {match.team2.players.map(p => p.rating).join(' / ')}
                    </div>
                  </div>
                </div>

                {match.characterSelections && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-muted-foreground mb-2">Character Selections:</div>
                    <div className="flex flex-wrap gap-2">
                      {match.characterSelections.map((sel) => {
                        const player = players.find(p => p.id === sel.playerId);
                        const character = mockCharacters.find(c => c.id === sel.characterId);
                        return (
                          <div key={sel.playerId} className="px-3 py-1 bg-muted rounded text-sm">
                            {player?.name}: {character?.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'tournaments' && (
        <TournamentsView
          tournaments={tournaments}
          players={players}
          onCreateTournament={() => alert('Tournament creation coming soon')}
          onMatchResult={(tournamentId, matchId, winnerId) => {
            alert(`Match result: winner ${winnerId}`);
          }}
        />
      )}

      {currentView === 'history' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="mb-6">Match History</h1>
          <div className="space-y-4">
            {matches
              .filter(m => m.status === 'completed')
              .map((match) => (
                <div key={match.id} className="bg-card border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-muted rounded font-mono">{match.format}</span>
                    <span className="text-muted-foreground">
                      {match.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={match.winner?.id === match.team1.id ? 'text-[var(--tier-c)]' : ''}>
                      {match.team1.players.map(p => p.name).join(' & ')}
                    </div>
                    <div className="text-muted-foreground">VS</div>
                    <div className={match.winner?.id === match.team2.id ? 'text-[var(--tier-c)]' : ''}>
                      {match.team2.players.map(p => p.name).join(' & ')}
                    </div>
                  </div>
                  {match.ratingChanges && (
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                      {match.ratingChanges.map((change) => {
                        const player = players.find(p => p.id === change.playerId);
                        return (
                          <div key={change.playerId} className="px-3 py-1 bg-muted rounded text-sm font-mono">
                            {player?.name}: {change.change > 0 ? '+' : ''}{change.change}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {showCreateMatch && (
        <CreateMatchView
          players={players}
          characters={mockCharacters}
          format={createMatchFormat}
          onClose={() => setShowCreateMatch(false)}
          onCreateMatch={handleMatchCreated}
        />
      )}
    </div>
  );
}