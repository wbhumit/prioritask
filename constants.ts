import { Priority, Complexity } from './types';
import { AlertCircle, Clock, Coffee, Zap } from 'lucide-react';

export const PRIORITY_CONFIG = {
  [Priority.P1]: { label: 'Critical', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: Zap },
  [Priority.P2]: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  [Priority.P3]: { label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  [Priority.P4]: { label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Coffee },
};

export const COMPLEXITY_CONFIG = {
  [Complexity.E]: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', short: 'E' },
  [Complexity.M]: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', short: 'M' },
  [Complexity.H]: { label: 'Hard', color: 'bg-purple-100 text-purple-700 border-purple-200', short: 'H' },
};

// Sorting Weights: Lower number = Higher Priority
export const PRIORITY_WEIGHTS = {
  [Priority.P1]: 1,
  [Priority.P2]: 2,
  [Priority.P3]: 3,
  [Priority.P4]: 4,
};

export const COMPLEXITY_WEIGHTS = {
  [Complexity.E]: 1,
  [Complexity.M]: 2,
  [Complexity.H]: 3,
};
