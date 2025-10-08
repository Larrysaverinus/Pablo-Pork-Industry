import React from 'react';
import DollarSignIcon from './icons/DollarSignIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import ChartPieIcon from './icons/ChartPieIcon';

interface HeaderProps {
  capital: number;
  totalProfit: number;
  dailySales: number;
}

interface StatCardProps {
    title: string;
    amount: number;
    icon: React.ReactNode;
    colorClass: string;
    iconBgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, colorClass, iconBgClass }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'myr',
    }).format(amount);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex-1 flex items-center gap-4 w-full">
            <div className={`p-3 rounded-full ${iconBgClass} ${colorClass}`}>
                {icon}
            </div>
            <div className="text-left">
                <h2 className="text-sm font-semibold text-slate-400">{title}</h2>
                <p className={`text-xl sm:text-2xl font-bold ${colorClass} tracking-wider`}>{formattedAmount}</p>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ capital, totalProfit, dailySales }) => {
  const capitalColor = capital >= 0 ? 'text-blue-400' : 'text-red-400';
  const profitColor = totalProfit >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <header className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">Pablo Pork Industry</h1>
            <p className="text-slate-400 mt-1">Your financial performance dashboard.</p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <StatCard 
                title="Current Capital"
                amount={capital}
                icon={<DollarSignIcon />}
                colorClass={capitalColor}
                iconBgClass={capital >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}
            />
             <StatCard 
                title="Total Profit"
                amount={totalProfit}
                icon={<ChartPieIcon />}
                colorClass={profitColor}
                iconBgClass={totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}
            />
            <StatCard 
                title="Today's Sales"
                amount={dailySales}
                icon={<TrendingUpIcon />}
                colorClass="text-yellow-400"
                iconBgClass="bg-yellow-500/10"
            />
        </div>
      </div>
    </header>
  );
};

export default Header;