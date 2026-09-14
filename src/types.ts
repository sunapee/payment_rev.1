export type PaymentMethod = '前受入金' | '売掛';
export type CurrencyType = 'JPY' | 'USD' | 'EUR';
export type PayType = '全部' | '一部';

export interface PlanItem {
  id: string;
  planNumber: string;
  foreignAmountInput: string;
  date: string;
}

export interface PlanDetailRow {
  No: string;
  通貨: CurrencyType;
  外貨金額: number | null;
  JPY換算額: number;
  日付: string | null;
}

export interface CalculationResult {
  totalAmount: number;
  totalUsdAmount: number;
  totalEurAmount: number;
  depositAmount: number;
  feeAmount: number;
  autoJpyDeposit: number;
  autoProfitMargin: number;
  autoProfitMarginRaw: number;
  autoFeeAmount: number;
  manualDeposit: number;
  manualProfit: number;
  manualFee: number;
}
