import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BarChart3, PieChart, Activity, Sparkles, AlertCircle } from 'lucide-react';

interface AnalyticsData {
    summary: string;
    charts: {
        sentiment_pie: {
            labels: string[];
            values: number[];
        };
        top_words_bar: {
            x: string[];
            y: number[];
        };
    };
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await axios.post('http://127.0.0.1:5000/analyze');
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch analysis", err);
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.error || "An error occurred during analysis.");
                } else {
                    setError("An unexpected error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]" />
                <div className="w-24 h-24 relative mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 z-10">
                    Generating Executive Report...
                </h2>
                <p className="text-slate-500 mt-2 z-10">Running dataset through NLP models</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
                <p className="text-slate-400 text-center max-w-md">{error}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-8 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Return to Upload
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-950 p-6 md:p-12 relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-10 flex items-center justify-between border-b border-slate-800/60 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                            Analytics Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">AI-powered insights from your dataset</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-300">Analysis Complete</span>
                    </div>
                </header>

                {/* Top Row: AI Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                        <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            Executive Summary
                        </h3>
                        <div className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-light">
                            {data.summary}
                        </div>
                    </Card>
                </motion.div>

                {/* Bottom Row: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sentiment Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md p-6 h-full">
                            <h3 className="text-lg font-medium mb-6 text-white flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-indigo-400" />
                                Sentiment Distribution
                            </h3>
                            <div className="flex justify-center items-center">
                                <Plot
                                    data={[
                                        {
                                            values: data.charts.sentiment_pie.values,
                                            labels: data.charts.sentiment_pie.labels,
                                            type: 'pie',
                                            hole: 0.4,
                                            marker: {
                                                colors: ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#8b5cf6']
                                            },
                                            textinfo: 'label+percent',
                                            hoverinfo: 'label+value',
                                            textfont: { color: 'white' } as any
                                        }
                                    ]}
                                    layout={{
                                        width: 450,
                                        height: 350,
                                        margin: { t: 0, b: 0, l: 0, r: 0 },
                                        paper_bgcolor: 'rgba(0,0,0,0)',
                                        plot_bgcolor: 'rgba(0,0,0,0)',
                                        showlegend: true,
                                        legend: { font: { color: '#94a3b8' } }
                                    }}
                                    config={{ displayModeBar: false }}
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Top Words Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md p-6 h-full">
                            <h3 className="text-lg font-medium mb-6 text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                Top Keyword Mentions
                            </h3>
                            <div className="flex justify-center items-center">
                                <Plot
                                    data={[
                                        {
                                            x: data.charts.top_words_bar.x,
                                            y: data.charts.top_words_bar.y,
                                            type: 'bar',
                                            marker: {
                                                color: data.charts.top_words_bar.y,
                                                colorscale: 'Purp',
                                                showscale: false
                                            }
                                        }
                                    ]}
                                    layout={{
                                        width: 450,
                                        height: 350,
                                        margin: { t: 20, b: 40, l: 40, r: 20 },
                                        paper_bgcolor: 'rgba(0,0,0,0)',
                                        plot_bgcolor: 'rgba(0,0,0,0)',
                                        xaxis: {
                                            tickfont: { color: '#94a3b8' },
                                            showgrid: false
                                        },
                                        yaxis: {
                                            tickfont: { color: '#94a3b8' },
                                            gridcolor: '#334155'
                                        }
                                    }}
                                    config={{ displayModeBar: false }}
                                />
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
