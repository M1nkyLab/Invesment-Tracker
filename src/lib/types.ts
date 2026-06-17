export type Ticker = 'VOO';

export interface DailyPrice {
  id: number;
  ticker: Ticker;
  price_date: string; // ISO Date string
  closing_price: number;
  sma_30: number | null;
  sma_100: number | null;
  rsi_14: number | null;
  created_at: string;
}

export interface UserWallet {
  id: number;
  available_myr: number;
  total_units_owned: number;
  last_updated: string;
}

export type TransactionType = 'DEPOSIT' | 'BUY_EXECUTION';

export interface PortfolioLedger {
  id: number;
  transaction_date: string;
  transaction_type: TransactionType;
  amount_myr: number;
  price_per_unit: number | null;
  units_transacted: number | null;
  created_at: string;
}

export type SignalStatus = 'ACCUMULATING' | 'WARNING_OVERBOUGHT' | 'BUY_DIP' | 'STANDARD_HOLD' | 'TRIM_PROFIT';

export interface AISignal {
  id: number;
  evaluation_date: string;
  signal_status: SignalStatus;
  reasoning_text: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      daily_prices: {
        Row: DailyPrice;
        Insert: {
          id?: number;
          ticker?: Ticker;
          price_date: string;
          closing_price: number;
          sma_30?: number | null;
          sma_100?: number | null;
          rsi_14?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          ticker?: Ticker;
          price_date?: string;
          closing_price?: number;
          sma_30?: number | null;
          sma_100?: number | null;
          rsi_14?: number | null;
          created_at?: string;
        };
      };
      user_wallet: {
        Row: UserWallet;
        Insert: {
          id?: number;
          available_myr?: number;
          total_units_owned?: number;
          last_updated?: string;
        };
        Update: {
          id?: number;
          available_myr?: number;
          total_units_owned?: number;
          last_updated?: string;
        };
      };
      portfolio_ledger: {
        Row: PortfolioLedger;
        Insert: {
          id?: number;
          transaction_date: string;
          transaction_type: TransactionType;
          amount_myr: number;
          price_per_unit?: number | null;
          units_transacted?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          transaction_date?: string;
          transaction_type?: TransactionType;
          amount_myr?: number;
          price_per_unit?: number | null;
          units_transacted?: number | null;
          created_at?: string;
        };
      };
      ai_signals: {
        Row: AISignal;
        Insert: {
          id?: number;
          evaluation_date: string;
          signal_status: SignalStatus;
          reasoning_text: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          evaluation_date?: string;
          signal_status?: SignalStatus;
          reasoning_text?: string;
          created_at?: string;
        };
      };
    };
  };
}
