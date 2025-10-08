import React, { useMemo } from 'react';
import TrendingUpIcon from './icons/TrendingUpIcon';

interface SalesChartProps {
  data: { date: string, totalSales: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    const maxSales = useMemo(() => {
        const max = Math.max(...data.map(d => d.totalSales));
        return max > 0 ? max : 1; // Avoid division by zero
    }, [data]);
    
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'myr',
    }), []);

    const dayFormatter = useMemo(() => new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
    }), []);
    
    const hasSalesData = useMemo(() => data.some(d => d.totalSales > 0), [data]);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUpIcon />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-50">Last 7 Days Sales</h3>
            </div>
            {hasSalesData ? (
                <div className="flex justify-between items-end h-48 gap-1 sm:gap-2">
                    {data.map(({ date, totalSales }) => {
                        const heightPercentage = (totalSales / maxSales) * 100;
                        const dayLabel = dayFormatter.format(new Date(date));

                        return (
                            <div key={date} className="flex-1 flex flex-col items-center justify-end h-full group">
                                <div className="relative w-full h-full flex items-end justify-center">
                                    <div 
                                        className="w-3/4 bg-blue-600 rounded-t-md hover:bg-blue-500 transition-colors duration-200"
                                        style={{ height: `${heightPercentage}%` }}
                                    >
                                    </div>
                                    <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {currencyFormatter.format(totalSales)}
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 mt-2">{dayLabel}</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 flex flex-col justify-center items-center h-48">
                    <p className="text-slate-400">No sales recorded in the last 7 days.</p>
                    <p className="text-slate-500 text-sm mt-1">Chart will appear here once you add sales.</p>
                </div>
            )}
        </div>
    );
};

export default SalesChart;