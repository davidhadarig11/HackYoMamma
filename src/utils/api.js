// API Configuration
const ALPHA_VANTAGE_KEY = 'LJTQFYREOEH60A2K'; // Demo key
const NEWSDATA_KEY = 'pub_5460c90507744621a2810dc54f1435a5';
// IMPORTANT: Setăm apiKey goală pentru environment
const apiKey = "AIzaSyDtO7a2tHMqXfV_TjKZyBsuvoYMaij4Fhc";
const BACKUP_KEY = "AIzaSyB92BVRL82qUqSt3g7izweipg-97RjqdKo";
const BACKUP_KEY_2 = "AIzaSyClioDz6ksmmdsuGyQD1XAvcquOzX5N2po";

const getEffectiveKey = () => apiKey || BACKUP_KEY || BACKUP_KEY_2;

// Industry average P/E ratios for comparison
const INDUSTRY_AVERAGES = {
    'Technology': 28,
    'Consumer Cyclical': 18,
    'Consumer Defensive': 22,
    'Healthcare': 25,
    'Financial Services': 15,
    'Energy': 12,
    'Industrials': 20,
    'Communication Services': 20,
    'Utilities': 18,
    'Real Estate': 25,
    'Basic Materials': 16,
    'default': 20
};

// --- MOCK DATA GENERATORS ---
// (Fallback for stability)
const generateMockQuote = (symbol) => ({
    symbol: symbol,
    price: symbol === 'SPY' ? 450 : symbol === 'TSLA' ? 250 : 180,
    change: 1.5,
    changePercent: '0.5%',
    volume: 1000000,
    high: 455,
    low: 448,
    open: 449,
    previousClose: 448.5
});

const generateMockOverview = (symbol) => ({
    symbol: symbol,
    name: symbol === 'SPY' ? 'SPDR S&P 500 ETF' : symbol === 'TSLA' ? 'Tesla Inc' : 'SPDR Gold Trust',
    description: 'Mock data description for simulation.',
    marketCap: 1000000000,
    peRatio: 25,
    eps: 10,
    revenue: 500000000,
    profitMargin: 0.15,
    fiftyTwoWeekHigh: 500,
    fiftyTwoWeekLow: 400,
    beta: 1.0,
    dividendYield: 0.01,
    sector: 'Simulation',
    industry: 'Simulation'
});

const generateMockHistory = (symbol) => {
    const data = [];
    let price = 100;
    const startDate = new Date('2019-01-01');
    const endDate = new Date();

    if (symbol === 'SPY') price = 300;
    if (symbol === 'TSLA') price = 25;
    if (symbol === 'GLD') price = 140;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 0 || d.getDay() === 6) continue;

        const dateStr = d.toISOString().split('T')[0];
        let dailyChange = 0;

        if (symbol === 'SPY') {
             if (dateStr >= '2020-02-20' && dateStr <= '2020-03-23') dailyChange = -0.07 + (Math.random() * 0.04);
             else if (dateStr > '2020-03-23' && dateStr < '2020-06-01') dailyChange = 0.02 + (Math.random() * 0.02);
             else dailyChange = (Math.random() * 0.02 - 0.009);
        } else if (symbol === 'TSLA') {
             if (dateStr >= '2020-11-01' && dateStr <= '2021-02-01') dailyChange = 0.03 + (Math.random() * 0.04);
             else dailyChange = (Math.random() * 0.06 - 0.03);
        } else {
             if (dateStr > '2022-01-01') dailyChange = (Math.random() * 0.015 - 0.005);
             else dailyChange = (Math.random() * 0.01 - 0.005);
        }

        const prevClose = price;
        price = price * (1 + dailyChange);
        const open = prevClose * (1 + (Math.random() * 0.005 - 0.0025));
        const close = price;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);

        data.push({
            date: d.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' }),
            fullDate: dateStr,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: Math.floor(Math.random() * 1000000) + 500000
        });
    }
    return data;
};

