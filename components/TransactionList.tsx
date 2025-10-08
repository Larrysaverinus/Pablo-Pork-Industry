import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import SortAscIcon from './icons/SortAscIcon';
import SortDescIcon from './icons/SortDescIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
}

const TransactionItem: React.FC<{ 
  transaction: Transaction;
  isSelected: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onToggleSelection: (id: string) => void;
  index: number;
}> = ({ transaction, isSelected, onEdit, onDelete, onToggleSelection, index }) => {
  const { id, type, amount, date, remark } = transaction;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'myr',
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

  let icon, iconBgColor, textColor, sign, borderColor;

  switch (type) {
    case TransactionType.SALE:
      icon = <ArrowUpIcon />;
      iconBgColor = 'bg-green-500/10';
      textColor = 'text-green-400';
      sign = '+';
      borderColor = 'border-green-500';
      break;
    case TransactionType.PURCHASE:
      icon = <ArrowDownIcon />;
      iconBgColor = 'bg-red-500/10';
      textColor = 'text-red-400';
      sign = '-';
      borderColor = 'border-red-500';
      break;
    case TransactionType.INVESTMENT:
      icon = <PlusIcon />;
      iconBgColor = 'bg-blue-500/10';
      textColor = 'text-blue-400';
      sign = '+';
      borderColor = 'border-blue-500';
      break;
    default:
      icon = null;
      iconBgColor = 'bg-slate-500/10';
      textColor = 'text-slate-400';
      sign = '';
      borderColor = 'border-slate-500';
      break;
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection(id);
  }

  return (
    <li 
      className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer border-l-4 animate-list-item-in ${isSelected ? `bg-blue-900/40 ${borderColor}` : 'bg-slate-800 border-transparent hover:bg-slate-700/50 hover:border-slate-500'}`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onToggleSelection(id)}
    >
      <div className="flex items-start gap-4 overflow-hidden">
        <div className="flex-shrink-0 flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(id)}
            onClick={handleCheckboxClick}
            aria-label={`Select transaction for ${remark || transaction.type}`}
            className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
          />
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor} ${textColor} mt-1`}>
            {icon}
          </div>
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-slate-50 capitalize">{transaction.type}</p>
          <p className="text-sm text-slate-400">{formattedDate}</p>
          {remark && <p className="text-sm text-slate-500 italic mt-1 truncate">{remark}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <p className={`font-semibold text-lg ${textColor} flex-shrink-0`}>
          {sign}
          {formattedAmount}
        </p>
        <div className={`flex transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100 md:opacity-0 group-hover:md:opacity-100 focus-within:md:opacity-100'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(transaction); }}
            aria-label={`Edit transaction for ${remark || transaction.type}`}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600"
          >
            <PencilIcon />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(transaction); }}
            aria-label={`Delete transaction for ${remark || transaction.type}`}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-red-500/50"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  onBulkDelete,
}) => {
  const [sortKey, setSortKey] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [transactions, sortKey, sortOrder]);

  const handleSortOrderToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };
  
  const numSelected = selectedIds.length;
  const numTransactions = transactions.length;
  const isAllSelected = numSelected === numTransactions && numTransactions > 0;

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 min-h-[40px]">
        {numSelected > 0 ? (
          <div className="w-full flex justify-between items-center animate-fade-in-fast">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = numSelected > 0 && numSelected < numTransactions;
                }}
                onChange={onToggleSelectAll}
                className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                aria-label="Select all transactions"
              />
              <span className="text-slate-50 font-semibold">{numSelected} selected</span>
            </div>
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors duration-200"
              aria-label={`Delete ${numSelected} selected transactions`}
            >
              <TrashIcon />
              Delete Selected
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in-fast">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-50">Transaction History</h3>
            {transactions.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="sort-key" className="text-sm text-slate-400">Sort by</label>
                <select
                  id="sort-key"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as 'date' | 'amount' | 'type')}
                  className="bg-slate-700 border-slate-600 rounded-md py-1 px-2 text-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                </select>
                <button
                  onClick={handleSortOrderToggle}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600 transition"
                  aria-label={`Sort in ${sortOrder === 'asc' ? 'descending' : 'ascending'} order`}
                >
                  {sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10 flex-1 flex flex-col justify-center items-center">
          <p className="text-slate-400">No transactions yet.</p>
          <p className="text-slate-500 text-sm mt-1">Add a purchase or sale to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-y-auto pr-2">
          {sortedTransactions.map((transaction, index) => (
            <TransactionItem 
              key={transaction.id}
              transaction={transaction}
              isSelected={selectedIds.includes(transaction.id)}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
              onToggleSelection={onToggleSelection}
              index={index}
            />
          ))}
        </ul>
      )}
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }

        @keyframes list-item-in {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-list-item-in {
            animation: list-item-in 0.4s ease-out forwards;
            opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default TransactionList;