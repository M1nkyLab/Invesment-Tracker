import { supabaseAdmin } from './supabase';
import { SignalStatus, DailyPrice, UserWallet } from './types';

export interface SignalResult {
  status: SignalStatus;
  reasoning: string;
}

/**
 * Evaluates the current market state and wallet balance to generate an AI signal.
 */
export async function evaluateAISignal(latestPrice: DailyPrice): Promise<SignalResult> {
  // 1. Fetch User Wallet (Assume single row for now as per PRD)
  const { data: wallet, error: walletError } = await supabaseAdmin
    .from('user_wallet')
    .select('*')
    .single();

  let availableUsd = 0;
  if (walletError || !wallet) {
    console.warn('Wallet not found, using default 0.00 USD');
    availableUsd = 0;
  } else {
    availableUsd = Number((wallet as any).available_myr);
  }

  const { closing_price, sma_30, sma_100, rsi_14 } = latestPrice;
  const microThreshold = 1.00; // Allow micro-buys as low as $1

  const buyTarget = sma_30 ? (Number(sma_30) * 0.97).toFixed(2) : '---';
  const neutralZone = sma_30 ? Number(sma_30).toFixed(2) : '---';

  // 1. Sell/Trim Logic (Priority: Protect Profits)
  
  // High Overbought Extreme
  if (rsi_14 && rsi_14 > 80) {
    return {
      status: 'TRIM_PROFIT',
      reasoning: `URGENT: Market heat is extremely high (${Number(rsi_14).toFixed(1)}/100). The market is overstretched. SELL 30% to lock in profits. Re-entry goal: Buy back when price dips below $${buyTarget}.`
    };
  }

  // Moderate Overbought
  if (rsi_14 && rsi_14 > 75) {
    return {
      status: 'TRIM_PROFIT',
      reasoning: `Market heat is entering a peak zone (${Number(rsi_14).toFixed(1)}/100). SELL 15% to harvest gains. Next opportunity: Look for prices closer to the 30-day average of $${neutralZone}.`
    };
  }

  // 2. Buy/Hold Evaluation Logic Matrix
  
  // State 1: Accumulating (Less than $1 available)
  if (availableUsd < microThreshold) {
    return {
      status: 'ACCUMULATING',
      reasoning: `You have $${availableUsd.toFixed(2)} ready. Your optimal "Buy Dip" target is currently $${buyTarget}. Add more funds to catch the next correction.`
    };
  }

  // State 2: Warning (Standard Overbought)
  if (rsi_14 && rsi_14 > 70) {
    return {
      status: 'WARNING_OVERBOUGHT',
      reasoning: `Market is "too hot" (${Number(rsi_14).toFixed(1)}/100). Prices are likely at a local peak. DO NOT BUY. Strategic target: Wait for price to drop below $${buyTarget}.`
    };
  }

  // State 3: Opportunistic Buy (DCA+)
  // Condition: Price <= 3% below 30-day SMA AND Price > 100-day SMA (macro uptrend)
  if (sma_30 && sma_100 && closing_price <= Number(sma_30) * 0.97 && closing_price > Number(sma_100)) {
    return {
      status: 'BUY_DIP',
      reasoning: `DCA+ OPPORTUNITY: Price is more than 3% below the average. BUY NOW with your $${availableUsd.toFixed(2)}. You are getting a great deal compared to the $${neutralZone} average price.`
    };
  }

  // State 4: Standard Hold / Buy
  return {
    status: 'STANDARD_HOLD',
    reasoning: `Market is neutral. Current price is fair compared to the $${neutralZone} average. Continue regular saving. Pro Tip: Set a limit order for a deep dip at $${buyTarget}.`
  };
}

/**
 * Records the AI signal in the database.
 */
export async function updateAISignal(latestPrice: DailyPrice) {
  const result = await evaluateAISignal(latestPrice);

  const { error } = await supabaseAdmin
    .from('ai_signals')
    .upsert({
      evaluation_date: latestPrice.price_date,
      signal_status: result.status,
      reasoning_text: result.reasoning,
    } as any, { onConflict: 'evaluation_date' });

  if (error) {
    console.error('Error updating AI Signal:', error);
    throw error;
  }

  return result;
}
