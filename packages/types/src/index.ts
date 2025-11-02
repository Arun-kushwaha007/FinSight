export type Currency = 'INR' | 'USD' | 'EUR';
export interface User {
  id: string;
  name: string;
  email: string;
  currency?: Currency;
}
export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  currency: Currency;
  description?: string;
  category?: string;
  type: 'income' | 'expense';
}
