import React from 'react';
import { PaymentMethod, CurrencyType, PayType, PlanDetailRow } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintableVoucherProps {
  method: PaymentMethod;
  currency: CurrencyType;
  paytype: PayType;
  customer: string;
  todayRate: number;
  baseRate: number;
  planDetails: PlanDetailRow[];
  totalAmount: number;
  depositAmount: number;
  feeAmount: number;
  finalDeposit: number;
  finalProfit: number;
  finalFee: number;
  onBack: () => void;
  onPrint: () => void;
}

export const PrintableVoucher: React.FC<PrintableVoucherProps> = ({
  method,
  currency,
  paytype,
  customer,
  todayRate,
  baseRate,
  planDetails,
  totalAmount,
  depositAmount,
  feeAmount,
  finalDeposit,
  finalProfit,
  finalFee,
  onBack,
  onPrint,
}) => {
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const voucherNo = `VCH-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;

  const totalLabel = method === '前受入金' ? '合計前受額' : '合計売掛額';

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between bg-slate-800 text-white px-5 py-3 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 入力画面に戻る
          </button>
          <span className="text-xs text-slate-300">
            A4縦サイズでの印刷に最適化された伝票プレビューです
          </span>
        </div>
        <button
          onClick={onPrint}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Printer className="w-4 h-4" /> この様式で印刷する
        </button>
      </div>

      {/* A4 Sheet Container */}
      <div className="print-page bg-white p-8 sm:p-12 max-w-4xl mx-auto rounded-xl border border-slate-300 shadow-md text-slate-900 font-sans">
        {/* Header: Title & Stamp Boxes */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-widest text-slate-900">
                入 金 伝 票
              </span>
              <span className="text-xs border border-slate-800 px-2 py-0.5 font-semibold">
                {method}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">NCC 財務会計管理システム</p>
          </div>

          {/* Japanese Stamp Boxes (承認 / 審査 / 担当) */}
          <div className="flex border border-slate-900 text-center text-xs">
            <div className="w-16 border-r border-slate-900">
              <div className="bg-slate-100 border-b border-slate-900 py-0.5 text-[11px] font-bold">承認</div>
              <div className="h-14"></div>
            </div>
            <div className="w-16 border-r border-slate-900">
              <div className="bg-slate-100 border-b border-slate-900 py-0.5 text-[11px] font-bold">審査</div>
              <div className="h-14"></div>
            </div>
            <div className="w-16">
              <div className="bg-slate-100 border-b border-slate-900 py-0.5 text-[11px] font-bold">担当</div>
              <div className="h-14"></div>
            </div>
          </div>
        </div>

        {/* Voucher Meta Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="flex">
              <span className="w-24 text-slate-500 font-medium">顧客名:</span>
              <span className="font-bold text-sm border-b border-dotted border-slate-400 pb-0.5 flex-1">
                {customer || '（顧客名未入力）'} 御中
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-500 font-medium">入金タイプ:</span>
              <span className="font-semibold">{method} ({paytype})</span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-500 font-medium">通貨・レート:</span>
              <span className="font-mono">
                {currency}
                {currency !== 'JPY' && ` (本日レート: ${todayRate.toFixed(2)}円 / 基準: ${baseRate.toFixed(2)}円)`}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="flex justify-end">
              <span className="text-slate-500 font-medium mr-2">発行日:</span>
              <span className="font-mono font-medium">{currentDate}</span>
            </div>
            <div className="flex justify-end">
              <span className="text-slate-500 font-medium mr-2">伝票番号:</span>
              <span className="font-mono font-bold">{voucherNo}</span>
            </div>
          </div>
        </div>

        {/* Table of Plans / Invoices */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-800 mb-2">
            【{method === '前受入金' ? '計画明細' : currency === 'JPY' ? '売掛明細' : 'Invoice明細'}】
          </h3>
          <table className="w-full text-xs border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-800">
                <th className="py-2 px-2 border-r border-slate-900 text-center w-12">行</th>
                <th className="py-2 px-3 border-r border-slate-900 text-left">番号 (計画 / Invoice)</th>
                <th className="py-2 px-2 border-r border-slate-900 text-center w-14">通貨</th>
                <th className="py-2 px-3 border-r border-slate-900 text-right">外貨金額</th>
                <th className="py-2 px-3 border-r border-slate-900 text-right">JPY換算額</th>
                <th className="py-2 px-3 text-center w-28">日付</th>
              </tr>
            </thead>
            <tbody>
              {planDetails.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-300">
                  <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-900 font-mono font-medium">
                    {row.No || `(${idx + 1})`}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-900 text-center font-mono">
                    {row.通貨}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono">
                    {row.外貨金額 !== null
                      ? row.外貨金額.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '-'}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-900 text-right font-mono font-semibold">
                    {row.JPY換算額.toLocaleString()} 円
                  </td>
                  <td className="py-1.5 px-3 text-center font-mono">
                    {row.日付 || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Settlement Box */}
        <div className="border border-slate-900 p-4 bg-slate-50/50 text-xs mb-6">
          <h4 className="font-bold text-slate-800 mb-2.5 pb-1 border-b border-slate-300">
            金額詳細・入金精算合計
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="border-r border-slate-300 pr-2">
              <span className="text-slate-500 block text-[11px] mb-1">{totalLabel}</span>
              <span className="font-bold font-mono text-sm text-slate-900">
                {totalAmount.toLocaleString()} 円
              </span>
            </div>
            <div className="border-r border-slate-300 pr-2">
              <span className="text-slate-500 block text-[11px] mb-1">入金額 (JPY)</span>
              <span className="font-bold font-mono text-sm text-blue-800">
                {(currency === 'JPY' ? depositAmount : finalDeposit).toLocaleString()} 円
              </span>
            </div>
            <div className="border-r border-slate-300 pr-2">
              <span className="text-slate-500 block text-[11px] mb-1">為替差益 (JPY)</span>
              <span className="font-bold font-mono text-sm text-slate-900">
                {currency === 'JPY' ? '0 円' : `${finalProfit >= 0 ? '+' : ''}${finalProfit.toLocaleString()} 円`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] mb-1">差額手数料 (JPY)</span>
              <span className="font-bold font-mono text-sm text-amber-900">
                {Math.abs(currency === 'JPY' ? feeAmount : finalFee).toLocaleString()} 円
              </span>
            </div>
          </div>
        </div>

        {/* Remarks / Footer */}
        <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex justify-between">
          <span>※ 本伝票は社内会計処理および照合確認用として出力されたものです。</span>
          <span>出力日時: {new Date().toLocaleString('ja-JP')}</span>
        </div>
      </div>
    </div>
  );
};
