'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { DailyPrice } from '@/lib/types';

/**
 * Helper to ensure a value is a valid number, defaults to 0 if NaN.
 */
function safeNumber(val: any, precision: number = 2): number {
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : parseFloat(n.toFixed(precision));
}

export async function depositCash(formData: FormData) {
  try {
    const amountStr = formData.get('amount') as string;
    const date = formData.get('date') as string;
    
    const amount = safeNumber(amountStr, 2);

    if (amount <= 0) throw new Error('Deposit amount must be greater than zero');
    if (!date) throw new Error('Date is required');

    // 1. Fetch current wallet
    const { data: wallet } = await supabaseAdmin
      .from('user_wallet')
      .select('*')
      .single();

    const currentBalance = wallet ? safeNumber((wallet as any).available_myr, 2) : 0;
    const walletId = (wallet as any)?.id || 1;
    
    // 2. Update Wallet
    const { error: walletError } = await supabaseAdmin
      .from('user_wallet')
      .upsert({
        id: walletId,
        available_myr: currentBalance + amount,
        last_updated: new Date().toISOString(),
      } as any);

    if (walletError) throw walletError;

    // 3. Log Ledger
    const { error: ledgerError } = await supabaseAdmin
      .from('portfolio_ledger')
      .insert({
        transaction_date: date,
        transaction_type: 'DEPOSIT',
        amount_myr: amount,
      } as any);

    if (ledgerError) throw ledgerError;

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Deposit Error:', error);
    return { success: false, error: error.message };
  }
}

export async function executeBuy(formData: FormData) {
  try {
    const unitsStr = formData.get('units') as string;
    const priceStr = formData.get('price') as string;
    const date = formData.get('date') as string;

    const units = safeNumber(unitsStr, 6);
    const pricePerUnit = safeNumber(priceStr, 4);

    if (units <= 0) throw new Error('Quantity must be greater than zero');
    if (pricePerUnit <= 0) throw new Error('Price must be greater than zero');
    if (!date) throw new Error('Date is required');

    const totalCost = safeNumber(units * pricePerUnit, 2);

    // 1. Fetch current wallet
    const { data: wallet } = await supabaseAdmin
      .from('user_wallet')
      .select('*')
      .single();

    if (!wallet) {
      throw new Error('Wallet not initialized. Please deposit funds first.');
    }

    const currentBalance = safeNumber((wallet as any).available_myr, 2);
    const currentUnits = safeNumber((wallet as any).total_units_owned, 6);

    if (currentBalance < totalCost) {
      throw new Error(`Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${currentBalance.toFixed(2)}`);
    }

    // 2. Update Wallet
    const { error: walletError } = await supabaseAdmin
      .from('user_wallet')
      .upsert({
        id: (wallet as any).id,
        available_myr: currentBalance - totalCost,
        total_units_owned: currentUnits + units,
        last_updated: new Date().toISOString(),
      } as any);

    if (walletError) throw walletError;

    // 3. Log Ledger
    const { error: ledgerError } = await supabaseAdmin
      .from('portfolio_ledger')
      .insert({
        transaction_date: date,
        transaction_type: 'BUY_EXECUTION',
        amount_myr: totalCost,
        price_per_unit: pricePerUnit,
        units_transacted: units,
      } as any);

    if (ledgerError) throw ledgerError;

    revalidatePath('/');
    return { success: true };
    } catch (error: any) {
    console.error('Purchase Error:', error);
    return { success: false, error: error.message };
    }
    }

    export async function resetActivity() {
    try {
    // 1. Delete all ledger entries
    const { error: ledgerError } = await supabaseAdmin
      .from('portfolio_ledger')
      .delete()
      .neq('id', 0); // Delete all rows where id is not 0 (effectively all)

    if (ledgerError) throw ledgerError;

    // 2. Reset wallet to zero
    const { data: wallet } = await supabaseAdmin
      .from('user_wallet')
      .select('id')
      .single();

    if (wallet) {
      const { error: walletError } = await supabaseAdmin
        .from('user_wallet')
        .update({
          available_myr: 0,
          total_units_owned: 0,
          last_updated: new Date().toISOString(),
        } as any)
        .eq('id', (wallet as any).id);

      if (walletError) throw walletError;
    }

    revalidatePath('/');
    return { success: true };
    } catch (error: any) {
    console.error('Reset Error:', error);
    return { success: false, error: error.message };
    }
    }


export async function refreshPriceAction() {
  const { YahooFinance } = await import('yahoo-finance2');
  const yahooFinance = new YahooFinance();
  const { calculateSMA, calculateRSI } = await import('@/lib/indicators');
  const { updateAISignal } = await import('@/lib/ai-logic');

  const TICKER = 'VOO';

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 200);

    const result = (await yahooFinance.historical(TICKER, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    })) as any[];

    if (!result || result.length === 0) throw new Error('No price data found');

    const chronologicalData = result.sort((a, b) => a.date.getTime() - b.date.getTime());
    const prices = chronologicalData.map(d => d.close);
    const latest = chronologicalData[chronologicalData.length - 1];

    const sma30 = calculateSMA(prices, 30);
    const sma100 = calculateSMA(prices, 100);
    const rsi14 = calculateRSI(prices, 14);

    const priceDate = latest.date.toISOString().split('T')[0];

    const { data: priceData, error: priceError } = await supabaseAdmin
      .from('daily_prices')
      .upsert({
        ticker: TICKER,
        price_date: priceDate,
        closing_price: latest.close,
        sma_30: sma30,
        sma_100: sma100,
        rsi_14: rsi14,
      } as any, { onConflict: 'price_date' })
      .select()
      .single();

    if (priceError) throw priceError;
    
    await updateAISignal(priceData as DailyPrice);
    
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Refresh Action Error:', error);
    return { success: false, error: error.message };
  }
}
