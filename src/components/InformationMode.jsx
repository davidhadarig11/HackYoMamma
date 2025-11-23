import { useState } from 'react';
import { MessageCircle, Brain, Newspaper, X, Sparkles, ArrowLeft } from 'lucide-react';
import StockInfo from './StockInfo';
import StockChart from './StockChart';
import NewsCard from './NewsCard';
import AIAnalysis from './AIAnalysis';
import ChatInterface from './ChatInterface';
import { calculateOverallSentiment } from '../utils/api';

const InformationMode = ({ stockData, overviewData, news, analysis, chartData, loading }) => {
    // State for Full Screen Overlays
    const [activeOverlay, setActiveOverlay] = useState(null); // 'tutor' | 'news' | null

    // State for Chart Analysis
    const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [fluctuationResult, setFluctuationResult] = useState(null);

    // --- CHART ANALYSIS LOGIC (Kept from previous steps) ---
    const handleChartSelection = (startDate, endDate) => {
        if (!startDate || !endDate || !chartData) return;
        setAnalyzing(true);
        setShowDeepAnalysis(true);
        setFluctuationResult(null);

        const startData = chartData.find(d => d.date === startDate);
        const endData = chartData.find(d => d.date === endDate);

        if (!startData || !endData) {
            setAnalyzing(false);
            return;
        }

        setTimeout(() => {
            const startPrice = startData.close;
            const endPrice = endData.close;
            const changePercent = ((endPrice - startPrice) / startPrice) * 100;
            const month = (startData.fullDate || startData.date).split('-')[1];

            let logic = "Consolidare tehnică fără catalizatori majori.";
            let catalyst = "Activitate de tranzacționare normală.";

            if (Math.abs(changePercent) > 10) {
                 if (changePercent > 0) {
                     logic = "Momentum puternic de cumpărare (FOMO) susținut de volume ridicate.";
                     catalyst = "Posibilă depășire a așteptărilor privind veniturile (Earnings Beat).";
                 } else {
                     logic = "Presiune de vânzare agresivă; spargerea nivelurilor de suport.";
                     catalyst = "Temeri macroeconomice sau știri negative specifice sectorului.";
                 }
            } else if (month === '09' || month === '10') {
                 logic = changePercent > 0 ? "Revenire sezonieră (Q4 Rally anticipation)." : "Corecție tipică lunii Septembrie.";
                 catalyst = "Rebalansarea portofoliilor fondurilor de investiții.";
            }

            setFluctuationResult({
                range: `${startDate} ➔ ${endDate}`,
                change: changePercent.toFixed(2) + "%",
                startPrice: startPrice.toFixed(2),
                endPrice: endPrice.toFixed(2),
                logic,
                catalyst
            });
            setAnalyzing(false);
        }, 1500);
    };

    const generateFluctuationAnalysis = (days) => {
        if (!chartData || chartData.length === 0) return;
        const endDate = chartData[chartData.length-1].date;
        const startIndex = Math.max(0, chartData.length - (typeof days === 'number' ? days : 30));
        const startDate = chartData[startIndex].date;
        handleChartSelection(startDate, endDate);
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-32">

            {/* ==================================================================================
                FULL SCREEN OVERLAYS (The "Full Page Extension")
               ================================================================================== */}

            {/* 1. AI TUTOR FULL PAGE OVERLAY */}
            {activeOverlay === 'tutor' && (
                <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 overflow-y-auto animate-fade-in">
                    <div className="max-w-4xl mx-auto p-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveOverlay(null)}
                                className="p-3 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                            </button>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <MessageCircle className="w-8 h-8 text-blue-600" />
                                AI Financial Tutor
                            </h1>
                        </div>

                        {/* Content */}
                        <div className="space-y-8 pb-20">
                            <AIAnalysis
                                analysis={analysis}
                                loading={loading}
                                newsSentiment={calculateOverallSentiment(news)}
                                learnMode={true}
                            />
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-100">Live Chat Session</h3>
                                </div>
                                <ChatInterface
                                    stockData={stockData}
                                    overviewData={overviewData}
                                    verdict={analysis?.verdict || ''}
                                    news={news}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. NEWS FULL PAGE OVERLAY */}
            {activeOverlay === 'news' && (
                <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 overflow-y-auto animate-fade-in">
                    <div className="max-w-4xl mx-auto p-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveOverlay(null)}
                                className="p-3 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                            </button>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <Newspaper className="w-8 h-8 text-blue-600" />
                                Full Market Coverage
                            </h1>
                        </div>

                        {/* Content */}
                        <div className="pb-20">
                            <NewsCard news={news || []} loading={loading} />
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================================================
                CHART ANALYSIS MODAL (Pop-up)
               ================================================================================== */}
            {showDeepAnalysis && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Brain className="w-5 h-5" /> Interval Analysis
                            </h3>
                            <button onClick={() => setShowDeepAnalysis(false)} className="text-blue-200 hover:text-white"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="p-6">
                            {analyzing ? (
                                <div className="py-8 text-center space-y-4">
                                    <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                                    <p className="text-gray-600 dark:text-gray-300 animate-pulse">Scanning market context...</p>
                                </div>
                            ) : fluctuationResult && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">{fluctuationResult.range}</div>
                                        <div className={`font-bold text-lg ${fluctuationResult.change.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{fluctuationResult.change}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div><div className="text-xs text-gray-400 uppercase">Start</div><div className="font-bold dark:text-white">${fluctuationResult.startPrice}</div></div>
                                        <div><div className="text-xs text-gray-400 uppercase">End</div><div className="font-bold dark:text-white">${fluctuationResult.endPrice}</div></div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                                            <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Logic</h4>
                                            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{fluctuationResult.logic}</p>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                                            <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm mb-1 flex items-center gap-2"><Newspaper className="w-4 h-4" /> Catalyst</h4>
                                            <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">{fluctuationResult.catalyst}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowDeepAnalysis(false)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================================================
                MAIN DASHBOARD CONTENT
               ================================================================================== */}

            <div className="relative group">
                {/* Analyze Button */}
                <div className="absolute top-4 right-6 z-10">
                    <button
                        onClick={() => generateFluctuationAnalysis(30)}
                        className="bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-600 border border-blue-200 dark:border-gray-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all"
                    >
                        <Brain className="w-4 h-4" /> Analizează Fluctuațiile
                    </button>
                </div>

                <StockChart
                    chartData={chartData}
                    loading={loading}
                    symbol={stockData.symbol}
                    learnMode={false}
                    onRangeSelect={handleChartSelection}
                />
            </div>

            <StockInfo
                stockData={stockData}
                overviewData={overviewData}
                loading={loading}
                learnMode={true}
            />

            {/* ==================================================================================
                BIG NAVIGATION BUTTONS (Triggers Overlays)
               ================================================================================== */}
            <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-6 items-end">

                {/* AI TUTOR BUTTON */}
                <button
                    onClick={() => setActiveOverlay('tutor')}
                    className="group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white p-4 pr-8 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-white dark:border-gray-800"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="text-xl font-bold">AI Tutor</div>
                        <div className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Chat & Learn</div>
                    </div>
                </button>

                {/* NEWS BUTTON */}
                <button
                    onClick={() => setActiveOverlay('news')}
                    className="group flex items-center gap-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white p-4 pr-8 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-gray-100 dark:border-gray-700"
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Newspaper className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <div className="text-xl font-bold">Latest News</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Analysis & Impact</div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default InformationMode;