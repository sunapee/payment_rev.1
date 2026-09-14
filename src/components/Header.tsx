import React from 'react';
import { Printer, Download, RotateCcw, LogOut } from 'lucide-react';

interface HeaderProps {
  onPrint: () => void;
  onExportCsv: () => void;
  onReset: () => void;
  onLogout: () => void;
  isPrintPreview: boolean;
  setIsPrintPreview: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPrint,
  onExportCsv,
  onReset,
  onLogout,
  isPrintPreview,
  setIsPrintPreview,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shadow-xs">
            💰
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">入金伝票システム</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintPreview(!isPrintPreview)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1.5 ${
              isPrintPreview
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isPrintPreview ? '通常表示に戻る' : '伝票様式ビュー'}
          </button>

          <button
            onClick={onPrint}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1.5"
            title="印刷 / PDF保存"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">印刷</span>
          </button>

          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5"
            title="CSV出力"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="入力初期化"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="ログアウト"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
