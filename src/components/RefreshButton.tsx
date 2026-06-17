'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { refreshPriceAction } from '@/app/actions';

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const result = await refreshPriceAction();
      if (!result.success) {
        alert('Failed to refresh market data: ' + result.error);
      }
    } catch (err) {
      alert('An error occurred while refreshing data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-slate-700 active:scale-[0.98]"
      title="Refresh Market Data"
    >
      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing...' : 'Refresh Market'}
    </button>
  );
}
