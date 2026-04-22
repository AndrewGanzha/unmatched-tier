import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded border border-border hover:border-muted-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
