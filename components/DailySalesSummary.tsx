import React, { useState, useMemo } from 'react';

type SalesRecord = { date: string, totalSales: number };

interface DailySalesSummaryProps {
  dailySalesHistory: SalesRecord[];
  weeklySalesHistory: SalesRecord[];
  monthlySalesHistory: SalesRecord[];
}

const DailySalesSummary: React.FC<DailySalesSummaryProps> = ({ 
  dailySalesHistory,
  weeklySalesHistory,
  monthlySalesHistory,
}) => {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'myr',
  }), []);

  const formatters = useMemo(() => ({
    daily: new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }),
    weekly: new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }),
    monthly: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }),
  }), []);

  const viewOptions: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];

  const { data, formatter, labelPrefix, emptyMessage } = useMemo(() => {
    switch (view) {
      case 'weekly':
        return {
          data: weeklySalesHistory,
          formatter: formatters.weekly,
          labelPrefix: 'Week of ',
          emptyMessage: 'No sales recorded this week.'
        };
      case 'monthly':
        return {
          data: monthlySalesHistory,
          // For 'YYYY-MM' strings, create a date object safely
          formatter: (dateStr: string) => formatters.monthly.format(new Date(`${dateStr}-02`)),
          labelPrefix: '',
          emptyMessage: 'No sales recorded this month.'
        };
      case 'daily':
      default:
        return {
          data: dailySalesHistory,
          formatter: formatters.daily,
          labelPrefix: '',
          emptyMessage: 'No sales recorded yet.'
        };
    }
  }, [view, dailySalesHistory, weeklySalesHistory, monthlySalesHistory, formatters]);
  
  return (
    <div className="pt-4">
      <div className="flex bg-slate-900 rounded-lg p-1 text-sm mb-4 self-start">
        {viewOptions.map(option => (
          <button
            key={option}
            onClick={() => setView(option)}
            className={`capitalize px-3 py-1 rounded-md transition-colors duration-200 ${
              view === option
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-10 flex-1 flex flex-col justify-center items-center">
          <p className="text-slate-400">{emptyMessage}</p>
          <p className="text-slate-500 text-sm mt-1">Sales transactions will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-96">
          {data.map(({ date, totalSales }) => (
            <li key={date} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-700/50 p-3 rounded-lg">
              <span className="text-slate-300 font-medium text-sm w-full text-left">
                {labelPrefix}
                {typeof formatter === 'function' ? formatter(date) : formatter.format(new Date(date))}
              </span>
              <span className="text-green-400 font-semibold w-full text-left sm:text-right mt-1 sm:mt-0">{currencyFormatter.format(totalSales)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DailySalesSummary;