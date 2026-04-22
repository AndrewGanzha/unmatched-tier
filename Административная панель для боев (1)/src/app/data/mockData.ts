import { Character, Player, Match, Tournament } from '../types';

export const mockCharacters: Character[] = [
  // S Tier
  {
    id: 'c1',
    name: 'Медуза',
    tier: 'S',
    rating: 950,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/3-medusa.png'
  },
  {
    id: 'c2',
    name: 'Король Артур',
    tier: 'S',
    rating: 940,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/1-king-arthur.png'
  },
  {
    id: 'c3',
    name: 'Синбад',
    tier: 'S',
    rating: 930,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/4-sinbad.png'
  },

  // A Tier
  {
    id: 'c4',
    name: 'Брюс Ли',
    tier: 'A',
    rating: 850,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/5-bruce-lee.png'
  },
  {
    id: 'c5',
    name: 'Шерлок Холмс',
    tier: 'A',
    rating: 840,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/13-sherlock-holmes.png'
  },
  {
    id: 'c6',
    name: 'Алиса',
    tier: 'A',
    rating: 830,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/2-alice.png'
  },
  {
    id: 'c7',
    name: 'Беовульф',
    tier: 'A',
    rating: 820,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/19-beowulf.png'
  },

  // B Tier
  {
    id: 'c8',
    name: 'Робин Гуд',
    tier: 'B',
    rating: 750,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/6-robin-hood.png'
  },
  {
    id: 'c9',
    name: 'Дракула',
    tier: 'B',
    rating: 740,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/22-bloody-mary.png'
  },
  {
    id: 'c10',
    name: 'Ахилл',
    tier: 'B',
    rating: 730,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/21-achilles.png'
  },
  {
    id: 'c11',
    name: 'Бигфут',
    tier: 'B',
    rating: 720,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/7-bigfoot.png'
  },

  // C Tier
  {
    id: 'c12',
    name: 'Рэптор',
    tier: 'C',
    rating: 650,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/9-raptors.png'
  },
  {
    id: 'c13',
    name: 'Йенк',
    tier: 'C',
    rating: 640,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/24-yennega.png'
  },
  {
    id: 'c14',
    name: 'Красная Шапочка',
    tier: 'C',
    rating: 630,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/18-little-red.png'
  },

  // D Tier
  {
    id: 'c15',
    name: 'Дэдпул',
    tier: 'D',
    rating: 550,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/20-deadpool.png'
  },
  {
    id: 'c16',
    name: 'Инвизибл Мен',
    tier: 'D',
    rating: 540,
    imageUrl: 'https://tiermaker.com/images/media/template_images/2024/16010850/unmatched-fighter-tier-list-january-2024-16010850/12-invisible-man.png'
  },
];

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Александр',
    rating: 1200,
    wins: 15,
    losses: 8,
    wins1v1: 10,
    losses1v1: 5,
    wins2v2: 5,
    losses2v2: 3,
  },
  {
    id: 'p2',
    name: 'Дмитрий',
    rating: 1050,
    wins: 12,
    losses: 10,
    wins1v1: 7,
    losses1v1: 6,
    wins2v2: 5,
    losses2v2: 4,
  },
  {
    id: 'p3',
    name: 'Ирина',
    rating: 950,
    wins: 10,
    losses: 9,
    wins1v1: 6,
    losses1v1: 5,
    wins2v2: 4,
    losses2v2: 4,
  },
  {
    id: 'p4',
    name: 'Максим',
    rating: 850,
    wins: 8,
    losses: 12,
    wins1v1: 5,
    losses1v1: 7,
    wins2v2: 3,
    losses2v2: 5,
  },
  {
    id: 'p5',
    name: 'Елена',
    rating: 750,
    wins: 6,
    losses: 14,
    wins1v1: 4,
    losses1v1: 9,
    wins2v2: 2,
    losses2v2: 5,
  },
  {
    id: 'p6',
    name: 'Сергей',
    rating: 650,
    wins: 4,
    losses: 16,
    wins1v1: 3,
    losses1v1: 10,
    wins2v2: 1,
    losses2v2: 6,
  },
];

export const mockMatches: Match[] = [
  {
    id: 'm1',
    format: '1v1',
    status: 'completed',
    team1: {
      id: 't1',
      players: [mockPlayers[0]],
    },
    team2: {
      id: 't2',
      players: [mockPlayers[1]],
    },
    winner: {
      id: 't1',
      players: [mockPlayers[0]],
    },
    date: new Date('2026-04-20'),
    ratingChanges: [
      { playerId: 'p1', change: 15 },
      { playerId: 'p2', change: -15 },
    ],
  },
  {
    id: 'm2',
    format: '2v2',
    status: 'completed',
    team1: {
      id: 't3',
      players: [mockPlayers[0], mockPlayers[2]],
    },
    team2: {
      id: 't4',
      players: [mockPlayers[1], mockPlayers[3]],
    },
    winner: {
      id: 't4',
      players: [mockPlayers[1], mockPlayers[3]],
    },
    date: new Date('2026-04-21'),
    ratingChanges: [
      { playerId: 'p1', change: -12 },
      { playerId: 'p3', change: -12 },
      { playerId: 'p2', change: 12 },
      { playerId: 'p4', change: 12 },
    ],
  },
];

export const mockTournaments: Tournament[] = [
  {
    id: 'tour1',
    name: 'Весенний турнир 2026',
    format: '1v1',
    status: 'in_progress',
    participants: [
      { id: 't1', players: [mockPlayers[0]] },
      { id: 't2', players: [mockPlayers[1]] },
      { id: 't3', players: [mockPlayers[2]] },
      { id: 't4', players: [mockPlayers[3]] },
    ],
    matches: [
      {
        id: 'tm1',
        format: '1v1',
        status: 'completed',
        team1: { id: 't1', players: [mockPlayers[0]] },
        team2: { id: 't2', players: [mockPlayers[1]] },
        winner: { id: 't1', players: [mockPlayers[0]] },
        date: new Date('2026-04-16'),
      },
      {
        id: 'tm2',
        format: '1v1',
        status: 'completed',
        team1: { id: 't3', players: [mockPlayers[2]] },
        team2: { id: 't4', players: [mockPlayers[3]] },
        winner: { id: 't3', players: [mockPlayers[2]] },
        date: new Date('2026-04-16'),
      },
      {
        id: 'tm3',
        format: '1v1',
        status: 'pending',
        team1: { id: 't1', players: [mockPlayers[0]] },
        team2: { id: 't3', players: [mockPlayers[2]] },
        date: new Date('2026-04-22'),
      },
    ],
    currentRound: 2,
    totalRounds: 2,
    createdAt: new Date('2026-04-15'),
  },
  {
    id: 'tour2',
    name: 'Командный чемпионат',
    format: '2v2',
    status: 'completed',
    participants: [
      { id: 'tt1', players: [mockPlayers[0], mockPlayers[1]] },
      { id: 'tt2', players: [mockPlayers[2], mockPlayers[3]] },
    ],
    matches: [
      {
        id: 'tm4',
        format: '2v2',
        status: 'completed',
        team1: { id: 'tt1', players: [mockPlayers[0], mockPlayers[1]] },
        team2: { id: 'tt2', players: [mockPlayers[2], mockPlayers[3]] },
        winner: { id: 'tt1', players: [mockPlayers[0], mockPlayers[1]] },
        date: new Date('2026-04-10'),
      },
    ],
    winner: { id: 'tt1', players: [mockPlayers[0], mockPlayers[1]] },
    currentRound: 1,
    totalRounds: 1,
    createdAt: new Date('2026-04-10'),
  },
];
