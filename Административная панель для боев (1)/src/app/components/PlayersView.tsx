import { Player } from '../types';
import { PlayerCard } from './PlayerCard';
import { Plus, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface PlayersViewProps {
  players: Player[];
  onAddPlayer: () => void;
}

type SortKey = 'rating' | 'wins' | 'winRate';

export function PlayersView({ players, onAddPlayer }: PlayersViewProps) {
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'wins':
        return b.wins - a.wins;
      case 'winRate': {
        const aWinRate = a.wins / (a.wins + a.losses || 1);
        const bWinRate = b.wins / (b.wins + b.losses || 1);
        return bWinRate - aWinRate;
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Player Rankings</h1>
        <button
          onClick={onAddPlayer}
          className="px-4 py-2 bg-[var(--competitive-accent)] text-white rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={18} />
          Add Player
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSortBy('rating')}
          className={`px-4 py-2 rounded border transition-colors whitespace-nowrap ${
            sortBy === 'rating'
              ? 'border-[var(--competitive-accent)] bg-[var(--competitive-accent)]/10 text-[var(--competitive-accent)]'
              : 'border-border text-muted-foreground hover:border-muted-foreground'
          }`}
        >
          By Rating
        </button>
        <button
          onClick={() => setSortBy('wins')}
          className={`px-4 py-2 rounded border transition-colors whitespace-nowrap ${
            sortBy === 'wins'
              ? 'border-[var(--competitive-accent)] bg-[var(--competitive-accent)]/10 text-[var(--competitive-accent)]'
              : 'border-border text-muted-foreground hover:border-muted-foreground'
          }`}
        >
          By Wins
        </button>
        <button
          onClick={() => setSortBy('winRate')}
          className={`px-4 py-2 rounded border transition-colors whitespace-nowrap ${
            sortBy === 'winRate'
              ? 'border-[var(--competitive-accent)] bg-[var(--competitive-accent)]/10 text-[var(--competitive-accent)]'
              : 'border-border text-muted-foreground hover:border-muted-foreground'
          }`}
        >
          By Win Rate
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedPlayers.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={index + 1}
            showStats
          />
        ))}
      </div>
    </div>
  );
}