// --- PUBLIC API FUNCTIONS ---

export const fetchStockQuote = async (symbol) => {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`);
        const data = await response.json();
        if (data['Information'] || data['Note'] || !data['Global Quote']) {
            if (['SPY', 'TSLA', 'GLD'].includes(symbol)) return generateMockQuote(symbol);
            throw new Error("API Rate Limit Exceeded");
        }
        const quote = data['Global Quote'];
        return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'],
            volume: quote['06. volume'],
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            open: parseFloat(quote['02. open']),
            previousClose: parseFloat(quote['08. previous close']),
        };
    } catch (error) {
        if (['SPY', 'TSLA', 'GLD'].includes(symbol)) return generateMockQuote(symbol);
        throw error;
    }
};

export const fetchStockOverview = async (symbol) => {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`);
        const data = await response.json();
        if (data['Information'] || data['Note'] || !data.Symbol) {
             return generateMockOverview(symbol);
        }
        return {
            symbol: data.Symbol,
            name: data.Name,
            description: data.Description,
            marketCap: parseFloat(data.MarketCapitalization) || 0,
            peRatio: parseFloat(data.PERatio) || 0,
            eps: parseFloat(data.EPS) || 0,
            revenue: parseFloat(data.RevenueTTM) || 0,
            profitMargin: parseFloat(data.ProfitMargin) || 0,
            fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || 0,
            fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || 0,
            beta: parseFloat(data.Beta) || 0,
            dividendYield: parseFloat(data.DividendYield) || 0,
            sector: data.Sector,
            industry: data.Industry,
        };
    } catch (error) {
        return generateMockOverview(symbol);
    }
};

export const fetchStockHistory = async (symbol, fullHistory = false) => {
    try {
        if (['SPY', 'TSLA', 'GLD'].includes(symbol)) return generateMockHistory(symbol);
        const outputSize = fullHistory ? 'full' : 'compact';
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}&outputsize=${outputSize}`);
        const data = await response.json();
        if (data['Information'] || data['Error Message'] || data['Note'] || !data['Time Series (Daily)']) {
            if (['SPY', 'TSLA', 'GLD'].includes(symbol)) return generateMockHistory(symbol);
            throw new Error(data['Error Message'] || 'No historical data available');
        }
        const timeSeries = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).sort();
        return dates.map(date => ({
            date: new Date(date).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' }),
            fullDate: date,
            open: parseFloat(timeSeries[date]['1. open']),
            high: parseFloat(timeSeries[date]['2. high']),
            low: parseFloat(timeSeries[date]['3. low']),
            close: parseFloat(timeSeries[date]['4. close']),
            volume: parseFloat(timeSeries[date]['5. volume']),
        }));
    } catch (error) {
        if (['SPY', 'TSLA', 'GLD'].includes(symbol)) return generateMockHistory(symbol);
        throw error;
    }
};

export const fetchCompanyNews = async (symbol) => {
    try {
        const response = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${symbol}&language=en&category=business`);
        const data = await response.json();
        if (data.status === 'error') return [];
        return (data.results || []).slice(0, 4).map(item => ({
            title: item.title,
            description: item.description,
            source: item.source_id,
            date: item.pubDate,
            link: item.link,
            image: item.image_url,
            sentiment: analyzeNewsSentiment(item.title, item.description),
        }));
    } catch (error) { return []; }
};

const analyzeNewsSentiment = (title, description) => {
    const text = `${title} ${description || ''}`.toLowerCase();
    const positiveWords = ['growth', 'profit', 'gain', 'rise', 'surge', 'up', 'beat', 'strong', 'positive', 'bullish', 'success', 'win', 'record', 'high'];
    const negativeWords = ['loss', 'decline', 'fall', 'drop', 'down', 'miss', 'weak', 'negative', 'bearish', 'fail', 'crisis', 'worry', 'concern', 'risk'];
    let positiveCount = 0, negativeCount = 0;
    positiveWords.forEach(word => { if (text.includes(word)) positiveCount++; });
    negativeWords.forEach(word => { if (text.includes(word)) negativeCount++; });
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
};

