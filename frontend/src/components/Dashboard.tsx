import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/ui/shine-border';
import { DownloadButton } from './ui/download-animation';
import { BarChart3, PieChart, Sparkles, AlertCircle, ShoppingBag, Truck, CheckCircle2, Star } from 'lucide-react';
import LiquidLoading from '@/components/ui/liquid-loader';
import GeometricBackground from '@/components/ui/geometric';
import { SentimentTrendCard } from '@/components/ui/sentiment-trend-card';
import '@/components/ui/download-btn.css';
import { config } from '../config';

/* ── API response shape (matches new Flask /analyze) ── */
interface SentimentItem   { sentiment: string; count: number; }
interface RatingItem      { rating: number;    count: number; }
interface TopKeywords     { positive: Record<string, number>; negative: Record<string, number>; }

interface AnalyticsData {
    summary:               string;
    total_reviews:         number;
    total_processed?:      number;   // kept for backwards compat
    mapped_columns:        string[];
    missing_values:        Record<string, number>;
    sentiment_distribution: SentimentItem[];
    rating_distribution:    RatingItem[];
    top_keywords:           TopKeywords;
}

/* ── colour map for sentiment ── */
const SENT_COLORS: Record<string, string> = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral:  '#6366f1',
    unknown:  '#f59e0b',
};

