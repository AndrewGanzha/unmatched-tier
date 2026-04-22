import { Trophy, Users, Swords, History, Target } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Swords },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap
                  ${isActive
                    ? 'border-[var(--competitive-accent)] text-[var(--competitive-accent)]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
