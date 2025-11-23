import { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, CheckCircle, Lock, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

const AIAnalysis = ({ analysis, loading, learnMode }) => {
    const [revealed, setRevealed] = useState(false);
    const [guess, setGuess] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    if (loading) return <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />;
    if (!analysis) return null;

    const getVerdictColor = (verdict) => {
        if (verdict.includes('SUBEVALUATĂ')) return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
        if (verdict.includes('SUPRAEVALUATĂ')) return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
    };

    const quizOptions = ['SUBEVALUATĂ', 'SUPRAEVALUATĂ', 'CORECT EVALUATĂ'];

    const handleGuess = (selectedVerdict) => {
        if (guess) return;
        setGuess(selectedVerdict);
        const correct = analysis.verdict.includes(selectedVerdict);
        setIsCorrect(correct);
    };

    const getButtonClass = (option) => {
        const isSelected = guess === option;
        if (guess) {
            if (analysis.verdict.includes(option)) {
                return 'bg-green-100 text-green-800 border-green-400 ring-2 ring-green-500 font-bold dark:bg-green-900/50 dark:text-green-300 dark:border-green-600';
            } else if (isSelected) {
                return 'bg-red-100 text-red-800 border-red-400 ring-2 ring-red-500 line-through dark:bg-red-900/50 dark:text-red-300 dark:border-red-600';
            }
        }
        return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                AI Financial Analyst
            </h3>

            {learnMode && !revealed ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                    <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-800 dark:text-white mb-2">Quiz Time!</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Bazat pe datele din stânga (P/E, Știri, Grafic), cum crezi că este evaluată compania?
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                        {quizOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => handleGuess(option)}
                                disabled={!!guess}
                                className={`px-4 py-2 rounded-lg border font-semibold transition-all ${getButtonClass(option)}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {guess && (
                        <div className={`py-3 px-4 rounded-lg mb-4 font-semibold flex items-center justify-center gap-2 ${
                            isCorrect
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }`}>
                            {isCorrect ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                            {isCorrect ? 'Corect! Ai înțeles evaluarea fundamentală.' : 'Incorect. Analizează raționamentul de mai jos.'}
                        </div>
                    )}

                    <button
                        onClick={() => setRevealed(true)}
                        className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors ${
                            !guess
                            ? 'bg-gray-400 text-white cursor-not-allowed dark:bg-gray-600'
                            : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500'
                        }`}
                        disabled={!guess}
                    >
                        <Eye className="w-4 h-4" />
                        Reveal AI Verdict & Raționament
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-lg border ${getVerdictColor(analysis.verdict)} w-full justify-center`}>
                        {analysis.verdict.includes('SUBEVALUATĂ') ? <TrendingUp className="w-6 h-6" /> :
                            analysis.verdict.includes('SUPRAEVALUATĂ') ? <TrendingDown className="w-6 h-6" /> :
                                <CheckCircle className="w-6 h-6" />}
                        Verdictul AI: {analysis.verdict}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Estimated Fair Value</span>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${analysis.estimatedFairValue.toFixed(2)}</div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">De ce? (Raționament)</h4>
                        <ul className="space-y-3">
                            {analysis.reasoning.map((reason, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-transparent dark:border-gray-700">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">{index + 1}.</span>
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                            <h5 className="font-bold text-green-800 dark:text-green-300 text-sm mb-1">Bull Case (Optimist)</h5>
                            <p className="text-xs text-green-700 dark:text-green-400">{analysis.bullCase}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
                            <h5 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">Bear Case (Pesimist)</h5>
                            <p className="text-xs text-red-700 dark:text-red-400">{analysis.bearCase}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAnalysis;