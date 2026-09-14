import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

interface PasswordScreenProps {
  onSuccess: () => void;
}

export const PasswordScreen: React.FC<PasswordScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '4649') {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6">
        {/* NCC Logo & Branding */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center shadow-md text-white font-bold tracking-wider text-2xl">
            NCC
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">入金伝票作成システム</h1>
            <p className="text-xs text-slate-500 mt-1">NCC 財務会計・入金管理ポータル</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="password-input" 
                className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-slate-500" />
                  パスワードを入力してください
                </span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  初期: 4649
                </span>
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                  placeholder="••••"
                  className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-red-400 bg-red-50 focus:ring-red-300'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  認証
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  パスワードが間違っています。もう一度入力してください。
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setPassword('4649');
                onSuccess();
              }}
              className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              ワンクリックログイン (4649 を適用)
            </button>
          </form>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            社内業務専用システム - セキュア接続中
          </p>
        </div>
      </div>
    </div>
  );
};
