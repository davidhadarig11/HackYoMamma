import { useState, useEffect, useRef } from 'react';
import { Play, Pause, History, Target, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Confetti from 'react-confetti'; // REQUIRES: npm install react-confetti
import StockChart from './StockChart';
import SimulatorPanel from './SimulatorPanel';

// --- MISSION DATA CONFIGURATION ---
const MISSIONS = [
    {
        id: 'covid_crash',
        title: 'The Covid Crash',
        symbol: 'SPY',
        startDate: '2020-02-15',
        durationDays: 60,
        targetReturn: 5,
        difficulty: 'Easy', // Difficulty: Easy
        description: "The world is entering lockdown. Markets are panic selling. Can you time the bottom or short the drop to make a profit?",
        // Color: GREEN (Friendly/Easy)
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
    },
    {
        id: 'tech_bubble',
        title: 'The 2021 Tech Rally',
        symbol: 'TSLA',
        startDate: '2020-11-01',
        durationDays: 45,
        targetReturn: 15,
        difficulty: 'Medium',
        description: "EV mania is taking over. The trend is your friend. Ride the massive wave of liquidity without crashing.",
        // Color: BLUE (Medium)
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
    },
    {
        id: 'inflation_fight',
        title: 'Inflation Fighter',
        symbol: 'GLD',
        startDate: '2022-01-01',
        durationDays: 90,
        targetReturn: 8,
        difficulty: 'Hard', // Difficulty: Hard
        description: "Inflation is skyrocketing. Tech stocks are crashing. Find safety in Gold and preserve capital.",
        // Color: RED (Danger/Hard)
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
    }
];

const SimulatorMode = ({ originalStockData, chartData, onLoadScenario, isLoading }) => {
    const INITIAL_CASH = 10000;

    // --- STATE ---
    const [mode, setMode] = useState('selection');
    const [activeMission, setActiveMission] = useState(null);
    const [missionResult, setMissionResult] = useState(null); // 'win' | 'loss'

    const [portfolio, setPortfolio] = useState({
        cash: INITIAL_CASH,
        holdings: {},
        history: []
    });

    const [transactions, setTransactions] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [simIndex, setSimIndex] = useState(null);
    const [simStockData, setSimStockData] = useState(null);
    const [daysRemaining, setDaysRemaining] = useState(0);

    // For Confetti Sizing
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const playInterval = useRef(null);

    // --- COMPUTED VALUES ---
    const currentPrice = simStockData ? simStockData.price : 0;
    const holdingsQty = portfolio.holdings[originalStockData?.symbol] || 0;
    const holdingsValue = holdingsQty * currentPrice;
    const netWorth = portfolio.cash + holdingsValue;
    const totalReturn = ((netWorth - INITIAL_CASH) / INITIAL_CASH) * 100;

    // --- EFFECTS ---

    // Handle Window Resize for Confetti
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-Play Logic
    useEffect(() => {
        if (isPlaying && isSimulating) {
            playInterval.current = setInterval(() => {
                nextSimDay();
            }, 800);
        } else {
            clearInterval(playInterval.current);
        }
        return () => clearInterval(playInterval.current);
    }, [isPlaying, isSimulating, simIndex]);

    // Win/Loss Condition Check
    useEffect(() => {
        if (activeMission && isSimulating && mode === 'play') {
            if (totalReturn >= activeMission.targetReturn) {
                endMission('win');
            } else if (daysRemaining <= 0) {
                endMission('loss');
            }
        }
    }, [totalReturn, daysRemaining, activeMission, mode, isSimulating]);

    // Initialize Simulation when data is loaded
    useEffect(() => {
        if (activeMission && chartData && chartData.length > 0 && mode === 'selection') {
            const startIndex = chartData.findIndex(c => c.fullDate >= activeMission.startDate);

            if (startIndex === -1) {
                console.error("Start date not found in history");
                return;
            }

            startMissionSimulation(startIndex);
        }
    }, [chartData, activeMission]);

    // --- ACTIONS ---

    const handleSelectMission = async (mission) => {
        if (!onLoadScenario) return;
        setActiveMission(mission);
        await onLoadScenario(mission.symbol);
    };

    const startMissionSimulation = (startIndex) => {
        setMode('play');
        setPortfolio({ cash: INITIAL_CASH, holdings: {}, history: [] });
        setTransactions([]);
        setIsSimulating(true);
        setSimIndex(startIndex);
        setDaysRemaining(activeMission.durationDays);
        updateSimData(startIndex);
    };

    const nextSimDay = () => {
        setSimIndex(prev => {
            if (!chartData || prev >= chartData.length - 1) {
                setIsPlaying(false);
                return prev;
            }
            const newIndex = prev + 1;
            updateSimData(newIndex);
            setDaysRemaining(d => d - 1);
            return newIndex;
        });
    };

    const updateSimData = (index) => {
        const candle = chartData[index];
        const prevCandle = chartData[index - 1] || candle;

        setSimStockData({
            symbol: originalStockData.symbol,
            price: candle.close,
            change: candle.close - prevCandle.close,
            changePercent: ((candle.close - prevCandle.close) / prevCandle.close * 100).toFixed(2) + '%',
            volume: candle.volume,
            high: candle.high,
            low: candle.low,
            open: candle.open,
            date: candle.date,
            fullDate: candle.fullDate
        });
    };

    const endMission = (result) => {
        setIsPlaying(false);
        setIsSimulating(false);
        setMissionResult(result);
        setMode('result');
    };

    const exitMissionMode = () => {
        setActiveMission(null);
        setMode('selection');
        setIsSimulating(false);
        setSimIndex(null);
    };

    const handleBuy = (qty) => {
        if(qty <= 0) return;
        const cost = qty * currentPrice;
        if (portfolio.cash >= cost) {
            setPortfolio(prev => ({
                ...prev,
                cash: prev.cash - cost,
                holdings: { [originalStockData.symbol]: (prev.holdings[originalStockData.symbol] || 0) + qty }
            }));
            logTransaction('BUY', qty, currentPrice);
        }
    };

    const handleSell = (qty) => {
        if(qty <= 0) return;
        if (holdingsQty >= qty) {
            setPortfolio(prev => ({
                ...prev,
                cash: prev.cash + (qty * currentPrice),
                holdings: { [originalStockData.symbol]: prev.holdings[originalStockData.symbol] - qty }
            }));
            logTransaction('SELL', qty, currentPrice);
        }
    };

    const logTransaction = (type, qty, price) => {
        setTransactions(prev => [{
            type,
            qty,
            price,
            date: simStockData.date,
            id: Date.now()
        }, ...prev]);
    };

    // --- RENDER: 1. SELECTION SCREEN ---
    if (mode === 'selection') {
        return (
            <div className="animate-fade-in p-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Mission Control</h2>
                    <p className="text-gray-600 dark:text-gray-400">Choose a historical scenario and test your skills.</p>
                </div>

                {isLoading && (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-blue-600 font-semibold">Loading Time Machine...</p>
                    </div>
                )}

                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MISSIONS.map(mission => (
                            <div key={mission.id} className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 hover:scale-105 transition-transform cursor-pointer overflow-hidden flex flex-col ${mission.color.split(' ').find(c => c.startsWith('border'))}`}>
                                <div className={`p-4 font-bold flex justify-between items-center ${mission.color}`}>
                                    <span>{mission.difficulty}</span>
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{mission.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{mission.description}</p>

                                    <div className="space-y-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                        <div className="flex justify-between">
                                            <span>Asset:</span> <span className="font-bold text-gray-800 dark:text-white">{mission.symbol}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Start Date:</span> <span className="font-bold text-gray-800 dark:text-white">{mission.startDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Goal:</span> <span className="font-bold text-green-600">+{mission.targetReturn}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Time Limit:</span> <span className="font-bold text-gray-800 dark:text-white">{mission.durationDays} Days</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSelectMission(mission)}
                                        className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md"
                                    >
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER: 2. MISSION RESULT OVERLAY ---
    if (mode === 'result') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                {/* CONFETTI ANIMATION ON WIN */}
                {missionResult === 'win' && (
                    <Confetti
                        width={windowSize.width}
                        height={windowSize.height}
                        recycle={true}
                        numberOfPieces={500}
                    />
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-bounce-in border-4 border-white dark:border-gray-700 z-10">
                    {missionResult === 'win' ? (
                        <div className="text-green-500 mb-4 flex justify-center">
                            <CheckCircle className="w-20 h-20" />
                        </div>
                    ) : (
                        <div className="text-red-500 mb-4 flex justify-center">
                            <XCircle className="w-20 h-20" />
                        </div>
                    )}

                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {missionResult === 'win' ? 'Mission Accomplished!' : 'Mission Failed'}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {missionResult === 'win'
                            ? `Great trading! You reached the +${activeMission.targetReturn}% profit goal in time.`
                            : `You ran out of time or funds. The market was tough.`}
                    </p>

                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500 dark:text-gray-400">Final Return</span>
                            <span className={`font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Net Worth</span>
                            <span className="font-bold text-gray-800 dark:text-white">
                                ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={exitMissionMode}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg"
                    >
                        Back to Missions
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: 3. ACTIVE SIMULATOR (Mission Mode) ---
    const activeStockData = isSimulating && simStockData ? simStockData : originalStockData;

    if (!activeStockData) return null;

    return (
        <div className="space-y-6 animate-fade-in pb-10">

            {/* MISSION HEADER BAR */}
            <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-indigo-600">
                <div className="flex items-center gap-3">
                    <button onClick={exitMissionMode} className="p-2 hover:bg-white/20 rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {activeMission.title}
                            <span className="bg-indigo-700 text-xs px-2 py-1 rounded text-indigo-200">
                                {activeMission.symbol}
                            </span>
                        </h3>
                        <p className="text-indigo-300 text-xs">{activeMission.description}</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="text-center">
                        <div className="text-xs text-indigo-300 uppercase flex items-center justify-center gap-1">
                            <Target className="w-3 h-3" /> Goal
                        </div>
                        <div className="font-bold text-xl text-green-400">+{activeMission.targetReturn}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-indigo-300 uppercase flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> Days Left
                        </div>
                        <div className={`font-bold text-xl ${daysRemaining < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {daysRemaining}
                        </div>
                    </div>
                </div>
            </div>

            {/* DASHBOARD METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Total Net Worth</p>
                        <h3 className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${totalReturn >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Current Progress</p>
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${Math.max(0, Math.min(100, (totalReturn / activeMission.targetReturn) * 100))}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {totalReturn.toFixed(1)} / {activeMission.targetReturn}%
                        </span>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                            isPlaying
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {isPlaying ? <><Pause className="w-4 h-4"/> Pause</> : <><Play className="w-4 h-4"/> Play</>}
                    </button>

                    <button
                        onClick={nextSimDay}
                        disabled={isPlaying}
                        className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        +1 Day
                    </button>
                </div>
            </div>

            <div className="relative">
                <StockChart
                    key={activeMission ? activeMission.id : 'default-chart'}
                    chartData={chartData}
                    symbol={activeStockData.symbol}
                    simulationIndex={simIndex}
                    learnMode={true}
                />
                {isSimulating && simStockData && (
                    <div className="absolute top-4 left-16 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-sm">
                        📅 {simStockData.date}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SimulatorPanel
                        stockData={activeStockData}
                        portfolio={portfolio}
                        onBuy={handleBuy}
                        onSell={handleSell}
                        isSimulating={isSimulating}
                        holdingsQty={holdingsQty}
                        holdingsValue={holdingsValue}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 h-full max-h-[300px] flex flex-col">
                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" /> Recent Trades
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                        {transactions.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">No trades yet.</p>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                     style={{ borderLeftColor: t.type === 'BUY' ? '#10b981' : '#ef4444' }}>
                                    <div>
                                        <span className={`font-bold ${t.type === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {t.type}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">{t.date}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold dark:text-white">{t.qty} shares</div>
                                        <div className="text-xs text-gray-500">@ ${t.price.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulatorMode;