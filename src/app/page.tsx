import { supabaseAdmin } from '@/lib/supabase';
import { 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  History,
  Coins,
  ArrowRightLeft,
  Zap,
  LineChart as LineChartIcon,
  LogOut
} from 'lucide-react';
import { depositCash, executeBuy, resetActivity } from './actions';
import { signOut } from './login/actions';
import { RefreshButton } from '@/components/RefreshButton';
import PriceChart from '@/components/PriceChart';
import TradingViewWidget from '@/components/TradingViewWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TransactionForms } from '@/components/TransactionForms';
import { ResetButton } from '@/components/ResetButton';
import { Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [
    { data: latestPrice },
    { data: wallet },
    { data: latestSignal },
    { data: ledger },
    { data: historicalPrices }
  ] = await Promise.all([
    supabaseAdmin.from('daily_prices').select('*').order('price_date', { ascending: false }).limit(1).single(),
    supabaseAdmin.from('user_wallet').select('*').single(),
    supabaseAdmin.from('ai_signals').select('*').order('created_at', { ascending: false }).limit(1).single(),
    supabaseAdmin.from('portfolio_ledger').select('*').order('transaction_date', { ascending: false }).limit(5),
    supabaseAdmin.from('daily_prices').select('*').order('price_date', { ascending: false }).limit(30)
  ]);

  return {
    latestPrice: (latestPrice as any),
    wallet: (wallet as any),
    latestSignal: (latestSignal as any),
    ledger: (ledger as any[]) || [],
    historicalPrices: (historicalPrices as any[]) || []
  };
}

export default async function DashboardPage() {
  const { latestPrice, wallet, latestSignal, ledger, historicalPrices } = await getDashboardData();

  const price = latestPrice?.closing_price || 0;
  const units = Number(wallet?.total_units_owned) || 0;
  const cash = Number(wallet?.available_myr) || 0;
  const portfolioValue = units * price;
  
  // Simplified calculation for Total Invested
  const totalInvested = ledger?.reduce((acc, curr) => {
    if (curr.transaction_type === 'DEPOSIT') return acc + Number(curr.amount_myr);
    return acc;
  }, 0) || 0;

  const profitLoss = portfolioValue - (totalInvested - cash); // Simple ROI calculation
  const profitLossPct = totalInvested > 0 ? (profitLoss / (totalInvested - cash)) * 100 : 0;

  const signalColors = {
    ACCUMULATING: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
    WARNING_OVERBOUGHT: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400',
    BUY_DIP: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse',
    STANDARD_HOLD: 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    TRIM_PROFIT: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400',
  };

  const signalLabels = {
    ACCUMULATING: 'SAVING CASH',
    WARNING_OVERBOUGHT: 'MARKET TOO HOT',
    BUY_DIP: 'GREAT PRICE',
    STANDARD_HOLD: 'STAY THE COURSE',
    TRIM_PROFIT: 'TAKE PROFITS',
  };

  const status = latestSignal?.signal_status as keyof typeof signalColors || 'ACCUMULATING';

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 0. Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">Project Aurum</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Smart VOO Savings Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98]">
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* 1. Header & AI Signal Banner */}
      <header className={`glass p-6 rounded-3xl border-l-8 ${signalColors[status]} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {status === 'WARNING_OVERBOUGHT' || status === 'TRIM_PROFIT' ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <CheckCircle2 className="w-5 h-5 text-blue-500" />}
            <h1 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white">{signalLabels[status]}</h1>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {latestSignal?.reasoning_text || "Awaiting daily market update..."}
          </p>
          <div className="pt-2">
            <RefreshButton />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">${Number(price).toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">Market Price</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight text-right">Vanguard S&P 500 (VOO)</div>
        </div>
      </header>

      {/* 2. Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Valuation Card */}
        <div className="glass-card glass-card-hover md:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>My Portfolio Value</span>
          </div>
          <div>
            <div className="text-4xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`text-sm mt-1 font-bold flex items-center gap-1 ${profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <ArrowUpRight className={`w-4 h-4 ${profitLoss >= 0 ? '' : 'rotate-90'}`} />
              {profitLoss >= 0 ? 'Profit: ' : 'Loss: '}${Math.abs(profitLoss).toFixed(2)} ({profitLossPct.toFixed(2)}%)
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shares Owned</div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-200">{units.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg. Cost</div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-200">${(totalInvested > 0 && units > 0 ? (totalInvested - cash) / units : 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Daily Advice Card */}
        <div className={`glass-card glass-card-hover md:col-span-1 border-t-4 ${
          status === 'BUY_DIP' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 
          status === 'WARNING_OVERBOUGHT' ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : 
          status === 'ACCUMULATING' ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-900/10' : 
          status === 'TRIM_PROFIT' ? 'border-amber-600 bg-amber-100/30 dark:bg-amber-900/20' :
          'border-slate-400 bg-slate-50/30 dark:bg-slate-800/10'
        } flex flex-col justify-between`}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>Smart Advice</span>
          </div>
          <div className="py-2">
            <div className={`text-3xl font-black tracking-tighter ${
              status === 'BUY_DIP' ? 'text-blue-600 dark:text-blue-400' : 
              status === 'WARNING_OVERBOUGHT' ? 'text-rose-600 dark:text-rose-400' : 
              status === 'ACCUMULATING' ? 'text-amber-600 dark:text-amber-400' : 
              status === 'TRIM_PROFIT' ? 'text-amber-600 dark:text-amber-500' :
              'text-slate-700 dark:text-slate-300'
            }`}>
              {status === 'BUY_DIP' ? 'BUY THE DIP' : 
               status === 'WARNING_OVERBOUGHT' ? 'HOLD CASH' : 
               status === 'ACCUMULATING' ? 'SAVE MORE' : 
               status === 'TRIM_PROFIT' ? 'TAKE PROFIT' :
               'STEADY SAVING'}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-black">
              {status === 'BUY_DIP' ? 'Great Price Detected' : 
               status === 'WARNING_OVERBOUGHT' ? 'Market Too High' : 
               status === 'ACCUMULATING' ? 'Low Available Funds' : 
               status === 'TRIM_PROFIT' ? 'Lock in some gains' :
               'Normal Market Prices'}
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
               "{latestSignal?.reasoning_text || "Checking market conditions..."}"
             </div>
          </div>
        </div>

        {/* Market Analysis & TradingView Chart Card */}
        <div className="glass-card glass-card-hover md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <LineChartIcon className="w-4 h-4 text-blue-500" />
              <span>LIVE VOO ANALYSIS (TRADINGVIEW)</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-wider text-slate-400 italic">
              Real-time interactive charting
            </div>
          </div>
          
          <TradingViewWidget />

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Market Heat Index</div>
              <div className={`text-lg font-mono font-black ${
                (latestPrice?.rsi_14 || 0) > 70 ? 'text-rose-600 dark:text-rose-400' : 
                (latestPrice?.rsi_14 || 0) < 30 ? 'text-emerald-600 dark:text-emerald-400' : 
                'text-slate-900 dark:text-white'
              }`}>
                {latestPrice?.rsi_14 ? Number(latestPrice.rsi_14).toFixed(1) : '--'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price vs Average</div>
              <div className={`text-lg font-mono font-black ${
                latestPrice?.closing_price < latestPrice?.sma_30 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}>
                {latestPrice?.sma_30 ? (((latestPrice.closing_price / latestPrice.sma_30) - 1) * 100).toFixed(1) + '%' : '--'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">30-Day Range</div>
              <div className="text-lg font-mono font-black text-slate-900 dark:text-white">
                ${Math.min(...historicalPrices.map(p => p.closing_price)).toFixed(0)} - ${Math.max(...historicalPrices.map(p => p.closing_price)).toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Cash Reserve Card */}
        <div className="glass-card glass-card-hover md:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-amber-500" />
            <span>Funds Ready to Buy</span>
          </div>
          <div>
            <div className="text-4xl font-black font-mono tracking-tighter text-blue-600 dark:text-blue-400">${Number(cash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
              These funds are available for your next {Math.floor(cash / price)} shares.
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accumulation Progress</div>
             <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                  style={{ width: `${Math.min((cash / price) * 100, 100)}%` }}
                ></div>
             </div>
          </div>
        </div>

        {/* Transaction Portal */}
        <div className="glass-card glass-card-hover md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <ArrowRightLeft className="w-4 h-4 text-blue-500" />
            <span>Transaction Portal</span>
          </div>
          
          <TransactionForms price={price} />
        </div>

        {/* Audit Logs */}
        <div className="glass-card glass-card-hover md:col-span-1 space-y-6 overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4 text-blue-500" />
            <span>Recent Activity</span>
          </div>
          <div className="space-y-4">
            {ledger.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-1">
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {item.transaction_type === 'DEPOSIT' ? 'Cash Inflow' : `Bought ${Number(item.units_transacted).toFixed(4)} qty`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">{new Date(item.transaction_date).toLocaleDateString()}</div>
                </div>
                <div className={`text-xs font-mono font-black ${item.transaction_type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {item.transaction_type === 'DEPOSIT' ? '+' : '-'} $ {Number(item.amount_myr).toFixed(2)}
                </div>
              </div>
            ))}
            {ledger.length === 0 && (
              <div className="text-xs text-slate-400 italic py-4">No transactions logged yet.</div>
            )}
          </div>
        </div>

      </div>

      {/* Temporary Reset Button */}
      <ResetButton />

      <footer className="text-center py-12 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
        Project Aurum &bull; VOO DCA+ Engine &bull; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
