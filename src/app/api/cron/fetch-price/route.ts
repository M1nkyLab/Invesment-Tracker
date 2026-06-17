import { NextRequest, NextResponse } from 'next/server';
import { YahooFinance } from 'yahoo-finance2';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateSMA, calculateRSI } from '@/lib/indicators';
import { updateAISignal } from '@/lib/ai-logic';
import { DailyPrice } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TICKER = 'VOO';
const yahooFinance = new YahooFinance();

export async function GET(req: NextRequest) {
  // Simple authorization check for Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch historical data (need at least 100 days for SMA 100)
    // We'll fetch 200 days to be safe with weekends/holidays and chart continuity
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 200);

    const result = (await yahooFinance.historical(TICKER, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    })) as any[];

    if (!result || result.length === 0) {
      throw new Error('No price data found');
    }

    // Sort by date ascending to calculate technicals correctly, then descending for the latest
    const chronologicalData = result.sort((a, b) => a.date.getTime() - b.date.getTime());
    const allClosingPrices = chronologicalData.map(d => d.close);
    
    // Sort descending for the latest price insertion
    const sortedData = [...chronologicalData].sort((a, b) => b.date.getTime() - a.date.getTime());
    const latest = sortedData[0];

    // 2. Calculate Indicators
    const sma30 = calculateSMA(allClosingPrices, 30);
    const sma100 = calculateSMA(allClosingPrices, 100);
    const rsi14 = calculateRSI(allClosingPrices, 14);

    const priceDate = latest.date.toISOString().split('T')[0];
    const closingPrice = latest.close;

    // 3. Update Supabase
    // We upsert based on (ticker, price_date) to keep historical records unique
    const { data: priceData, error: priceError } = await supabaseAdmin
      .from('daily_prices')
      .upsert({
        ticker: TICKER,
        price_date: priceDate,
        closing_price: closingPrice,
        sma_30: sma30,
        sma_100: sma100,
        rsi_14: rsi14,
      } as any, { onConflict: 'price_date' })
      .select()
      .single();

    if (priceError) throw priceError;

    // 4. Update AI Signal
    const signalResult = await updateAISignal(priceData as DailyPrice);

    return NextResponse.json({
      success: true,
      data: {
        date: priceDate,
        price: closingPrice,
        sma30,
        sma100,
        rsi14,
        signal: signalResult,
      }
    });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
