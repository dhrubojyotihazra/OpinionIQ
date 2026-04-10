import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileText, AlertCircle, Trash2, Copy, Check, ChevronDown } from 'lucide-react';
import { config } from '../config';
import GeometricBackground from '@/components/ui/geometric';
import { ShiningText } from '@/components/ui/shining-text';
import { AnimatedText } from '@/components/ui/animated-text';
import { BlurredStagger } from '@/components/ui/blurred-stagger-text';
import SiriOrb from '@/components/ui/siri-orb';
import RadiantPromptInput from '@/components/ui/radiant-prompt-input';

/* ─────────────── types ─────────────── */
interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    mode: 'data' | 'report';
    isError?: boolean;
}

/* ─────────────── suggestions ─────────────── */
const SUGGESTIONS: Record<'data' | 'report', string[]> = {
    data: [
        'How many positive reviews are there?',
        'What is the average star rating?',
        'Which words appear most in negative reviews?',
        'How many reviews are missing a rating?',
    ],
    report: [
        'Summarise the top customer complaints.',
        'What product features are praised most?',
        'Write a 3-bullet executive summary.',
        'What sentiment trends stand out?',
    ],
};

/* ─────────────── markdown-lite renderer ─────────────── */
function renderText(raw: string) {
    return raw.split('\n').map((line, i, arr) => {
        const html = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.12);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.78em;color:#a5b4fc">$1</code>');
        return (
            <span key={i}>
                <span dangerouslySetInnerHTML={{ __html: html }} />
                {i < arr.length - 1 && <br />}
            </span>
        );
    });
}

