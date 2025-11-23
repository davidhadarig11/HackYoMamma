import { useState, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Award, CheckCircle, Sparkles, Lightbulb } from 'lucide-react';
import { chatWithAI } from '../utils/api';

const ChatInterface = ({ stockData, overviewData, verdict, news }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const initialStatus = {
        readyStatus: 'Începător',
        progressScore: 0,
        investmentReady: false,
        nextQuestion: 'Ce este P/E Ratio?'
    };
    const [currentStatus, setCurrentStatus] = useState(initialStatus);

    // State for multiple suggestions - SIMPLIFIED QUESTIONS
    const [suggestions, setSuggestions] = useState([
        'Analizează Riscul',
        'Explică P/E Ratio',
        'E de cumpărat?'
    ]);

    // Effect to update suggestions when AI proposes a new question
    useEffect(() => {
        if (currentStatus.nextQuestion && !suggestions.includes(currentStatus.nextQuestion)) {
            // Add new suggestion to the start, keep max 3 unique
            setSuggestions(prev => {
                const filtered = prev.filter(s => s !== currentStatus.nextQuestion);
                return [currentStatus.nextQuestion, ...filtered].slice(0, 3);
            });
        }
    }, [currentStatus.nextQuestion]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !stockData || !overviewData) return;

        const userMessage = input.trim();
        setInput('');

        // --- CHANGE: Immediately remove the asked question from suggestions ---
        setSuggestions(prev => prev.filter(s => s !== userMessage));

        const newUserMessage = { role: 'user', content: userMessage };
        // We pass history to API so it remembers context
        const historyToSend = [...messages, newUserMessage];

        setMessages(prev => [...prev, newUserMessage]);
        setLoading(true);

        try {
            const aiResult = await chatWithAI(userMessage, stockData, overviewData, verdict, news, currentStatus, historyToSend);

            setCurrentStatus({
                readyStatus: aiResult.readyStatus,
                progressScore: aiResult.progressScore,
                investmentReady: aiResult.investmentReady,
                nextQuestion: aiResult.nextQuestion
            });

            // Generate fresh SIMPLE suggestions dynamically based on context
            const newSuggestions = [
                aiResult.nextQuestion,
                "Explică Volatilitatea",
                "Cine sunt competitorii?",
                "Este profitabilă?"
            ].filter(s => s && s !== userMessage).slice(0, 3);

            setSuggestions(newSuggestions);

            setMessages(prev => [...prev, { role: 'assistant', content: aiResult.chatResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Eroare: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    if (!stockData || !overviewData) return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" /> AI Chat
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Caută o companie...</p>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col h-[550px] sm:h-[600px] transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" /> AI Tutor
            </h3>

            {/* Progress Section (User Style) */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" /> Progres: {currentStatus.progressScore}%
                    </span>
                    <span className={`font-bold text-xs px-2 py-1 rounded-full ${currentStatus.investmentReady ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'}`}>
                        {currentStatus.readyStatus}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500" style={{ width: `${currentStatus.progressScore}%` }}></div>
                </div>
                {currentStatus.investmentReady && (
                    <div className="mt-3 text-center text-sm font-bold text-green-700 dark:text-green-400 flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Felicitări! Ești pregătit.
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <p className="mb-2">Salut! Sunt Tutorele tău AI.</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Începe cu întrebarea sugerată mai jos.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Multiple Suggestions (Horizontal Scroll) */}
            {suggestions.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => setInput(suggestion)}
                            className="flex-shrink-0 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800 flex items-center gap-1 whitespace-nowrap"
                        >
                            <Lightbulb className="w-3 h-3" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pune o întrebare..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;