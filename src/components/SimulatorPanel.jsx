import { useState } from 'react';
import { ShoppingCart, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const SimulatorPanel = ({
    stockData,
    portfolio,
    onBuy,
    onSell,
    isSimulating,
    holdingsQty,
    holdingsValue
}) => {
    const [quantity, setQuantity] = useState(1);

    if (!stockData) return null;

    // Calculations
    const price = stockData.price;

    // Limits
    const maxBuy = Math.floor(portfolio.cash / price);
    const maxSell = holdingsQty;

    const totalCost = quantity * price;

    // Validation
    const canAfford = portfolio.cash >= totalCost;
    const canSell = holdingsQty >= quantity;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 transition-all duration-300 h-full flex flex-col ${
            !isSimulating ? 'opacity-50 pointer-events-none border-gray-200 dark:border-gray-700' : 'border-blue-100 dark:border-blue-900'
        }`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Quick Trade
                </h3>
                <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Buying Power</p>
                    <div className="text-xl font-bold text-gray-800 dark:text-white flex items-center justify-end gap-1">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        ${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Holdings Info Bar */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 flex justify-between items-center border border-gray-100 dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Owned: <span className="font-bold text-gray-900 dark:text-white">{holdingsQty}</span> shares
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ${holdingsValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-1">
                <div className="flex flex-col gap-4">
                    <div className="w-full">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, maxSell))}
                                    disabled={maxSell === 0}
                                    className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    Max Sell: {maxSell}
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => setQuantity(Math.max(1, maxBuy))}
                                    disabled={maxBuy === 0}
                                    className="text-green-600 dark:text-green-400 hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    Max Buy: {maxBuy}
                                </button>
                            </div>
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-2xl text-center font-bold"
                        />
                    </div>

                    <div className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg flex justify-between items-center border border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-gray-500">Est. Total</span>
                        <span className="font-mono text-lg font-bold text-gray-800 dark:text-white">
                            ${totalCost.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Dual Action Buttons */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={() => onBuy(Number(quantity))}
                    disabled={!isSimulating || !canAfford || quantity <= 0}
                    className="flex-1 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20 flex flex-col items-center leading-none gap-1"
                >
                    <span className="flex items-center gap-1">BUY <ArrowUpCircle className="w-4 h-4"/></span>
                    <span className="text-[10px] font-normal opacity-80"> Long</span>
                </button>

                <button
                    onClick={() => onSell(Number(quantity))}
                    disabled={!isSimulating || !canSell || quantity <= 0}
                    className="flex-1 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20 flex flex-col items-center leading-none gap-1"
                >
                    <span className="flex items-center gap-1">SELL <ArrowDownCircle className="w-4 h-4"/></span>
                    <span className="text-[10px] font-normal opacity-80"> Short / Exit</span>
                </button>
            </div>

            {!isSimulating && (
                <p className="text-center text-sm text-gray-500 mt-4 italic">
                    Start Simulation to trade
                </p>
            )}
        </div>
    );
};

export default SimulatorPanel;