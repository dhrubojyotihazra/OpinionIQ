import { motion } from 'framer-motion';
import {
    Sparkles, Zap, TrendingUp, Database,
    Upload, BarChart3, Bot, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { ShineBorder } from '@/components/ui/shine-border';
import GeometricBackground from '@/components/ui/geometric';

/* ─── reusable fade-up variant ─── */
const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 28 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
});

/* ─── shared ShineBorder className ─── */
const GLASS =
    'bg-black/20 border border-white/20 backdrop-blur-md shadow-[inset_0_1px_0px_rgba(255,255,255,0.1),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] ' +
    'relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none ' +
    'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-tl after:from-white/5 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none ' +
    'p-6 w-full !max-w-none !block';

const SHINE_COLORS: [string, string, string] = ['#A07CFE', '#FE8FB5', '#FFBE7B'];

/* ═══════════════════════════════════════════════════ */
export default function About() {
    return (
        <GeometricBackground className="min-h-screen w-full px-4 py-8 sm:p-6 md:p-12 pb-32 overflow-hidden flex flex-col">
            <div className="w-full max-w-6xl mx-auto relative z-10 pt-[80px] sm:pt-[100px]">

                {/* ══ HERO ══ */}
                <motion.div {...fadeUp(0)}>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        About OpinionIQ
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300 mb-6 leading-tight">
                        Transform Customer Feedback<br className="hidden md:block" /> into Actionable Intelligence
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
                        OpinionIQ is an enterprise-grade AI sentiment analysis platform that helps businesses
                        understand their customers through advanced natural language processing and
                        intelligent visualizations.
                    </p>
                </motion.div>

                {/* ══ WHAT IS OPINIONIQ ══ */}
                <motion.div {...fadeUp(0.1)} className="mt-12 sm:mt-16 w-full">
                    <ShineBorder className={GLASS + ' p-5 sm:p-8'} color={SHINE_COLORS}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                                <h2 className="text-2xl font-bold text-white">What is OpinionIQ?</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                OpinionIQ combines cutting-edge AI models with intuitive visualizations to automatically
                                analyze customer sentiment from CSV datasets. Upload your feedback, reviews, or survey
                                responses and receive instant insights powered by an LLM-driven column mapping pipeline
                                and Groq's Llama 3.1 language model — capable of processing <strong className="text-white">20 000+ rows in seconds</strong>.
                            </p>
                        </div>
                    </ShineBorder>
                </motion.div>

                {/* ══ HOW IT WORKS ══ */}
                <motion.div {...fadeUp(0.2)} className="mt-16">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-purple-400" />
                        How to Use OpinionIQ
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Step 1 */}
                        <ShineBorder className={GLASS} color={SHINE_COLORS}>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-5">
                                    <Upload className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Step 01</span>
                                <h3 className="text-xl font-semibold text-white mb-3">Upload Your Data</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Drag-and-drop your CSV file. The AI automatically maps columns to a
                                    standard schema with Groq Llama 3.1 — no manual configuration needed.
                                </p>
                            </div>
                        </ShineBorder>

                        {/* Step 2 */}
                        <ShineBorder className={GLASS} color={SHINE_COLORS}>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-5">
                                    <BarChart3 className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 block">Step 02</span>
                                <h3 className="text-xl font-semibold text-white mb-3">View Analytics</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Instantly access your AI-powered dashboard: sentiment distribution, rating
                                    breakdown, top keyword charts, and an Groq-generated executive summary.
                                </p>
                            </div>
                        </ShineBorder>

                        {/* Step 3 */}
                        <ShineBorder className={GLASS} color={SHINE_COLORS}>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center mb-5">
                                    <Bot className="w-6 h-6 text-pink-400" />
                                </div>
                                <span className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2 block">Step 03</span>
                                <h3 className="text-xl font-semibold text-white mb-3">Chat With Your Data</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Use the dual-mode AI assistant: <strong className="text-slate-200">Data mode</strong> for
                                    quantitative questions and <strong className="text-slate-200">Report mode</strong> for
                                    executive narrative insights.
                                </p>
                            </div>
                        </ShineBorder>
                    </div>
                </motion.div>

                {/* ══ KEY FEATURES ══ */}
                <motion.div {...fadeUp(0.3)} className="mt-16">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-indigo-400" />
                        Key Features
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Intelligent Column Detection',
                                body:  'LLM-powered column mapping recognises feedback, rating, sentiment, and date columns regardless of naming convention. Supports any CSV structure.',
                            },
                            {
                                title: 'Full-Dataset Analysis',
                                body:  'Unlike sample-based tools, OpinionIQ computes sentiment distributions, rating statistics, and keyword frequencies across the entire dataset.',
                            },
                            {
                                title: 'Interactive Visualizations',
                                body:  'Powered by Plotly.js — responsive, interactive sentiment pie, rating distribution bar, and top keyword charts all rendered in the browser.',
                            },
                            {
                                title: 'Dual-Mode AI Chat',
                                body:  'Switch between Data Query mode for exact statistics and Report Query mode for qualitative insights. Backed by real aggregate stats, not samples.',
                            },
                        ].map(({ title, body }) => (
                            <ShineBorder key={title} className={GLASS} color={SHINE_COLORS}>
                                <div className="relative z-10">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{body}</p>
                                </div>
                            </ShineBorder>
                        ))}
                    </div>
                </motion.div>

                {/* ══ TECH STACK ══ */}
                <motion.div {...fadeUp(0.4)} className="mt-16">
                    <ShineBorder className={GLASS + ' p-8'} color={SHINE_COLORS}>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Database className="w-6 h-6 text-purple-400" />
                                Technology Stack
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <h3 className="text-base font-semibold text-indigo-300 uppercase tracking-widest mb-4">Frontend</h3>
                                    <ul className="space-y-3">
                                        {[
                                            'React 19 + TypeScript',
                                            'Vite — lightning-fast dev server',
                                            'Tailwind CSS + Framer Motion',
                                            'Plotly.js for data visualisation',
                                            'ShineBorder glassmorphism UI',
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-2.5 text-slate-400">
                                                <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-purple-300 uppercase tracking-widest mb-4">Backend</h3>
                                    <ul className="space-y-3">
                                        {[
                                            'Python Flask REST API',
                                            'Groq API — Llama 3.1-8b-instant',
                                            'TextBlob sentiment fallback',
                                            'Pandas + NumPy data pipeline',
                                            'NLTK keyword extraction',
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-2.5 text-slate-400">
                                                <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </ShineBorder>
                </motion.div>

                {/* ══ STATS ROW ══ */}
                <motion.div {...fadeUp(0.45)} className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { value: '20 000+', label: 'Rows processed' },
                        { value: '< 5 s',   label: 'Time to insights' },
                        { value: '3',        label: 'Chart types' },
                        { value: '2',        label: 'AI chat modes' },
                    ].map(({ value, label }) => (
                        <div key={label} className="bg-black/20 border border-white/10 rounded-2xl p-3 sm:p-5 text-center backdrop-blur-md">
                            <p className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 mb-1 break-words">{value}</p>
                            <p className="text-slate-500 text-sm">{label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* ══ CTA ══ */}
                <motion.div {...fadeUp(0.5)} className="mt-14 w-full">
                    <ShineBorder
                        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/20 backdrop-blur-md p-6 sm:p-12 w-full !max-w-none !block text-center"
                        color={SHINE_COLORS}
                    >
                        <div className="relative z-10 flex flex-col items-center">
                            <Sparkles className="w-10 h-10 text-indigo-300 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Ready to Transform Your Customer Feedback?
                            </h2>
                            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                                Start analyzing sentiment and uncovering insights in minutes.
                                No technical expertise required — just upload your CSV and go.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => (window.location.href = '/')}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
                                >
                                    Get Started Now
                                </button>
                                <button
                                    onClick={() => (window.location.href = '/dashboard')}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-base font-semibold rounded-xl transition-all hover:scale-[1.02]"
                                >
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    </ShineBorder>
                </motion.div>

            </div>
        </GeometricBackground>
    );
}
