import { useState, useEffect } from 'react';
import { Search, LogOut, Sun, Moon, BarChart2, Gamepad2 } from 'lucide-react';
import SimulatorMode from './SimulatorMode';
import InformationMode from './InformationMode';
import { fetchStockQuote, fetchStockOverview, fetchCompanyNews, fetchStockHistory, analyzeStockWithAI } from '../utils/api';

const Dashboard = ({ username, onLogout }) => {
    const [searchSymbol, setSearchSymbol] = useState('');
    const [viewMode, setViewMode] = useState('info'); // 'info' or 'simulator'

    // API Data State
    const [stockData, setStockData] = useState(null);
    const [overviewData, setOverviewData] = useState(null);
    const [news, setNews] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [chartData, setChartData] = useState(null);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Dark Mode Logic
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Handle Scenario Loading (For Missions)
    const handleScenarioLoad = async (symbol) => {
        setLoading(true);
        setError('');

        // Switch to simulator view immediately to show loading state there if needed
        setViewMode('simulator');

        try {
            // 1. Fetch Data (with FULL history for scenarios)
            const [quote, overview, newsData, history] = await Promise.all([
                fetchStockQuote(symbol),
                fetchStockOverview(symbol),
                fetchCompanyNews(symbol),
                fetchStockHistory(symbol, true) // <--- TRUE for full history (20 years)
            ]);

            setStockData(quote);
            setOverviewData(overview);
            setNews(newsData);
            setChartData(history);

            // 2. Return true to signal success to SimulatorMode
            return true;
        } catch (err) {
            setError("Scenario load failed: " + err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchSymbol.trim()) return;

        setLoading(true);
        setError('');
        setStockData(null);
        setOverviewData(null);
        setNews([]);
        setAnalysis(null);
        setChartData(null);

        try {
            const symbol = searchSymbol.trim().toUpperCase();

            const [quote, overview, newsData, history] = await Promise.all([
                fetchStockQuote(symbol),
                fetchStockOverview(symbol),
                fetchCompanyNews(symbol),
                fetchStockHistory(symbol).catch(err => {
                    console.warn('Chart data failed:', err);
                    return null;
                }),
            ]);

            setStockData(quote);
            setOverviewData(overview);
            setNews(newsData);
            setChartData(history);

            // Start AI Analysis in background
            analyzeStockWithAI(quote, overview, newsData)
                .then(setAnalysis)
                .catch(console.error);

        } catch (err) {
            setError(err.message || 'Eroare la căutarea companiei');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-x-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Hermes</h1>

                        {/* View Mode Toggles - Only show if data is loaded OR if in simulator mode (for missions) */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mx-4">
                            <button
                                onClick={() => setViewMode('info')}
                                disabled={!stockData && viewMode === 'simulator'}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                    viewMode === 'info'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <BarChart2 className="w-4 h-4" />
                                Analysis
                            </button>
                            <button
                                onClick={() => setViewMode('simulator')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                    viewMode === 'simulator'
                                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <Gamepad2 className="w-4 h-4" />
                                Missions
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <div className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                                <span className="font-semibold">{username}</span>
                            </div>
                            <button onClick={onLogout} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
                {/* Search Bar - Only visible in Info Mode or if stock is loaded */}
                {viewMode === 'info' && (
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchSymbol}
                                    onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                                    placeholder="Caută simbol (ex: AAPL, TSLA)"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
                                {loading ? '...' : 'Search'}
                            </button>
                        </div>
                    </form>
                )}

                {error && <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>}

                {/* Render Views */}
                <div className="transition-opacity duration-300">
                    {viewMode === 'info' && stockData && (
                        <InformationMode
                            stockData={stockData}
                            overviewData={overviewData}
                            news={news}
                            analysis={analysis}
                            chartData={chartData}
                            loading={loading}
                        />
                    )}

                    {viewMode === 'simulator' && (
                        <SimulatorMode
                            originalStockData={stockData}
                            chartData={chartData}
                            onLoadScenario={handleScenarioLoad}
                            isLoading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;