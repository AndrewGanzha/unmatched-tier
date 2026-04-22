import { Player } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  rank?: number;
  showStats?: boolean;
  onClick?: () => void;
}

export function PlayerCard({ player, rank, showStats = false, onClick }: PlayerCardProps) {
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0;

  return (
    <div
      className={`
        bg-card border border-border p-4 transition-colors
        ${onClick ? 'cursor-pointer hover:border-[var(--competitive-accent)]' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {rank !== undefined && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-mono">
              #{rank}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3>{player.name}</h3>
            </div>
            <div className="text-muted-foreground font-mono mt-1">
              Rating: {player.rating}
            </div>
          </div>
        </div>

        {showStats && (
          <div className="text-right">
            <div className="text-muted-foreground">
              {player.wins}W / {player.losses}L
            </div>
            <div className={`flex items-center justify-end gap-1 mt-1 ${
              winRate >= 50 ? 'text-[var(--tier-c)]' : 'text-[var(--tier-s)]'
            }`}>
              {winRate >= 50 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="font-mono">{winRate}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
