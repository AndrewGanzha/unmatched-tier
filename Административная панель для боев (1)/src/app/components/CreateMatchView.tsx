import { useState } from 'react';
import { Player, Character, MatchFormat } from '../types';
import { CharacterCard } from './CharacterCard';
import { getAvailableCharacters, calculateBalancingExplanation } from '../utils/balancing';
import { X, ArrowRight, Users, Swords } from 'lucide-react';

interface CreateMatchViewProps {
  players: Player[];
  characters: Character[];
  format: MatchFormat;
  onClose: () => void;
  onCreateMatch: (data: {
    format: MatchFormat;
    team1PlayerIds: string[];
    team2PlayerIds: string[];
    characterSelections: { playerId: string; characterId: string }[];
  }) => void;
}

export function CreateMatchView({
  players,
  characters,
  format,
  onClose,
  onCreateMatch,
}: CreateMatchViewProps) {
  const [step, setStep] = useState<'players' | 'characters'>('players');
  const [team1PlayerIds, setTeam1PlayerIds] = useState<string[]>([]);
  const [team2PlayerIds, setTeam2PlayerIds] = useState<string[]>([]);
  const [characterSelections, setCharacterSelections] = useState<Record<string, string>>({});

  const playersPerTeam = format === '1v1' ? 1 : 2;
  const allSelectedPlayerIds = [...team1PlayerIds, ...team2PlayerIds];
  const selectedCharacterIds = Object.values(characterSelections);

  const togglePlayerTeam1 = (playerId: string) => {
    if (team1PlayerIds.includes(playerId)) {
      setTeam1PlayerIds(team1PlayerIds.filter(id => id !== playerId));
    } else if (team1PlayerIds.length < playersPerTeam) {
      setTeam1PlayerIds([...team1PlayerIds, playerId]);
    }
  };

  const togglePlayerTeam2 = (playerId: string) => {
    if (team2PlayerIds.includes(playerId)) {
      setTeam2PlayerIds(team2PlayerIds.filter(id => id !== playerId));
    } else if (team2PlayerIds.length < playersPerTeam) {
      setTeam2PlayerIds([...team2PlayerIds, playerId]);
    }
  };

  const canProceedToCharacters =
    team1PlayerIds.length === playersPerTeam &&
    team2PlayerIds.length === playersPerTeam;

  const canCreateMatch = Object.keys(characterSelections).length === allSelectedPlayerIds.length;

  const handleSelectCharacter = (playerId: string, characterId: string) => {
    setCharacterSelections({
      ...characterSelections,
      [playerId]: characterId,
    });
  };

  const handleCreate = () => {
    onCreateMatch({
      format,
      team1PlayerIds,
      team2PlayerIds,
      characterSelections: Object.entries(characterSelections).map(([playerId, characterId]) => ({
        playerId,
        characterId,
      })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2>Create {format} Match</h2>
            <p className="text-muted-foreground mt-1">
              {step === 'players' ? 'Select Players' : 'Assign Characters'}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {step === 'players' && (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border border-border p-4">
                <h3 className="mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Team 1 ({team1PlayerIds.length}/{playersPerTeam})
                </h3>
                <div className="space-y-2">
                  {players.map((player) => {
                    const isSelected = team1PlayerIds.includes(player.id);
                    const isInOtherTeam = team2PlayerIds.includes(player.id);
                    const isDisabled = isInOtherTeam || (!isSelected && team1PlayerIds.length >= playersPerTeam);

                    return (
                      <button
                        key={player.id}
                        onClick={() => !isDisabled && togglePlayerTeam1(player.id)}
                        disabled={isDisabled}
                        className={`
                          w-full p-3 border-2 transition-all text-left
                          ${isSelected
                            ? 'border-[var(--competitive-accent)] bg-[var(--competitive-accent)]/10'
                            : 'border-border hover:border-muted-foreground'
                          }
                          ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{player.name}</span>
                          <span className="font-mono text-muted-foreground">{player.rating}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border border-border p-4">
                <h3 className="mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Team 2 ({team2PlayerIds.length}/{playersPerTeam})
                </h3>
                <div className="space-y-2">
                  {players.map((player) => {
                    const isSelected = team2PlayerIds.includes(player.id);
                    const isInOtherTeam = team1PlayerIds.includes(player.id);
                    const isDisabled = isInOtherTeam || (!isSelected && team2PlayerIds.length >= playersPerTeam);

                    return (
                      <button
                        key={player.id}
                        onClick={() => !isDisabled && togglePlayerTeam2(player.id)}
                        disabled={isDisabled}
                        className={`
                          w-full p-3 border-2 transition-all text-left
                          ${isSelected
                            ? 'border-[var(--competitive-accent)] bg-[var(--competitive-accent)]/10'
                            : 'border-border hover:border-muted-foreground'
                          }
                          ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{player.name}</span>
                          <span className="font-mono text-muted-foreground">{player.rating}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('characters')}
              disabled={!canProceedToCharacters}
              className={`
                w-full py-3 rounded flex items-center justify-center gap-2 transition-opacity
                ${canProceedToCharacters
                  ? 'bg-[var(--competitive-accent)] text-white hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                }
              `}
            >
              Proceed to Character Selection
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 'characters' && (
          <div className="p-6">
            {allSelectedPlayerIds.map((playerId) => {
              const player = players.find(p => p.id === playerId)!;
              const availableChars = getAvailableCharacters(player, characters, selectedCharacterIds);
              const explanation = calculateBalancingExplanation(player);
              const selectedCharId = characterSelections[playerId];

              return (
                <div key={playerId} className="mb-8 border border-border p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3>{player.name}</h3>
                      <span className="font-mono text-muted-foreground">Rating: {player.rating}</span>
                    </div>
                    <p className="text-muted-foreground">{explanation}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {availableChars.map((char) => (
                      <CharacterCard
                        key={char.id}
                        character={char}
                        isSelected={selectedCharId === char.id}
                        isDisabled={selectedCharacterIds.includes(char.id) && selectedCharId !== char.id}
                        onClick={() => handleSelectCharacter(playerId, char.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('players')}
                className="flex-1 py-3 border border-border rounded hover:border-muted-foreground transition-colors"
              >
                Back to Players
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreateMatch}
                className={`
                  flex-1 py-3 rounded transition-opacity
                  ${canCreateMatch
                    ? 'bg-[var(--competitive-accent)] text-white hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  }
                `}
              >
                Create Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