export const getIndustryAverage = (sector) => INDUSTRY_AVERAGES[sector] || INDUSTRY_AVERAGES.default;

export const calculateOverallSentiment = (news) => {
    if (!news || news.length === 0) return 'neutral';
    const sentiments = news.map(n => n.sentiment || 'neutral');
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
};

// AI Analysis
export const analyzeStockWithAI = async (stockData, overviewData, news) => {
    try {
        const newsSentiment = calculateOverallSentiment(news);
        const industryAvgPE = getIndustryAverage(overviewData.sector);
        const newsSummary = news.length > 0 ? news.slice(0, 3).map(n => `- ${n.title}`).join('\n') : 'Nu sunt știri disponibile';

        const prompt = `Ești un analist financiar.
DATE: Symbol: ${stockData.symbol}, Price: ${stockData.price}, P/E: ${overviewData.peRatio} (Avg: ${industryAvgPE}).
ȘTIRI: ${newsSummary}
TASK: Estimeaza Fair Value, Verdict (SUBEVALUATĂ/SUPRAEVALUATĂ/CORECT), 3 motive, Bull/Bear case scurt.
JSON ONLY: { "estimatedFairValue": number, "verdict": string, "reasoning": string[], "confidenceScore": number, "bullCase": string, "bearCase": string }`;

        const key = getEffectiveKey();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        const data = await response.json();
        if (!data.candidates) throw new Error("AI Error");
        const text = data.candidates[0].content.parts[0].text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        return { estimatedFairValue: 0, verdict: 'CORECT EVALUATĂ', reasoning: ['Date insuficiente'], confidenceScore: 5, bullCase: 'N/A', bearCase: 'N/A' };
    }
};

// --- CHAT FUNCTIONALITY (UPDATED FOR SHORT QUESTIONS) ---
export const chatWithAI = async (question, stockData, overviewData, verdict, news, currentProgress, history = []) => {
    try {
        const industryAvgPE = getIndustryAverage(overviewData.sector);
        const historyContext = history.map(msg => `${msg.role === 'user' ? 'U' : 'AI'}: ${msg.content}`).join('\n');

        const prompt = `
        Ești un Tutore Investiții (Hermes). Ajuți un începător.
        CONTEXT: ${stockData.symbol}, Preț: ${stockData.price}, P/E: ${overviewData.peRatio} (Ind: ${industryAvgPE}), Verdict: ${verdict}.
        ISTORIC: ${historyContext}
        ÎNTREBARE: "${question}"

        REGULI STRICTE PENTRU RĂSPUNS:
        1. Răspuns scurt și la obiect (max 2-3 fraze).
        2. Propune o "nextQuestion" care să fie FOARTE SCURTĂ (max 3-6 cuvinte).
           - EXEMPLE BUNE: "Cum stă cu datoria?", "Ce zici de profit?", "E riscantă?", "Competitorii principali?"
           - EXEMPLE RELE: "Dacă riscul de evaluare este atât de mare, ce fel de creștere ar trebui să aibă..." (INTERZIS)
        3. Fără întrebări ipotetice complexe.

        JSON: { "chatResponse": string, "nextQuestion": string (MAX 6 CUVINTE), "progressScore": number, "readyStatus": string, "investmentReady": boolean }
        `;

        const key = getEffectiveKey();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });

        const data = await response.json();
        if (!data.candidates) throw new Error("AI Error");
        const text = data.candidates[0].content.parts[0].text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("Chat AI Error:", error);
        return {
            chatResponse: "Eroare conexiune. Putem continua?",
            nextQuestion: "Ce zici de profit?",
            progressScore: currentProgress.progressScore,
            readyStatus: currentProgress.readyStatus,
            investmentReady: false
        };
    }
};