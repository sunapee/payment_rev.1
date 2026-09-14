import React from 'react';
import { PaymentMethod, CurrencyType, PayType, PlanItem } from '../types';
import { AlertCircle, Plus, Trash2, Calendar, RefreshCw } from 'lucide-react';

interface VoucherInputFormProps {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  paytype: PayType;
  setPaytype: (p: PayType) => void;
  customer: string;
  setCustomer: (c: string) => void;

  rateUsdInput: string;
  setRateUsdInput: (v: string) => void;
  rateEurInput: string;
  setRateEurInput: (v: string) => void;
  todayRateUsd: number;
  todayRateEur: number;
  rateUsdError: string | null;
  rateEurError: string | null;

  plans: PlanItem[];
  setPlans: (plans: PlanItem[]) => void;

  depositAmountInput: string;
  setDepositAmountInput: (v: string) => void;
  depositError: string | null;

  // Manual inputs for Foreign currency (JPY Deposit, Profit, Fee)
  manualDepositInput: string;
  setManualDepositInput: (v: string) => void;
  manualProfitInput: string;
  setManualProfitInput: (v: string) => void;
  manualFeeInput: string;
  setManualFeeInput: (v: string) => void;

  // Calculation contexts for formulas
  depositAmount: number;
  todayRate: number;
  baseRate: number;
  totalAmount: number;
  totalForeignAmount: number;
  autoJpyDeposit: number;
  autoProfitMarginRaw: number;
  autoProfitMargin: number;
  autoFeeAmount: number;
  currentDeposit: number;
  currentProfit: number;
  manualFeeCalc: number;
  onResetManualToAuto: () => void;
}

