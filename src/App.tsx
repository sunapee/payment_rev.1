/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PasswordScreen } from './components/PasswordScreen';
import { Header } from './components/Header';
import { VoucherInputForm } from './components/VoucherInputForm';
import { VoucherOutputTable } from './components/VoucherOutputTable';
import { PrintableVoucher } from './components/PrintableVoucher';
import { PaymentMethod, CurrencyType, PayType, PlanItem, PlanDetailRow } from './types';

export default function App() {
  // 1. Password state (Replaces st.session_state["password_correct"])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ncc_denpyo_auth') === 'true';
  });

  const handlePasswordSuccess = () => {
    sessionStorage.setItem('ncc_denpyo_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ncc_denpyo_auth');
    setIsAuthenticated(false);
  };

  // 2. Col 1 States (Method, Currency, PayType, Customer, Exchange Rates)
  const [method, setMethod] = useState<PaymentMethod>('前受入金');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [paytype, setPaytype] = useState<PayType>('全部');
  const [customer, setCustomer] = useState<string>('');

  const [rateUsdInput, setRateUsdInput] = useState<string>('');
  const [rateEurInput, setRateEurInput] = useState<string>('');

  // Rate validation & computed values
  const { todayRateUsd, rateUsdError } = useMemo(() => {
    if (!rateUsdInput.trim()) return { todayRateUsd: 103.0, rateUsdError: null };
    const val = parseFloat(rateUsdInput);
    if (isNaN(val)) return { todayRateUsd: 103.0, rateUsdError: '有効な数値を入力してください' };
    if (val <= 0) return { todayRateUsd: 103.0, rateUsdError: 'レートは0より大きい値を入力してください' };
    return { todayRateUsd: val, rateUsdError: null };
  }, [rateUsdInput]);

  const { todayRateEur, rateEurError } = useMemo(() => {
    if (!rateEurInput.trim()) return { todayRateEur: 120.0, rateEurError: null };
    const val = parseFloat(rateEurInput);
    if (isNaN(val)) return { todayRateEur: 120.0, rateEurError: '有効な数値を入力してください' };
    if (val <= 0) return { todayRateEur: 120.0, rateEurError: 'レートは0より大きい値を入力してください' };
    return { todayRateEur: val, rateEurError: null };
  }, [rateEurInput]);

  // 3. Col 2 States (Plans & Invoices)
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [plans, setPlans] = useState<PlanItem[]>([
    {
      id: 'plan-1',
      planNumber: '',
      foreignAmountInput: '',
      date: todayDateStr,
    },
  ]);

  // 4. Col 3 States (Deposit Input & Manual Overrides)
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');

  // Manual values and raw user inputs for Foreign Currency mode
  const [manualDepositInput, setManualDepositInput] = useState<string>('');
  const [manualProfitInput, setManualProfitInput] = useState<string>('');
  const [manualFeeInput, setManualFeeInput] = useState<string>('');

  // Track if user explicitly edited them
  const [userEditedManual, setUserEditedManual] = useState(false);
  const [lastDepositValue, setLastDepositValue] = useState<number | null>(null);

  // View mode
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);

  // Parse deposit amount
  const { depositAmount, depositError } = useMemo(() => {
    if (!depositAmountInput.trim()) return { depositAmount: 0.0, depositError: null };
    const val = parseFloat(depositAmountInput);
    if (isNaN(val)) return { depositAmount: 0.0, depositError: '有効な数値を入力してください' };
    if (val < 0) return { depositAmount: 0.0, depositError: '入金額は0以上で入力してください' };
    return { depositAmount: val, depositError: null };
  }, [depositAmountInput]);

  // Determine active rates
  const baseRate = currency === 'USD' ? 103.0 : 120.0;
  const todayRate = currency === 'USD' ? todayRateUsd : todayRateEur;

  // Compute Plan Details and Totals
  const { planDetails, totalAmount, totalUsdAmount, totalEurAmount } = useMemo(() => {
    const details: PlanDetailRow[] = [];
    let totAmt = 0.0;
    let totUsd = 0.0;
    let totEur = 0.0;

    if (method === '前受入金') {
      plans.forEach((p, i) => {
        const rawAmount = parseFloat(p.foreignAmountInput) || 0.0;
        let amountJpyForPlan = 0.0;
        let foreignAmount: number | null = null;

        if (currency === 'JPY') {
          amountJpyForPlan = rawAmount;
          foreignAmount = null;
        } else if (currency === 'USD') {
          const amountUsd = rawAmount;
          amountJpyForPlan = amountUsd * 103.0; // Python: amount_usd * 103
          foreignAmount = amountUsd;
          totUsd += amountUsd;
        } else if (currency === 'EUR') {
          const amountEur = rawAmount;
          amountJpyForPlan = amountEur * 120.0; // Python: amount_eur * 120
          foreignAmount = amountEur;
          totEur += amountEur;
        }

        totAmt += amountJpyForPlan;
        details.push({
          No: p.planNumber || `計画番号 ${i + 1}`,
          通貨: currency,
          外貨金額: foreignAmount,
          JPY換算額: amountJpyForPlan,
          日付: null,
        });
      });
    } else {
      // method === "売掛"
      if (currency === 'JPY') {
        plans.forEach((p, i) => {
          const rawAmount = parseFloat(p.foreignAmountInput) || 0.0;
          totAmt += rawAmount;
          details.push({
            No: p.planNumber || `計画No ${i + 1}`,
            通貨: 'JPY',
            外貨金額: null,
            JPY換算額: rawAmount,
            日付: p.date || null,
          });
        });
      } else {
        // USD or EUR
        plans.forEach((p, i) => {
          const rawAmount = parseFloat(p.foreignAmountInput) || 0.0;
          if (currency === 'USD') {
            const amountUsd = rawAmount;
            const amountJpy = Math.floor(amountUsd * 103.0); // Python: math.floor(amount_usd * 103.0)
            totAmt += amountJpy;
            totUsd += amountUsd;
            details.push({
              No: p.planNumber || `INV-${i + 1}`,
              通貨: 'USD',
              外貨金額: amountUsd,
              JPY換算額: amountJpy,
              日付: p.date || null,
            });
          } else if (currency === 'EUR') {
            const amountEur = rawAmount;
            const amountJpy = Math.floor(amountEur * 120.0); // Python: math.floor(amount_eur * 120)
            totAmt += amountJpy;
            totEur += amountEur;
            details.push({
              No: p.planNumber || `INV-${i + 1}`,
              通貨: 'EUR',
              外貨金額: amountEur,
              JPY換算額: amountJpy,
              日付: p.date || null,
            });
          }
        });
      }
    }

    return {
      planDetails: details,
      totalAmount: totAmt,
      totalUsdAmount: totUsd,
      totalEurAmount: totEur,
    };
  }, [method, currency, plans]);

  // JPY mode fee calculation
  const jpyFeeAmount = useMemo(() => {
    let fee = totalAmount - depositAmount;
    if (Math.abs(fee) <= 1) fee = 0;
    return fee;
  }, [totalAmount, depositAmount]);

  // Foreign currency auto-calculations
  const {
    autoJpyDeposit,
    totalForeignAmount,
    autoProfitMarginRaw,
    autoProfitMargin,
    autoFeeAmount,
  } = useMemo(() => {
    const autoDep = Math.floor(depositAmount * todayRate);
    const totForeign = currency === 'USD' ? totalUsdAmount : currency === 'EUR' ? totalEurAmount : 0;
    const profitRaw = (todayRate - baseRate) * totForeign;
    const profit = Math.floor(profitRaw + 0.0000001);
    let fee = totalAmount + profit - autoDep;
    if (Math.abs(fee) <= 1) fee = 0;

    return {
      autoJpyDeposit: autoDep,
      totalForeignAmount: totForeign,
      autoProfitMarginRaw: profitRaw,
      autoProfitMargin: profit,
      autoFeeAmount: fee,
    };
  }, [depositAmount, todayRate, baseRate, currency, totalUsdAmount, totalEurAmount, totalAmount]);

  // Sync auto values when depositAmount changes, unless user specifically entered custom values
  useEffect(() => {
    if (lastDepositValue !== depositAmount || !userEditedManual) {
      setLastDepositValue(depositAmount);
      if (depositAmountInput.trim() !== '') {
        setManualDepositInput(autoJpyDeposit ? autoJpyDeposit.toLocaleString() : '0');
        setManualProfitInput(autoProfitMargin ? autoProfitMargin.toLocaleString() : '0');
        setManualFeeInput(autoFeeAmount ? autoFeeAmount.toLocaleString() : '0');
      } else {
        setManualDepositInput('');
        setManualProfitInput('');
        setManualFeeInput('');
      }
    }
  }, [depositAmount, depositAmountInput, autoJpyDeposit, autoProfitMargin, autoFeeAmount, lastDepositValue, userEditedManual]);

  // Parse manual values according to Python update_manual_input logic
  // "カンマを削除して数値に変換。入力が空や無効の場合は自動計算値に戻す"
  const parseManual = (input: string, autoVal: number): number => {
    const clean = input.replace(/,/g, '').trim();
    if (!clean) return autoVal;
    const num = parseInt(clean, 10);
    return isNaN(num) ? autoVal : num;
  };

  const currentDeposit = useMemo(
    () => parseManual(manualDepositInput, autoJpyDeposit),
    [manualDepositInput, autoJpyDeposit]
  );

  const currentProfit = useMemo(
    () => parseManual(manualProfitInput, autoProfitMargin),
    [manualProfitInput, autoProfitMargin]
  );

  const manualFeeCalc = useMemo(() => {
    return totalAmount + currentProfit - currentDeposit;
  }, [totalAmount, currentProfit, currentDeposit]);

  const finalFee = useMemo(() => {
    if (manualFeeInput.trim() !== '') {
      return parseManual(manualFeeInput, manualFeeCalc);
    }
    return manualFeeCalc;
  }, [manualFeeInput, manualFeeCalc]);

  const handleResetManualToAuto = useCallback(() => {
    setUserEditedManual(false);
    if (depositAmountInput.trim() !== '') {
      setManualDepositInput(autoJpyDeposit.toLocaleString());
      setManualProfitInput(autoProfitMargin.toLocaleString());
      setManualFeeInput(autoFeeAmount.toLocaleString());
    } else {
      setManualDepositInput('');
      setManualProfitInput('');
      setManualFeeInput('');
    }
  }, [depositAmountInput, autoJpyDeposit, autoProfitMargin, autoFeeAmount]);

  const handleReset = () => {
    setMethod('前受入金');
    setCurrency('USD');
    setPaytype('全部');
    setCustomer('');
    setRateUsdInput('');
    setRateEurInput('');
    setPlans([
      { id: 'plan-1', planNumber: '', foreignAmountInput: '', date: todayDateStr },
    ]);
    setDepositAmountInput('');
    setManualDepositInput('');
    setManualProfitInput('');
    setManualFeeInput('');
    setUserEditedManual(false);
  };

  // CSV Export with UTF-8 BOM for Japanese Excel
  const handleExportCsv = () => {
    const headers = ['No', '通貨', '外貨金額', 'JPY換算額', '売掛日'];
    const rows = planDetails.map((r) => [
      `"${r.No}"`,
      r.通貨,
      r.外貨金額 !== null ? r.外貨金額.toFixed(2) : '',
      r.JPY換算額,
      r.日付 || '',
    ]);

    const summaryRow1 = ['', '', '', '', ''];
    const summaryRow2 = [
      '【合計情報】',
      '',
      method === '前受入金' ? '合計前受額JPY' : '合計売掛額JPY',
      totalAmount,
      '',
    ];
    const summaryRow3 = [
      '入金額JPY',
      '',
      '',
      currency === 'JPY' ? depositAmount : currentDeposit,
      '',
    ];
    const summaryRow4 = [
      '為替差益JPY',
      '',
      '',
      currency === 'JPY' ? 0 : currentProfit,
      '',
    ];
    const summaryRow5 = [
      '手数料JPY',
      '',
      '',
      currency === 'JPY' ? Math.abs(jpyFeeAmount) : Math.abs(finalFee),
      '',
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((e) => e.join(',')),
      summaryRow1.join(','),
      summaryRow2.join(','),
      summaryRow3.join(','),
      summaryRow4.join(','),
      summaryRow5.join(','),
    ].join('\r\n');

    // Add UTF-8 BOM (\uFEFF)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `入金伝票_${customer || '明細'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // If not authenticated, show password screen (4649)
  if (!isAuthenticated) {
    return <PasswordScreen onSuccess={handlePasswordSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        onPrint={handlePrint}
        onExportCsv={handleExportCsv}
        onReset={handleReset}
        onLogout={handleLogout}
        isPrintPreview={isPrintPreview}
        setIsPrintPreview={setIsPrintPreview}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {isPrintPreview ? (
          <PrintableVoucher
            method={method}
            currency={currency}
            paytype={paytype}
            customer={customer}
            todayRate={todayRate}
            baseRate={baseRate}
            planDetails={planDetails}
            totalAmount={totalAmount}
            depositAmount={depositAmount}
            feeAmount={jpyFeeAmount}
            finalDeposit={currentDeposit}
            finalProfit={currentProfit}
            finalFee={finalFee}
            onBack={() => setIsPrintPreview(false)}
            onPrint={handlePrint}
          />
        ) : (
          <>
            {/* Input Form: 3 Columns matching Streamlit col1, col2, col3 */}
            <div className="no-print">
              <VoucherInputForm
                method={method}
                setMethod={setMethod}
                currency={currency}
                setCurrency={setCurrency}
                paytype={paytype}
                setPaytype={setPaytype}
                customer={customer}
                setCustomer={setCustomer}
                rateUsdInput={rateUsdInput}
                setRateUsdInput={setRateUsdInput}
                rateEurInput={rateEurInput}
                setRateEurInput={setRateEurInput}
                todayRateUsd={todayRateUsd}
                todayRateEur={todayRateEur}
                rateUsdError={rateUsdError}
                rateEurError={rateEurError}
                plans={plans}
                setPlans={setPlans}
                depositAmountInput={depositAmountInput}
                setDepositAmountInput={setDepositAmountInput}
                depositError={depositError}
                manualDepositInput={manualDepositInput}
                setManualDepositInput={(val) => {
                  setUserEditedManual(true);
                  setManualDepositInput(val);
                }}
                manualProfitInput={manualProfitInput}
                setManualProfitInput={(val) => {
                  setUserEditedManual(true);
                  setManualProfitInput(val);
                }}
                manualFeeInput={manualFeeInput}
                setManualFeeInput={(val) => {
                  setUserEditedManual(true);
                  setManualFeeInput(val);
                }}
                depositAmount={depositAmount}
                todayRate={todayRate}
                baseRate={baseRate}
                totalAmount={totalAmount}
                totalForeignAmount={totalForeignAmount}
                autoJpyDeposit={autoJpyDeposit}
                autoProfitMarginRaw={autoProfitMarginRaw}
                autoProfitMargin={autoProfitMargin}
                autoFeeAmount={autoFeeAmount}
                currentDeposit={currentDeposit}
                currentProfit={currentProfit}
                manualFeeCalc={manualFeeCalc}
                onResetManualToAuto={handleResetManualToAuto}
              />
            </div>

            {/* Output Section matching Streamlit 出力欄 */}
            <VoucherOutputTable
              method={method}
              currency={currency}
              paytype={paytype}
              customer={customer}
              planDetails={planDetails}
              totalAmount={totalAmount}
              depositAmount={depositAmount}
              feeAmount={jpyFeeAmount}
              finalDeposit={currentDeposit}
              finalProfit={currentProfit}
              finalFee={finalFee}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        NCC 入金伝票システム &copy; {new Date().getFullYear()} — 前受入金・売掛金為替換算＆精算ツール
      </footer>
    </div>
  );
}
