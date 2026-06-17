'use client';

import { useState, useEffect } from 'react';
import { depositCash, executeBuy } from '@/app/actions';

interface TransactionFormsProps {
  price: number;
}

export function TransactionForms({ price }: TransactionFormsProps) {
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>(Number(price).toFixed(2));
  const [purchaseShares, setPurchaseShares] = useState<string>('');

  // Sync state if market price is refreshed externally
  useEffect(() => {
    setPurchasePrice(Number(price).toFixed(2));
  }, [price]);

  // Auto-calculate shares when amount or price changes (Moomoo style)
  useEffect(() => {
    const amt = parseFloat(purchaseAmount);
    const prc = parseFloat(purchasePrice);
    if (!isNaN(amt) && !isNaN(prc) && prc > 0) {
      // Use 6 decimal places for high precision matching your DB schema
      const calculated = (amt / prc).toFixed(6);
      setPurchaseShares(calculated);
    } else {
      setPurchaseShares('');
    }
  }, [purchaseAmount, purchasePrice]);

  async function handleDeposit(formData: FormData) {
    const result = await depositCash(formData);
    if (result && !result.success) {
      alert('Deposit Failed: ' + result.error);
    }
  }

  async function handleBuy(formData: FormData) {
    const result = await executeBuy(formData);
    if (result && !result.success) {
      alert('Purchase Failed: ' + result.error);
    } else {
      // Clear amount after success
      setPurchaseAmount('');
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Deposit Form */}
      <form action={handleDeposit} className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Add Funds</h3>
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Amount to Add ($)</label>
            <input name="amount" type="number" step="0.01" required className="input-modern input-modern-focus" placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Date</label>
            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="input-modern input-modern-focus text-slate-600 dark:text-slate-300" />
          </div>
          <button type="submit" className="w-full btn-primary">
            Add to Balance
          </button>
        </div>
      </form>

      {/* Buy Form (Moomoo Style) */}
      <form action={handleBuy} className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Log a New Purchase</h3>
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Amount Spent ($)</label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder="How much did you spend?" 
              className="input-modern input-modern-focus font-bold text-blue-600 dark:text-blue-400" 
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Price per Share</label>
                {parseFloat(purchasePrice) === price && (
                  <span className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-tighter animate-pulse">
                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                    Live Sync
                  </span>
                )}
              </div>
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                required 
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="input-modern input-modern-focus" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 px-1 text-emerald-600 dark:text-emerald-400">Shares (Auto)</label>
              <input 
                name="units" 
                type="number" 
                step="any" 
                required 
                readOnly
                value={purchaseShares}
                placeholder="0.0000" 
                className="input-modern bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-80" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Purchase Date</label>
            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="input-modern input-modern-focus text-slate-600 dark:text-slate-300" />
          </div>
          <button type="submit" className="w-full btn-success">
            Save Purchase
          </button>
          <p className="text-[9px] text-slate-400 text-center uppercase tracking-tighter font-bold">
            {purchaseShares ? `You are buying ${purchaseShares} VOO shares` : 'Enter amount to calculate shares'}
          </p>
        </div>
      </form>
    </div>
  );
}
