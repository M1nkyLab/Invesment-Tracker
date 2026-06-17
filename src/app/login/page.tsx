'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import { 
  Coins, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      if (isLogin) {
        const result = await login(formData);
        if (result?.error) setError(result.error);
      } else {
        const result = await signup(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          setMessage('Check your email to confirm your account!');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-50">
      <div className="w-full max-w-[440px] space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600 shadow-xl shadow-blue-200 mb-4">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Project Aurum</h1>
          <p className="text-slate-500 font-medium">Your Smart DCA+ VOO Command Center</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card bg-white p-8 rounded-[32px] shadow-xl shadow-blue-500/5 border border-slate-200/60">
          <div className="space-y-6">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="input-modern input-modern-focus w-full pl-12"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    minLength={6}
                    className="input-modern input-modern-focus w-full pl-12"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {message && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 h-auto text-base group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
          Secure &bull; Encrypted &bull; Smart DCA+
        </p>
      </div>
    </main>
  );
}
