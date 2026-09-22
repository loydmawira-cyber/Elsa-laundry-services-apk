import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  dark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ dark, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    className="p-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
  >
    {dark ? <Sun className="w-4 h-4 text-[#F2A93B]" /> : <Moon className="w-4 h-4 text-white" />}
  </button>
);
