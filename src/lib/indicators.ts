/**
 * Calculates the Simple Moving Average (SMA)
 * @param prices Array of numbers (prices)
 * @param period SMA period (e.g., 30, 100)
 * @returns SMA value or null if insufficient data
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(0, period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculates the Relative Strength Index (RSI)
 * @param prices Array of numbers (prices)
 * @param period RSI period (default 14)
 * @returns RSI value or null if insufficient data
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length <= period) return null;

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = prices.length - 2; i >= prices.length - period - 1; i--) {
    const change = prices[i] - prices[i + 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Wilder's Smoothing Method (if we had more history, we'd use this iteratively)
  // For a single daily calculation with limited history, we'll use the basic version
  // or a slightly more refined version if history is available.
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}