export const VoucherInputForm: React.FC<VoucherInputFormProps> = ({
  method,
  setMethod,
  currency,
  setCurrency,
  paytype,
  setPaytype,
  customer,
  setCustomer,
  rateUsdInput,
  setRateUsdInput,
  rateEurInput,
  setRateEurInput,
  todayRateUsd,
  todayRateEur,
  rateUsdError,
  rateEurError,
  plans,
  setPlans,
  depositAmountInput,
  setDepositAmountInput,
  depositError,
  manualDepositInput,
  setManualDepositInput,
  manualProfitInput,
  setManualProfitInput,
  manualFeeInput,
  setManualFeeInput,
  depositAmount,
  todayRate,
  baseRate,
  totalAmount,
  totalForeignAmount,
  autoJpyDeposit,
  autoProfitMarginRaw,
  autoProfitMargin,
  autoFeeAmount,
  currentDeposit,
  currentProfit,
  manualFeeCalc,
  onResetManualToAuto,
}) => {
  // Helpers for plans
  const handlePlanCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(20, count || 1));
    const newPlans = [...plans];
    while (newPlans.length < validCount) {
      const idx = newPlans.length + 1;
      newPlans.push({
        id: `plan-${Date.now()}-${idx}`,
        planNumber: '',
        foreignAmountInput: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    if (newPlans.length > validCount) {
      newPlans.splice(validCount);
    }
    setPlans(newPlans);
  };

  const updatePlan = (index: number, field: keyof PlanItem, value: string) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    setPlans(updated);
  };

  const addPlan = () => {
    handlePlanCountChange(plans.length + 1);
  };

  const removePlan = (index: number) => {
    if (plans.length <= 1) return;
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      {/* -------------------- COL 1: 入金伝票 -------------------- */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2.5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            入金伝票
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">伝票の基本条件を設定します</p>
        </div>

        {/* 入金タイプ */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            入金タイプ
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          >
            <option value="前受入金">前受入金</option>
            <option value="売掛">売掛</option>
          </select>
        </div>

        {/* 通貨 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            通貨
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['JPY', 'USD', 'EUR'] as CurrencyType[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  currency === c
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 一部 or 全部 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            一部or全部
          </label>
          <select
            value={paytype}
            onChange={(e) => setPaytype(e.target.value as PayType)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          >
            <option value="全部">全部</option>
            <option value="一部">一部</option>
          </select>
        </div>

        {/* 顧客名 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            顧客名
          </label>
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="例: 株式会社サンプル商事"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* 為替レート (USD / EUR) */}
        {currency === 'USD' && (
          <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-amber-900">
                今日のレート (USD)
              </label>
              <span className="text-[11px] text-amber-700 font-mono">
                基準: 103.00円
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              value={rateUsdInput}
              onChange={(e) => setRateUsdInput(e.target.value)}
              placeholder="103.0"
              className={`w-full px-3 py-1.5 text-sm bg-white border rounded-md font-mono focus:ring-2 focus:outline-none ${
                rateUsdError ? 'border-red-400 focus:ring-red-200' : 'border-amber-300 focus:ring-amber-400'
              }`}
            />
            {rateUsdError && (
              <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" /> {rateUsdError}
              </p>
            )}
            <p className="text-[11px] text-amber-700/85">
              現在適用レート: <span className="font-semibold">{todayRateUsd.toFixed(2)}円</span>
            </p>
          </div>
        )}

        {currency === 'EUR' && (
          <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-amber-900">
                今日のレート (EUR)
              </label>
              <span className="text-[11px] text-amber-700 font-mono">
                基準: 120.00円
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              value={rateEurInput}
              onChange={(e) => setRateEurInput(e.target.value)}
              placeholder="120.0"
              className={`w-full px-3 py-1.5 text-sm bg-white border rounded-md font-mono focus:ring-2 focus:outline-none ${
                rateEurError ? 'border-red-400 focus:ring-red-200' : 'border-amber-300 focus:ring-amber-400'
              }`}
            />
            {rateEurError && (
              <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" /> {rateEurError}
              </p>
            )}
            <p className="text-[11px] text-amber-700/85">
              現在適用レート: <span className="font-semibold">{todayRateEur.toFixed(2)}円</span>
            </p>
          </div>
        )}
      </div>

      {/* -------------------- COL 2: 計画/Invoice -------------------- */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              計画 / Invoice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {method === '前受入金' ? '前受の計画番号と金額を入力' : '売掛伝票・Invoice明細を入力'}
            </p>
          </div>
          <button
            type="button"
            onClick={addPlan}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> 追加
          </button>
        </div>

        {/* 件数制御 */}
        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <label className="text-xs font-medium text-slate-700">
            {method === '前受入金'
              ? '計画番号の数'
              : currency === 'JPY'
              ? '計画No/INVOICEの数'
              : 'Invoiceの数'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={plans.length <= 1}
              onClick={() => handlePlanCountChange(plans.length - 1)}
              className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-300 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              -
            </button>
            <span className="text-sm font-semibold font-mono w-6 text-center text-slate-800">
              {plans.length}
            </span>
            <button
              type="button"
              disabled={plans.length >= 20}
              onClick={() => handlePlanCountChange(plans.length + 1)}
              className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-300 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>

        {/* 明細入力リスト */}
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {plans.map((item, i) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 relative group hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  {method === '前受入金'
                    ? `計画番号 ${i + 1}`
                    : currency === 'JPY'
                    ? `計画(国内)No / INVOICE(海外)No ${i + 1}`
                    : `Invoice番号 ${i + 1}`}
                </span>

                {plans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlan(i)}
                    className="text-slate-400 hover:text-red-500 transition p-1"
                    title="削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={item.planNumber}
                  onChange={(e) => updatePlan(i, 'planNumber', e.target.value)}
                  placeholder={
                    method === '前受入金'
                      ? `計画番号 ${i + 1}`
                      : currency === 'JPY'
                      ? '例: PL-2026-001'
                      : '例: INV-2026-US01'
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />

                {/* 売掛の場合は日付入力 */}
                {method === '売掛' && (
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-500">売掛日:</span>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updatePlan(i, 'date', e.target.value)}
                      className="text-xs text-slate-700 bg-transparent flex-1 focus:outline-none"
                    />
                  </div>
                )}

                {/* 金額入力 */}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[11px] text-slate-600">
                      {method === '前受入金'
                        ? `前受額${i + 1} ${currency}`
                        : `売掛額${i + 1} ${currency}`}
                    </label>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={item.foreignAmountInput}
                    onChange={(e) => updatePlan(i, 'foreignAmountInput', e.target.value)}
                    placeholder="入力"
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- COL 3: 入金額 入力 -------------------- */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              入金額 入力
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              実際の振込・着金額と為替精算
            </p>
          </div>
          {currency !== 'JPY' && (
            <button
              type="button"
              onClick={onResetManualToAuto}
              className="text-[11px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition"
              title="自動計算値にリセット"
            >
              <RefreshCw className="w-3 h-3" /> 自動計算に戻す
            </button>
          )}
        </div>

        {currency === 'JPY' ? (
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                入金額 JPY
              </label>
              <input
                type="number"
                step="any"
                value={depositAmountInput}
                onChange={(e) => setDepositAmountInput(e.target.value)}
                placeholder="0以上の数値を入力"
                className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-lg focus:ring-2 focus:outline-none ${
                  depositError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {depositError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {depositError}
                </p>
              )}
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>合計請求/計画額:</span>
                <span className="font-mono font-semibold">{totalAmount.toLocaleString()} 円</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>入金額:</span>
                <span className="font-mono font-semibold">{depositAmount.toLocaleString()} 円</span>
              </div>
              <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-slate-800">
                <span>差額 (手数料相当):</span>
                <span className="font-mono text-indigo-700">
                  {Math.abs(totalAmount - depositAmount <= 1 && totalAmount - depositAmount >= -1 ? 0 : totalAmount - depositAmount).toLocaleString()} 円
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            {/* 入金額 (USD or EUR) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                入金額 {currency}
              </label>
              <input
                type="number"
                step="any"
                value={depositAmountInput}
                onChange={(e) => setDepositAmountInput(e.target.value)}
                placeholder="0以上の数値を入力"
                className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-lg focus:ring-2 focus:outline-none ${
                  depositError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {depositError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {depositError}
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-3">
              {/* 入金額 JPY (手動修正可能) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1 leading-relaxed">
                  入金額 JPY
                  <span className="block text-[10.5px] text-slate-500 font-mono">
                    ({depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {todayRate.toFixed(2)} = {autoJpyDeposit.toLocaleString()} 円)
                  </span>
                </label>
                <input
                  type="text"
                  value={manualDepositInput}
                  onChange={(e) => setManualDepositInput(e.target.value)}
                  placeholder={`${autoJpyDeposit.toLocaleString()}`}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 差益 JPY (手動修正可能) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1 leading-relaxed">
                  差益 JPY
                  <span className="block text-[10.5px] text-slate-500 font-mono">
                    (({todayRate.toFixed(2)} - {baseRate.toFixed(2)}) × {totalForeignAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = {autoProfitMarginRaw.toFixed(2)} 円)
                  </span>
                </label>
                <input
                  type="text"
                  value={manualProfitInput}
                  onChange={(e) => setManualProfitInput(e.target.value)}
                  placeholder={`${autoProfitMargin.toLocaleString()}`}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 手数料 JPY (手動修正可能) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1 leading-relaxed">
                  手数料 JPY
                  <span className="block text-[10.5px] text-slate-500 font-mono">
                    ({totalAmount.toLocaleString()} + {currentProfit.toLocaleString()} - {currentDeposit.toLocaleString()} = {manualFeeCalc.toLocaleString()} 円)
                  </span>
                </label>
                <input
                  type="text"
                  value={manualFeeInput}
                  onChange={(e) => setManualFeeInput(e.target.value)}
                  placeholder={`${autoFeeAmount.toLocaleString()}`}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
