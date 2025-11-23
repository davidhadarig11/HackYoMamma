import { useState } from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Cell, ReferenceLine, ReferenceArea } from 'recharts';
import { TrendingUp, Activity, MousePointerClick } from 'lucide-react';

// --- PROFESSIONAL TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-xl text-xs font-mono z-50">
                <p className="font-bold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                    {data.fullDate || data.date}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-gray-500">Close:</span>
                    <span className={`font-bold text-right ${data.close >= data.open ? 'text-green-500' : 'text-red-500'}`}>
                        {data.close.toFixed(2)}
                    </span>
                    <span className="text-gray-500">Vol:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-gray-300">
                        {(data.volume / 1000000).toFixed(1)}M
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

const StockChart = ({ chartData, loading, symbol, simulationIndex, learnMode, onRangeSelect }) => {
    const [selectState, setSelectState] = useState({ start: null, end: null });

    // --- CLICK HANDLER FOR SELECTION ---
    const handleChartClick = (e) => {
        if (!e || !e.activeLabel || !onRangeSelect) return;

        const clickedDate = e.activeLabel;

        if (!selectState.start) {
            // First Click: Set Start
            setSelectState({ start: clickedDate, end: null });
        } else {
            // Second Click: Set End & Trigger Callback
            // Determine which is earlier to ensure correct order
            const idx1 = chartData.findIndex(d => d.date === selectState.start);
            const idx2 = chartData.findIndex(d => d.date === clickedDate);

            const startDate = idx1 < idx2 ? selectState.start : clickedDate;
            const endDate = idx1 < idx2 ? clickedDate : selectState.start;

            setSelectState({ start: startDate, end: endDate });

            // Send data to parent after a brief delay for visual effect
            setTimeout(() => {
                onRangeSelect(startDate, endDate);
                setSelectState({ start: null, end: null }); // Reset after selection
            }, 500);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
                <div className="animate-pulse flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                    <Activity className="w-10 h-10 text-gray-300 animate-bounce" />
                </div>
            </div>
        );
    }

    if (!chartData || chartData.length === 0) return null;

    let visibleData = [];

    // --- SLIDING WINDOW LOGIC ---
    if (simulationIndex !== null && simulationIndex !== undefined) {
        const WINDOW_SIZE = 100;
        const startIndex = Math.max(0, simulationIndex - WINDOW_SIZE);
        visibleData = chartData.slice(startIndex, simulationIndex + 1);
    } else if (learnMode) {
        visibleData = [];
    } else {
        visibleData = chartData.slice(-60);
    }

    if (visibleData.length === 0) return null;

    // --- DATA PREPARATION ---
    const processedData = visibleData.map(d => {
        const isRising = d.close >= d.open;
        return {
            ...d,
            candleBody: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
            candleWick: [d.low, d.high],
            color: isRising ? '#10B981' : '#EF4444'
        };
    });

    // --- SCALE ---
    const minPrice = Math.min(...visibleData.map(d => d.low));
    const maxPrice = Math.max(...visibleData.map(d => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    const yAxisDomain = [minPrice - padding, maxPrice + padding];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300 border border-transparent dark:border-gray-700 relative">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="tracking-tight">Market Chart</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded font-mono">
                        {symbol}
                    </span>
                </h3>

                {/* INSTRUCTION HINT */}
                {onRangeSelect && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full animate-pulse">
                        <MousePointerClick className="w-3 h-3" />
                        {selectState.start ? "Click End Date" : "Click 2 points to analyze"}
                    </div>
                )}
            </div>

            {/* CHART AREA */}
            <div className="h-[400px] w-full relative select-none">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={processedData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        onClick={handleChartClick}
                    >
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />

                        <XAxis
                            xAxisId="0" dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} dy={10}
                        />
                        <XAxis xAxisId="1" dataKey="date" hide={true} />

                        <YAxis
                            domain={yAxisDomain} orientation="right" stroke="#9ca3af" fontSize={10} tickFormatter={(val) => val.toFixed(0)} tickLine={false} axisLine={false} width={40} allowDataOverflow={true}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }} />

                        {/* --- VISUAL SELECTION AREA --- */}
                        {selectState.start && (
                            <ReferenceArea
                                xAxisId="0"
                                x1={selectState.start}
                                x2={selectState.end || selectState.start}
                                strokeOpacity={0.3}
                                fill="#3b82f6"
                                fillOpacity={0.2}
                            />
                        )}

                        <Bar xAxisId="0" dataKey="candleWick" barSize={1.5} isAnimationActive={false}>
                            {processedData.map((entry, index) => (<Cell key={`wick-${index}`} fill={entry.color} />))}
                        </Bar>

                        <Bar xAxisId="1" dataKey="candleBody" barSize={visibleData.length > 50 ? 6 : 12} isAnimationActive={false}>
                             {processedData.map((entry, index) => (<Cell key={`body-${index}`} fill={entry.color} />))}
                        </Bar>

                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StockChart;