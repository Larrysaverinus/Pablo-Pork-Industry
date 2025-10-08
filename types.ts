export enum TransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  INVESTMENT = 'investment',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  remark?: string;
}