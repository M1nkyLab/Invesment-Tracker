'use client';

import { Trash2 } from 'lucide-react';
import { resetActivity } from '@/app/actions';

export function ResetButton() {
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (confirm('Are you sure you want to delete all activity? This cannot be undone.')) {
      const result = await resetActivity();
      if (!result.success) {
        alert('Failed to reset: ' + result.error);
      }
    }
  }

  return (
    <div className="flex justify-center pt-8">
      <form onSubmit={handleReset}>
        <button 
          type="submit" 
          className="flex items-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] border border-rose-200 dark:border-rose-900/30 shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Reset All Activity & Start Fresh
        </button>
      </form>
    </div>
  );
}