/* ═══════════ COMPONENT ═══════════ */
export default function ChatInterface() {
    const [hasUploaded] = useState(() => sessionStorage.getItem('hasUploaded') === 'true');
    const [chatMode, setChatMode] = useState<'data' | 'report'>('data');
    const [messages, setMessages] = useState<Message[]>([{
        id: 'welcome',
        role: 'assistant',
        mode: 'data',
        text: "Hello! I'm the OpinionIQ AI Assistant.\n\nChoose a mode:\n\n**Data Query** – quantitative questions about your dataset (counts, averages, distributions).\n\n**Report Query** – qualitative, executive-style insights and narrative summaries.\n\nWhat would you like to know?",
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const endRef      = useRef<HTMLDivElement>(null);
    const scrollRef   = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* auto-scroll */
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    /* grow textarea */
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 130) + 'px';
    }, [input]);

    const onScroll = () => {
        const el = scrollRef.current;
        if (el) setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };

    /* send */
    const send = async () => {
        if (!input.trim() || isLoading) return;
        const text = input.trim();
        setInput('');
        setMessages(p => [...p, { id: Date.now().toString(), role: 'user', text, mode: chatMode }]);
        setIsLoading(true);
        try {
            const { data } = await axios.post(`${config.apiUrl}/chat/${chatMode}`, { message: text });
            setMessages(p => [...p, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: data.response ?? data.reply ?? 'No response generated.',
                mode: chatMode,
            }]);
        } catch (err) {
            let msg = 'Sorry, I encountered an error. Please try again.';
            if (axios.isAxiosError(err)) msg = err.response?.data?.error ?? msg;
            setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', text: msg, mode: chatMode, isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };



    const copy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const clearChat = () => setMessages(prev => [prev[0]]);

    /* ── no dataset ── */
    if (!hasUploaded) {
        return (
            <div style={{ minHeight: '100vh', background: '#09090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '48px 40px', maxWidth: 380, textAlign: 'center' }}
                >
                    <AlertCircle style={{ width: 52, height: 52, color: '#f59e0b', margin: '0 auto 20px' }} />
                    <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No Dataset Loaded</h2>
                    <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
                        Upload a CSV file on the home page first, then come back to chat with your data.
                    </p>
                    <button
                        onClick={() => (window.location.href = '/')}
                        style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Go to Upload
                    </button>
                </motion.div>
            </div>
        );
    }

    /* ── main ── */
    return (
        <GeometricBackground className="min-h-screen h-screen w-full">
          <div className="h-full w-full flex flex-col relative z-20" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* spacer for top nav */}
            <div style={{ height: 80, flexShrink: 0 }} />

            {/* ── content column ── */}
            <div className="flex-1 flex flex-col w-full max-w-[860px] mx-auto px-3 sm:px-5 md:px-8 pb-6 min-h-0">
                {/* ── header row ── */}
                <div className="flex items-start justify-between mb-5 flex-shrink-0 gap-4">
                    {/* title */}
                    <div className="flex items-center gap-3">
                        <AnimatedText 
                            text="OpinionAI" 
                            className="items-start" 
                            textClassName="text-xl font-bold text-white tracking-wide" 
                            underlineHeight="h-[2px]" 
                            underlineGradient="from-indigo-500 to-purple-500" 
                            duration={0.6}
                            delay={0.08}
                        />
                        <BlurredStagger text="You can now chat with your data and report." />
                    </div>

                    {/* mode toggle + clear */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 4, gap: 4 }}>
                            {(['data', 'report'] as const).map(m => (
                                <button key={m} onClick={() => setChatMode(m)} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 600,
                                    background: chatMode === m ? (m === 'data' ? '#4f46e5' : '#7c3aed') : 'transparent',
                                    color: chatMode === m ? '#fff' : '#64748b',
                                    transition: 'all 0.2s',
                                }}>
                                    {m === 'data' ? <Database style={{ width: 12, height: 12 }} /> : <FileText style={{ width: 12, height: 12 }} />}
                                    {m === 'data' ? 'Data' : 'Report'}
                                </button>
                            ))}
                        </div>
                        <button onClick={clearChat} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 14px', borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent', color: '#64748b',
                            fontSize: 12, cursor: 'pointer',
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        >
                            <Trash2 style={{ width: 12, height: 12 }} /> Clear
                        </button>
                    </div>
                </div>

                {/* ── messages box ── */}
                <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
                    <div
                        ref={scrollRef}
                        onScroll={onScroll}
                        className="h-full overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col gap-4"
                        style={{
                            scrollbarWidth: 'none',
                        }}
                    >
                        <AnimatePresence initial={false}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start',
                                        gap: 10,
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                    className="group max-w-[90%] sm:max-w-[82%]"
                                >
                                    {/* avatar */}
                                    {msg.role === 'assistant' ? (
                                        <div className="flex-shrink-0 mt-0.5">
                                            <SiriOrb size="30px" />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            marginTop: 2,
                                        }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#cbd5e1' }}>U</span>
                                        </div>
                                    )}

                                    {/* bubble */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            color: msg.isError ? '#fca5a5' : '#e2e8f0',
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                                                : msg.isError
                                                    ? 'rgba(127,29,29,0.4)'
                                                    : 'rgba(255,255,255,0.06)',
                                            border: msg.role === 'user'
                                                ? 'none'
                                                : msg.isError
                                                    ? '1px solid rgba(248,113,113,0.2)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                            {renderText(msg.text)}
                                        </div>
                                        {/* copy */}
                                        {msg.role === 'assistant' && (
                                            <button
                                                onClick={() => copy(msg.id, msg.text)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: '#475569', fontSize: 10, padding: '2px 4px',
                                                    opacity: 0, transition: 'opacity 0.2s',
                                                }}
                                                className="copy-btn"
                                            >
                                                {copiedId === msg.id
                                                    ? <><Check style={{ width: 11, height: 11, color: '#34d399' }} /><span style={{ color: '#34d399' }}>Copied</span></>
                                                    : <><Copy style={{ width: 11, height: 11 }} /> Copy</>
                                                }
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* typing indicator */}
                            {isLoading && (
                                <motion.div key="typing"
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    style={{ display: 'flex', gap: 10, alignItems: 'flex-start', alignSelf: 'flex-start' }}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <SiriOrb size="30px" />
                                    </div>
                                    <div style={{ padding: '12px 18px', borderRadius: '4px 18px 18px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                        <ShiningText text="OpinionAI is Thinking" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={endRef} />
                    </div>

                    {/* scroll-to-bottom */}
                    <AnimatePresence>
                        {showScrollBtn && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                style={{ position: 'absolute', bottom: 12, right: 12, width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(30,30,50,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                            >
                                <ChevronDown style={{ width: 16, height: 16 }} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── suggestion chips ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, flexShrink: 0 }}>
                    {SUGGESTIONS[chatMode].map(s => (
                        <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }} style={{
                            padding: '6px 14px', borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                            whiteSpace: 'nowrap', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis',
                            transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.09)'; b.style.color = '#e2e8f0'; }}
                            onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.04)'; b.style.color = '#94a3b8'; }}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* ── INPUT BAR ── */}
                <div style={{
                    marginTop: 12,
                    flexShrink: 0,
                    width: '100%',
                }}>
                    <RadiantPromptInput 
                        value={input}
                        onChange={setInput}
                        onSubmit={send}
                        disabled={isLoading}
                        placeholder={chatMode === 'data' ? 'Ask a data question…' : 'Ask for a report insight…'}
                        className="max-w-full"
                    />
                </div>

                {/* footer */}
                <p style={{ textAlign: 'center', color: '#334155', fontSize: 10, marginTop: 8, flexShrink: 0 }}>
                    Powered by Groq · Llama 3.1 · OpinionIQ
                </p>
            </div>

            {/* global styles for hover on copy buttons */}
            <style>{`
                .group:hover .copy-btn { opacity: 1 !important; }
                textarea::placeholder { color: #475569; }
                ::-webkit-scrollbar { display: none; }
            `}</style>
          </div>
        </GeometricBackground>
    );
}
