import React, { useState, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ConfirmationModal from './components/ConfirmationModal';
import DailySalesSummary from './components/DailySalesSummary';
import SalesChart from './components/SalesChart';
import useLocalStorage from './hooks/useLocalStorage';
import { Transaction, TransactionType } from './types';
import CalendarIcon from './components/icons/CalendarIcon';

const getStartOfWeek = (date: Date) => {
  const dt = new Date(date);
  // Set to UTC to avoid timezone issues with date calculations
  dt.setUTCHours(0, 0, 0, 0);
  const day = dt.getUTCDay(); // Sunday = 0, Monday = 1, etc.
  const diff = dt.getUTCDate() - day;
  return new Date(dt.setUTCDate(diff));
};


const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<Transaction | string[] | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const formRef = useRef<HTMLDivElement>(null);

  const { capital, totalProfit, dailySales } = useMemo(() => {
    const result = transactions.reduce((acc, transaction) => {
      const todayString = new Date().toISOString().slice(0, 10);
      
      if (transaction.type === TransactionType.SALE) {
        acc.capital += transaction.amount;
        acc.profit += transaction.amount;
        if (transaction.date.slice(0, 10) === todayString) {
          acc.dailySales += transaction.amount;
        }
      } else if (transaction.type === TransactionType.PURCHASE) {
        acc.capital -= transaction.amount;
        acc.profit -= transaction.amount;
      } else if (transaction.type === TransactionType.INVESTMENT) {
        acc.capital += transaction.amount;
      }
      return acc;
    }, { capital: 0, profit: 0, dailySales: 0 });

    return { capital: result.capital, totalProfit: result.profit, dailySales: result.dailySales };
  }, [transactions]);
  
  const salesByDayLast7Days = useMemo(() => {
    const salesData: { date: string; totalSales: number }[] = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Initialize the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - i);
        const dateString = date.toISOString().slice(0, 10);
        salesData.push({ date: dateString, totalSales: 0 });
    }

    // Populate with sales data
    transactions.forEach(transaction => {
        if (transaction.type === TransactionType.SALE) {
            const dateKey = transaction.date.slice(0, 10);
            const dayData = salesData.find(d => d.date === dateKey);
            if (dayData) {
                dayData.totalSales += transaction.amount;
            }
        }
    });

    return salesData;
  }, [transactions]);
  
  const dailySalesHistory = useMemo(() => {
    const salesByDate = transactions.reduce((acc, transaction) => {
      if (transaction.type === TransactionType.SALE) {
        const dateKey = transaction.date.slice(0, 10); // YYYY-MM-DD
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey] += transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByDate)
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const weeklySalesHistory = useMemo(() => {
    const salesByWeek = transactions.reduce((acc, transaction) => {
      if (transaction.type === TransactionType.SALE) {
        const weekStartDate = getStartOfWeek(new Date(transaction.date));
        const dateKey = weekStartDate.toISOString().slice(0, 10); // YYYY-MM-DD for start of week
        
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey] += transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByWeek)
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const monthlySalesHistory = useMemo(() => {
    const salesByMonth = transactions.reduce((acc, transaction) => {
      if (transaction.type === TransactionType.SALE) {
        const dateKey = transaction.date.slice(0, 7); // YYYY-MM
        
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey] += transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByMonth)
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);


  const handleSaveTransaction = useCallback((data: { type: TransactionType, amount: number, remark: string, date: string }) => {
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(prevTransactions =>
        prevTransactions.map(t =>
          t.id === editingTransaction.id
            ? { ...t, amount: data.amount, remark: data.remark, date: data.date }
            : t
        )
      );
      setEditingTransaction(null);
    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: data.type,
        amount: data.amount,
        date: data.date,
        remark: data.remark,
      };
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    }
  }, [setTransactions, editingTransaction]);
  
  const handleStartEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedTransactionIds([]);
    setActiveTab('dashboard');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTransaction(null);
  }, []);

  const handleRequestDelete = useCallback((transaction: Transaction) => {
    setDeletionRequest(transaction);
  }, []);
  
  const handleRequestBulkDelete = useCallback(() => {
    if (selectedTransactionIds.length > 0) {
      setDeletionRequest([...selectedTransactionIds]);
    }
  }, [selectedTransactionIds]);

  const handleConfirmDelete = useCallback(() => {
    if (!deletionRequest) return;

    if (Array.isArray(deletionRequest)) {
      const idsToDelete = new Set(deletionRequest);
      setTransactions(prev => prev.filter(t => !idsToDelete.has(t.id)));
    } else {
      setTransactions(prev => prev.filter(t => t.id !== deletionRequest.id));
    }
    
    setDeletionRequest(null);
    setSelectedTransactionIds([]);
  }, [deletionRequest, setTransactions]);

  const handleCancelDelete = useCallback(() => {
    setDeletionRequest(null);
  }, []);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedTransactionIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedTransactionIds.length === transactions.length) {
      setSelectedTransactionIds([]);
    } else {
      setSelectedTransactionIds(transactions.map(t => t.id));
    }
  }, [transactions, selectedTransactionIds.length]);

  const getModalMessage = () => {
    if (!deletionRequest) return '';
    if (Array.isArray(deletionRequest)) {
      return `Are you sure you want to permanently delete the ${deletionRequest.length} selected transactions? This action cannot be undone.`;
    }
    return `Are you sure you want to permanently delete this ${deletionRequest.type} transaction? This action cannot be undone.`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-2 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header capital={capital} totalProfit={totalProfit} dailySales={dailySales} />
        
        <div className="mt-8 border-b border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-blue-500 ${
                    activeTab === 'dashboard'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    }`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-blue-500 ${
                    activeTab === 'analytics'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    }`}
                >
                    Analytics
                </button>
            </nav>
        </div>

        <main className="mt-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-fast">
              <div className="lg:col-span-2">
                 <TransactionList
                  transactions={transactions}
                  onEditTransaction={handleStartEdit}
                  onDeleteTransaction={handleRequestDelete}
                  selectedIds={selectedTransactionIds}
                  onToggleSelection={handleToggleSelection}
                  onToggleSelectAll={handleToggleSelectAll}
                  onBulkDelete={handleRequestBulkDelete}
                />
              </div>
              <div className="lg:col-span-1 space-y-8">
                <div ref={formRef}>
                  <TransactionForm
                    onSaveTransaction={handleSaveTransaction}
                    editingTransaction={editingTransaction}
                    onCancelEdit={handleCancelEdit}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
             <div className="space-y-8 animate-fade-in-fast">
                <SalesChart data={salesByDayLast7Days} />
                <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CalendarIcon />
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-50">Sales History</h3>
                    </div>
                    <DailySalesSummary 
                        dailySalesHistory={dailySalesHistory}
                        weeklySalesHistory={weeklySalesHistory}
                        monthlySalesHistory={monthlySalesHistory}
                    />
                </div>
            </div>
          )}
        </main>
      </div>
       <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Capital Tracker &copy; {new Date().getFullYear()} - All data is stored locally.</p>
      </footer>
      <ConfirmationModal 
        isOpen={!!deletionRequest}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={getModalMessage()}
      />
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;