const Dashboard: React.FC = () => {
    const [hasUploaded] = useState(() => sessionStorage.getItem('hasUploaded') === 'true');
    const [data,    setData]    = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(hasUploaded);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!hasUploaded) return;
        (async () => {
            try {
                const res = await axios.post<AnalyticsData>(`${config.apiUrl}/analyze`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch analysis', err);
                setError(
                    axios.isAxiosError(err)
                        ? err.response?.data?.error ?? 'An error occurred during analysis.'
                        : 'An unexpected error occurred.'
                );
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ── Guards ── */
    if (!hasUploaded) {
        return (
            <div className="min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">No Dataset Found</h2>
                <p className="text-slate-400 text-center max-w-md">
                    You haven't uploaded a CSV file yet. Please upload a dataset first.
                </p>
                <button
                    onClick={() => (window.location.href = '/')}
                    className="mt-8 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Return to Upload
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <GeometricBackground className="min-h-screen flex items-center justify-center">
                <div className="z-10 flex flex-col items-center gap-6 mt-16">
                    <LiquidLoading />
                    <div className="text-center">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Generating Executive Report…
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest animate-pulse">
                            Running NLP models
                        </p>
                    </div>
                </div>
            </GeometricBackground>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
                <p className="text-slate-400 text-center max-w-md">{error}</p>
                <button
                    onClick={() => (window.location.href = '/')}
                    className="mt-8 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Return to Upload
                </button>
            </div>
        );
    }

    /* ── Derive chart data from new API shape ── */
    const sentLabels  = data.sentiment_distribution.map(s => s.sentiment);
    const sentValues  = data.sentiment_distribution.map(s => s.count);
    const sentColors  = sentLabels.map(l => SENT_COLORS[l] ?? '#8b5cf6');
    const totalReviews = data.total_reviews ?? data.total_processed ?? sentValues.reduce((a, b) => a + b, 0);

    const ratingLabels = data.rating_distribution.map(r => `★ ${r.rating}`);
    const ratingValues = data.rating_distribution.map(r => r.count);

    /* top positive keywords → bar chart */
    const posKwEntries = Object.entries(data.top_keywords?.positive ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    const kwX = posKwEntries.map(([w]) => w);
    const kwY = posKwEntries.map(([, v]) => v);

    /* ── SentimentTrendCard bar sparkline (normalised counts per sentiment bucket) ── */
    const sparkBars = data.rating_distribution.length
        ? data.rating_distribution.map(r => r.count)
        : [0];

    return (
        <GeometricBackground className="min-h-screen w-full p-6 md:p-12 pb-32">
            <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4">
                {/* ── Dashboard Header ── */}
                <header className="flex flex-col md:flex-row gap-6 md:items-start justify-between mb-10 w-full pt-8">
                    <div className="flex items-center gap-4 text-center md:text-left self-center md:self-start">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                                Analytics Dashboard
                            </h1>
                            <p className="text-slate-400 mt-1">
                                AI-powered insights from&nbsp;
                                <span className="text-indigo-300 font-semibold">{totalReviews.toLocaleString()}</span> reviews
                            </p>
                        </div>
                    </div>
                    <div className="flex-shrink-0 self-center md:self-auto">
                        <DownloadButton
                            onDownload={() => {
                                import('jspdf').then(module => {
                                    const { jsPDF } = module;
                                    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                                    doc.setFontSize(18);
                                    doc.setFont('helvetica', 'bold');
                                    doc.text('OpinionIQ – Executive Summary', 15, 20);
                                    doc.setFontSize(12);
                                    doc.setFont('helvetica', 'normal');
                                    if (data?.summary) {
                                        const w   = doc.internal.pageSize.getWidth();
                                        const txt = doc.splitTextToSize(data.summary, w - 30);
                                        doc.text(txt, 15, 32);
                                    }
                                    doc.save('OpinionIQ_Executive_Summary.pdf');
                                });
                            }}
                        />
                    </div>
                </header>

                {/* ── Executive Summary ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <ShineBorder
                        className="bg-black/20 border border-white/20 backdrop-blur-md p-5 sm:p-8 w-full !max-w-none md:shadow-xl overflow-hidden !block"
                        color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                    >
                        <div className="relative z-10" id="executive-summary-content">
                            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                Executive Summary
                            </h3>
                            <div className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-light p-2">
                                {data.summary}
                            </div>
                        </div>
                    </ShineBorder>
                </motion.div>

                {/* ── Bento Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                    {/* Sentiment Trend Card — full width */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }} className="lg:col-span-2"
                    >
                        <ShineBorder
                            className="bg-black/20 border border-white/20 backdrop-blur-md p-6 h-full w-full !max-w-none !block"
                            color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                        >
                            <div className="relative z-10 w-full h-full flex flex-col">
                                <SentimentTrendCard
                                    totalReviews={totalReviews}
                                    barData={sparkBars}
                                    topTopics={[
                                        { name: 'Product Quality', duration: `${Math.round((sentValues[sentLabels.indexOf('positive')] ?? 0) / totalReviews * 100)}% Positive`, icon: <ShoppingBag size={18}/> },
                                        { name: 'Negative Feedback', duration: `${Math.round((sentValues[sentLabels.indexOf('negative')] ?? 0) / totalReviews * 100)}% Negative`, icon: <Truck size={18}/> },
                                        { name: 'Neutral Reviews', duration: `${Math.round((sentValues[sentLabels.indexOf('neutral')] ?? 0) / totalReviews * 100)}% Neutral`, icon: <CheckCircle2 size={18}/> },
                                    ]}
                                    className=""
                                />
                            </div>
                        </ShineBorder>
                    </motion.div>

                    {/* Sentiment Pie */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                        <ShineBorder
                            className="bg-black/20 border border-white/20 backdrop-blur-md p-6 h-full w-full !max-w-none !block"
                            color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                        >
                            <div className="relative z-10 w-full h-full flex flex-col">
                                <h3 className="text-lg font-medium mb-6 text-white flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-indigo-400" />
                                    Sentiment Distribution
                                </h3>
                                <div className="flex justify-center items-center w-full h-[300px] sm:h-[350px]">
                                    <Plot
                                        useResizeHandler={true}
                                        style={{ width: '100%', height: '100%' }}
                                        data={[{
                                            values: sentValues,
                                            labels: sentLabels,
                                            type:   'pie',
                                            hole:   0.4,
                                            marker: { colors: sentColors },
                                            textinfo:  'percent',
                                            hoverinfo: 'label+value',
                                            textfont:  { color: 'white' } as any,
                                        }]}
                                        layout={{
                                            autosize: true,
                                            margin: { t: 0, b: 0, l: 0, r: 0 },
                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                            plot_bgcolor:  'rgba(0,0,0,0)',
                                            showlegend: true,
                                            legend: { font: { color: '#94a3b8' } },
                                        }}
                                        config={{ displayModeBar: false, responsive: true }}
                                    />
                                </div>
                            </div>
                        </ShineBorder>
                    </motion.div>

                    {/* Rating Distribution Bar */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <ShineBorder
                            className="bg-black/20 border border-white/20 backdrop-blur-md p-6 h-full w-full !max-w-none !block"
                            color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                        >
                            <div className="relative z-10 w-full h-full flex flex-col">
                                <h3 className="text-lg font-medium mb-6 text-white flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    Rating Distribution
                                </h3>
                                <div className="flex justify-center items-center w-full h-[300px] sm:h-[350px]">
                                    <Plot
                                        useResizeHandler={true}
                                        style={{ width: '100%', height: '100%' }}
                                        data={[{
                                            x: ratingLabels,
                                            y: ratingValues,
                                            type: 'bar',
                                            marker: {
                                                color: ratingValues,
                                                colorscale: 'YlOrRd',
                                                showscale: false,
                                            },
                                            hoverinfo: 'x+y',
                                        }]}
                                        layout={{
                                            autosize: true,
                                            margin: { t: 20, b: 40, l: 30, r: 20 },
                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                            plot_bgcolor:  'rgba(0,0,0,0)',
                                            xaxis: { title: { text: 'Rating' }, color: '#94a3b8', gridcolor: 'rgba(255,255,255,0.05)', tickfont: { size: 10 } },
                                            yaxis: { color: '#94a3b8', gridcolor: 'rgba(255,255,255,0.05)', tickfont: { size: 10 } },
                                        }}
                                        config={{ displayModeBar: false, responsive: true }}
                                    />
                                </div>
                            </div>
                        </ShineBorder>
                    </motion.div>

                    {/* Top Positive Keywords Bar — full width */}
                    {kwX.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }} className="lg:col-span-2"
                        >
                            <ShineBorder
                                className="bg-black/20 border border-white/20 backdrop-blur-md p-6 w-full !max-w-none !block"
                                color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                            >
                                <div className="relative z-10 w-full flex flex-col">
                                    <h3 className="text-lg font-medium mb-6 text-white flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                        Top Positive Keywords
                                    </h3>
                                    <div className="flex justify-center items-center">
                                        <Plot
                                            data={[{
                                                x: kwX,
                                                y: kwY,
                                                type: 'bar',
                                                marker: {
                                                    color: kwY,
                                                    colorscale: 'Purp',
                                                    showscale: false,
                                                },
                                            }]}
                                            layout={{
                                                width:  900, height: 320,
                                                margin: { t: 10, b: 60, l: 50, r: 20 },
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                plot_bgcolor:  'rgba(0,0,0,0)',
                                                xaxis: { tickfont: { color: '#94a3b8' }, showgrid: false, tickangle: -30 },
                                                yaxis: { tickfont: { color: '#94a3b8' }, gridcolor: '#334155' },
                                            }}
                                            config={{ displayModeBar: false }}
                                        />
                                    </div>
                                </div>
                            </ShineBorder>
                        </motion.div>
                    )}
                </div>

            </div>
        </GeometricBackground>
    );
};

export default Dashboard;
