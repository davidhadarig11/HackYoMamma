import { useState } from 'react';
import { Newspaper, ExternalLink, Calendar, TrendingUp, TrendingDown, Minus, Brain, Sparkles, ArrowLeft, Zap, AlertTriangle, PieChart, Gavel } from 'lucide-react';

const NewsCard = ({ news, loading }) => {
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // --- SAFE AI SIMULATION ENGINE ---
  const generateContextualAnalysis = (item) => {
    const title = item.title || "";
    const desc = item.description || "";
    const text = (title + " " + desc).toLowerCase();

    const sentiment = item.sentiment || 'neutral';
    const isPositive = sentiment === 'positive';
    const isNegative = sentiment === 'negative';

    // 1. Detect Topic Category
    let category = 'GENERAL';
    if (text.match(/earnings|profit|revenue|quarter|report|fiscal|dividend/)) category = 'FINANCIAL';
    else if (text.match(/launch|new|release|unveil|product|tech|ai|feature/)) category = 'PRODUCT';
    else if (text.match(/lawsuit|sue|court|regulator|fine|ban|sec|doj/)) category = 'LEGAL';
    else if (text.match(/ceo|cfo|resign|appoint|management|executive/)) category = 'MANAGEMENT';
    else if (text.match(/inflation|rate|fed|economy|recession|market/)) category = 'MACRO';

    // 2. Generate Dynamic Verdict & Impact
    let verdict = isPositive ? 'BULLISH' : isNegative ? 'BEARISH' : 'NEUTRAL';
    let impact = 'Medium';
    let sentimentScore = isPositive ? 85 : isNegative ? 25 : 50;

    if (category === 'FINANCIAL' || category === 'LEGAL') impact = 'High';
    if (category === 'MANAGEMENT' && isNegative) impact = 'High';

    // 3. Context-Aware Explanations
    const strategies = {
        FINANCIAL: {
            pos: ["Creștere solidă a fundamentelor.", "Rezultate peste așteptări care validează strategia."],
            neg: ["Semne de slăbiciune financiară.", "Ratarea țintelor poate declanșa o vânzare agresivă."],
            pred: isPositive ? "Se așteaptă o reevaluare pozitivă a prețului țintă." : "Posibilă corecție a prețului în sesiunile următoare."
        },
        PRODUCT: {
            pos: ["Inovația ar putea captura noi cote de piață.", "Reacție pozitivă la noile lansări."],
            neg: ["Dezamăgire privind specificațiile sau amânări.", "Competiția pare să aibă un avantaj tehnologic."],
            pred: "Impactul se va vedea în veniturile pe termen lung."
        },
        LEGAL: {
            pos: ["Rezolvarea litigiilor elimină incertitudinea.", "Victorie legală importantă."],
            neg: ["Riscuri regulatorii majore.", "Posibile amenzi care vor afecta profitabilitatea."],
            pred: isNegative ? "Volatilitate ridicată pe fondul incertitudinii juridice." : "Stabilizare după eliminarea riscului legal."
        },
        MANAGEMENT: {
            pos: ["Leadership puternic confirmat.", "Încrederea investitorilor în conducere crește."],
            neg: ["Instabilitate la nivel executiv.", "Plecarea liderilor cheie ridică semne de întrebare."],
            pred: "Piața va monitoriza cu atenție direcția strategică."
        },
        MACRO: {
            pos: ["Mediu economic favorabil.", "Datele macro susțin creșterea sectorului."],
            neg: ["Vânturi potrivnice din economia globală.", "Presiuni inflaționiste."],
            pred: "Corelație ridicată cu indicii generali de piață."
        },
        GENERAL: {
            pos: ["Sentiment general constructiv.", "Flux de știri favorabil."],
            neg: ["Sentiment negativ persistent.", "Presiune mediatică nefavorabilă."],
            pred: "Reacție moderată, dependentă de volum."
        }
    };

    const phrases = strategies[category] || strategies.GENERAL;
    const posPhrase = phrases.pos && phrases.pos.length ? phrases.pos[Math.floor(Math.random() * phrases.pos.length)] : "Veste pozitivă.";
    const negPhrase = phrases.neg && phrases.neg.length ? phrases.neg[Math.floor(Math.random() * phrases.neg.length)] : "Veste negativă.";

    const baseText = isPositive ? posPhrase : isNegative ? negPhrase : "Situație incertă care necesită monitorizare.";

    const summary = `Analiză ${category}: ${baseText}`;
    const prediction = phrases.pred || "Impact neutru așteptat.";

    let takeaway = "Așteaptă clarificarea trendului.";
    if (isPositive) takeaway = "Oportunitate de acumulare pe corecții.";
    else if (isNegative) takeaway = "Prudență maximă; protejează capitalul.";

    return {
        category,
        sentimentScore,
        impact,
        verdict,
        summary,
        prediction,
        keyTakeaway: takeaway
    };
  };

  const handleAnalyze = (item, index) => {
    setAnalyzingId(index);
    setActiveItem(item);
    setAnalysisResult(null);

    setTimeout(() => {
      const result = generateContextualAnalysis(item);
      setAnalysisResult(result);
      setAnalyzingId(null);
    }, 1200);
  };

  const closeAnalysis = () => {
    setAnalysisResult(null);
    setActiveItem(null);
    setAnalyzingId(null);
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
        case 'FINANCIAL': return <PieChart className="w-5 h-5 text-blue-500" />;
        case 'LEGAL': return <Gavel className="w-5 h-5 text-red-500" />;
        case 'PRODUCT': return <Zap className="w-5 h-5 text-yellow-500" />;
        case 'MANAGEMENT': return <Brain className="w-5 h-5 text-purple-500" />;
        case 'MACRO': return <TrendingUp className="w-5 h-5 text-green-500" />;
        default: return <Newspaper className="w-5 h-5 text-gray-500" />;
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Latest News
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!news || news.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Latest News
        </h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Nu s-au găsit știri recente pentru acest simbol.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
        return new Date(dateString).toLocaleDateString('ro-RO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300 relative overflow-hidden min-h-[500px]">

      {/* --- ANALYSIS OVERLAY --- */}
      {activeItem && (
        <div className="absolute inset-0 z-20 bg-white dark:bg-gray-800 p-6 animate-slide-in-right flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <button onClick={closeAnalysis} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
              <Brain className="w-5 h-5" /> Context AI
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 leading-tight">{activeItem.title}</h4>

            {!analysisResult ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Analyzing context & keywords...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Category Badge */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                    {getCategoryIcon(analysisResult.category)}
                    <span className="font-bold text-gray-700 dark:text-gray-200">Category: {analysisResult.category}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${analysisResult.verdict === 'BULLISH' ? 'bg-green-50 border-green-200 text-green-800' : analysisResult.verdict === 'BEARISH' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                    <div className="text-xs font-bold opacity-70 uppercase mb-1">Verdict</div>
                    <div className="text-xl font-black">{analysisResult.verdict}</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-100 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-200">
                    <div className="text-xs font-bold opacity-70 uppercase mb-1">Impact</div>
                    <div className="text-xl font-black flex items-center gap-2">
                        {analysisResult.impact === 'High' && <AlertTriangle className="w-5 h-5" />}
                        {analysisResult.impact}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-4">
                   <div>
                      <h5 className="flex items-center gap-2 font-bold text-gray-800 dark:text-white mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" /> AI Analysis
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysisResult.summary}</p>
                   </div>
                   <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h5 className="font-bold text-gray-800 dark:text-white mb-2 text-sm">Market Prediction</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{analysisResult.prediction}"</p>
                   </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 text-sm">Takeaway: </span>
                  <span className="text-blue-700 dark:text-blue-200 text-sm">{analysisResult.keyTakeaway}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NEWS LIST --- */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Latest News
      </h3>

      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all dark:hover:bg-gray-700/50">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 flex-1">{item.title}</h4>
              {item.sentiment && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.sentiment === 'positive' ? 'bg-green-100 text-green-800' : item.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.sentiment}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" /> {formatDate(item.date)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnalyze(item, index)}
                  disabled={analyzingId !== null}
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition text-xs font-bold"
                >
                  <Brain className="w-3 h-3" /> Analyze
                </button>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium px-2 py-1">
                    Read <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsCard;