import { TrendingUp, TrendingDown, DollarSign, BarChart3, TrendingUp as Growth, Percent } from 'lucide-react';
import { getIndustryAverage } from '../utils/api';

const StockInfo = ({ stockData, overviewData, loading }) => {
    if (loading) return <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />;
    if (!stockData || !overviewData) return null;

    const isPositive = stockData.change >= 0;
    const industryAvgPE = getIndustryAverage(overviewData.sector);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{overviewData.name || stockData.symbol}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{overviewData.sector} • {overviewData.industry}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 dark:text-white">${stockData.price.toFixed(2)}</div>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'} font-semibold text-sm mt-1`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {stockData.change.toFixed(2)} ({stockData.changePercent})
                    </div>
                </div>
            </div>

            {/* Sandbox Removed Here */}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard icon={<DollarSign />} label="Market Cap" value={`$${(overviewData.marketCap / 1e9).toFixed(2)}B`} />
                <MetricCard
                    icon={<BarChart3 />}
                    label="P/E Ratio"
                    value={overviewData.peRatio.toFixed(2)}
                    highlight={overviewData.peRatio > industryAvgPE ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}
                />
                <MetricCard icon={<Growth />} label="EPS" value={`$${overviewData.eps.toFixed(2)}`} />
                <MetricCard icon={<Percent />} label="Profit Margin" value={`${overviewData.profitMargin.toFixed(2)}%`} />
                <MetricCard icon={<BarChart3 />} label="Beta" value={overviewData.beta.toFixed(2)} />
                <MetricCard icon={<DollarSign />} label="Revenue" value={`$${(overviewData.revenue / 1e9).toFixed(2)}B`} />
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, highlight }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <div className="w-4 h-4">{icon}</div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className={`text-xl font-bold text-gray-800 dark:text-gray-100 ${highlight || ''}`}>{value}</div>
    </div>
);

export default StockInfo;