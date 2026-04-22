import { Character } from '../types';
import { getTierColor } from '../utils/balancing';

interface CharacterCardProps {
  character: Character;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export function CharacterCard({ character, isSelected, isDisabled, onClick }: CharacterCardProps) {
  const tierColor = getTierColor(character.tier);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        border-2 transition-all text-left w-full overflow-hidden
        ${isSelected
          ? 'border-[var(--competitive-accent)] bg-[var(--competitive-accent)]/10'
          : 'border-border hover:border-muted-foreground bg-card'
        }
        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {character.imageUrl && (
        <div className="w-full aspect-square bg-muted overflow-hidden">
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-sm">{character.name}</h4>
            <div className="text-muted-foreground font-mono mt-1 text-xs">
              {character.rating}
            </div>
          </div>
          <div
            className="px-2 py-1 rounded text-xs font-mono shrink-0"
            style={{
              backgroundColor: `${tierColor}20`,
              color: tierColor,
              border: `1px solid ${tierColor}`
            }}
          >
            {character.tier}
          </div>
        </div>
      </div>
    </button>
  );
}
