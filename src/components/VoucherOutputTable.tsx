import React from 'react';
import { PaymentMethod, CurrencyType, PayType, PlanDetailRow } from '../types';
import { Table, FileText, CheckCircle2, Building, DollarSign } from 'lucide-react';

interface VoucherOutputTableProps {
  method: PaymentMethod;
  currency: CurrencyType;
  paytype: PayType;
  customer: string;
  planDetails: PlanDetailRow[];
  totalAmount: number;
  depositAmount: number;
  feeAmount: number;
  finalDeposit: number;
  finalProfit: number;
  finalFee: number;
}

export const VoucherOutputTable: React.FC<VoucherOutputTableProps> = ({
  method,
  currency,
  paytype,
  customer,
  planDetails,
  totalAmount,
  depositAmount,
  feeAmount,
  finalDeposit,
  finalProfit,
  finalFee,
}) => {
  const detailTitle =
    method === '前受入金'
      ? '計画明細'
      : currency === 'JPY'
      ? '売掛明細'
      : 'Invoice明細';

  const totalLabel = method === '前受入金' ? '合計前受額' : '合計売掛額';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header Bar of Output Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              📋 出力欄（入力内容の確認・印刷用）
            </h2>
            <p className="text-xs text-slate-500">
              画面確認および会計伝票への転記・印刷用集計テーブル
            </p>
          </div>
        </div>

        {/* Voucher Meta Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-100 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {method}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-200">
            通貨: {currency}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200">
            区分: {paytype}
          </span>
          {customer && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-medium rounded-md border border-amber-200 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              {customer}
            </span>
          )}
        </div>
      </div>

      {/* Grid: 2 columns left (Table) and 1 column right (Summary Totals) matching Streamlit out_col1, out_col2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OUT COL 1: 計画明細 / 売掛明細 / Invoice明細 */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-slate-500" />
              {detailTitle}
            </h3>
            <span className="text-xs text-slate-500">
              合計 {planDetails.length} 件
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3">番号</th>
                  <th className="py-2.5 px-3 text-center w-16">通貨</th>
                  <th className="py-2.5 px-3 text-right">外貨金額</th>
                  <th className="py-2.5 px-3 text-right">JPY換算額</th>
                  <th className="py-2.5 px-3 text-center w-28">日付</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {planDetails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      明細がありません
                    </td>
                  </tr>
                ) : (
                  planDetails.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">
                        {row.No || `(${idx + 1})`}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600">
                          {row.通貨}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {row.外貨金額 !== null
                          ? row.外貨金額.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {row.JPY換算額.toLocaleString()} 円
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {row.日付 || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* OUT COL 2: 金額詳細（合計） */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-500" />
            金額詳細（合計）
          </h3>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl p-4 border border-slate-200 space-y-3">
            {/* Total Label */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <span className="text-xs text-slate-600 font-medium">
                {totalLabel} JPY
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {totalAmount.toLocaleString()} <span className="text-xs font-normal">円</span>
              </span>
            </div>

            {currency === 'JPY' ? (
              <>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-600 font-medium">入金額 JPY</span>
                  <span className="text-sm font-semibold font-mono text-blue-700">
                    {depositAmount.toLocaleString()} 円
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-600 font-medium">手数料 JPY</span>
                  <span className="text-sm font-semibold font-mono text-amber-700">
                    {Math.abs(feeAmount).toLocaleString()} 円
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-600 font-medium">入金額 JPY</span>
                  <span className="text-sm font-bold font-mono text-blue-700">
                    {finalDeposit.toLocaleString()} 円
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-600 font-medium">差益 JPY</span>
                  <span className={`text-sm font-semibold font-mono ${finalProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {finalProfit >= 0 ? `+${finalProfit.toLocaleString()}` : finalProfit.toLocaleString()} 円
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-600 font-medium">手数料 JPY</span>
                  <span className="text-sm font-semibold font-mono text-amber-700">
                    {Math.abs(finalFee).toLocaleString()} 円
                  </span>
                </div>
              </>
            )}

            {/* Visual verification badge */}
            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>ステータス:</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 整合確認済み
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
