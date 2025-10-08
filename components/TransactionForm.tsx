import React, { useState, useEffect } from 'react';
import { TransactionType, Transaction } from '../types';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';

interface TransactionFormProps {
  onSaveTransaction: (data: { type: TransactionType, amount: number, remark: string, date: string }) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSaveTransaction, editingTransaction, onCancelEdit }) => {
  const [amount, setAmount] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (editingTransaction) {
      setAmount(String(editingTransaction.amount));
      setRemark(editingTransaction.remark || '');
      setDate(new Date(editingTransaction.date).toISOString().slice(0, 10));
      setError('');
    } else {
      // Clear form when editing is done or cancelled
      setAmount('');
      setRemark('');
      setDate(new Date().toISOString().slice(0, 10));
      setError('');
    }
  }, [editingTransaction]);

  const handleSubmit = (type: TransactionType | null) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid, positive amount.');
      return;
    }
    if (!date) {
        // This case is unlikely with a date input, but it's good practice.
        return;
    }
    setError('');

    let finalDate: string;
    const [year, month, day] = date.split('-').map(Number);

    if (editingTransaction) {
        const originalTime = new Date(editingTransaction.date);
        const updatedDate = new Date(
            year,
            month - 1,
            day,
            originalTime.getHours(),
            originalTime.getMinutes(),
            originalTime.getSeconds(),
            originalTime.getMilliseconds()
        );
        finalDate = updatedDate.toISOString();
    } else {
        const now = new Date();
        const newDate = new Date(
            year,
            month - 1,
            day,
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
        );
        finalDate = newDate.toISOString();
    }


    if (editingTransaction) {
      onSaveTransaction({ type: editingTransaction.type, amount: numericAmount, remark: remark.trim(), date: finalDate });
    } else if (type) {
      onSaveTransaction({ type, amount: numericAmount, remark: remark.trim(), date: finalDate });
      setAmount('');
      setRemark('');
      setDate(new Date().toISOString().slice(0, 10));
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700 h-full">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-50 mb-4">
        {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-400 mb-1">
            Amount
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-slate-400">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              placeholder="0.00"
              className="w-full bg-slate-700 border-slate-600 rounded-md py-2 pl-7 pr-4 text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              aria-describedby={error ? "amount-error" : undefined}
            />
          </div>
          {error && <p id="amount-error" className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
        <div>
           <label htmlFor="date" className="block text-sm font-medium text-slate-400 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-4 text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="remark" className="block text-sm font-medium text-slate-400 mb-1">
            Remark (Optional)
          </label>
          <input
            type="text"
            id="remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g., Office supplies"
            className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-4 text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {editingTransaction ? (
          <div className="space-y-4 pt-2">
            <button
              onClick={() => handleSubmit(null)}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
            >
              <PencilIcon />
              Update Transaction
            </button>
            <button
              onClick={onCancelEdit}
              className="flex items-center justify-center gap-2 w-full bg-slate-600 hover:bg-slate-700 text-slate-50 font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <button
              onClick={() => handleSubmit(TransactionType.INVESTMENT)}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
            >
              <PlusIcon />
              Add Investment
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSubmit(TransactionType.PURCHASE)}
                className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
              >
                <ArrowDownIcon />
                Purchase
              </button>
              <button
                onClick={() => handleSubmit(TransactionType.SALE)}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500"
              >
                <ArrowUpIcon />
                Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;