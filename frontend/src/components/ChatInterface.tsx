import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Database, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    mode: 'data' | 'report';
    isError?: boolean;
}

const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial',
            role: 'assistant',
            text: "Hello! I'm the OpinionIQ Assistant. I have two modes:\n\n1. **Data Query:** Ask me quantitative questions like *'How many reviews are positive?'*\n2. **Report Query:** Ask me qualitative questions like *'What are the main complaints?'*\n\nHow can I help you analyze the dataset?",
            mode: 'data'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatMode, setChatMode] = useState<'data' | 'report'>('data');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            mode: chatMode
        };

        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        const endpoint = chatMode === 'data' ? '/chat/data' : '/chat/report';

        try {
            const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, {
                message: userText
            });

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response.data.reply || response.data.response || "No response generated.",
                mode: chatMode
            }]);
        } catch (err: unknown) {
            console.error("Chat error:", err);
            let errMsg = "Sorry, I encountered an error answering that.";
            if (axios.isAxiosError(err)) {
                errMsg = err.response?.data?.error || errMsg;
            }
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: errMsg,
                mode: chatMode,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="flex flex-col h-[650px] border border-slate-800/60 rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-xl shadow-2xl relative">
            {/* Header */}
            <div className="bg-slate-900/80 p-4 border-b border-slate-800/60 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-10 w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-[2px]">
                        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">OpinionIQ Assistant</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                        </p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-slate-950/50 p-1 rounded-lg border border-slate-800/50">
                    <button
                        onClick={() => setChatMode('data')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                            chatMode === 'data'
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        )}
                    >
                        <Database className="w-4 h-4" />
                        Data Query
                    </button>
                    <button
                        onClick={() => setChatMode('report')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                            chatMode === 'report'
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                        Report Query
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex w-full",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "flex gap-3 max-w-[85%]",
                                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}>
                                {/* Avatar */}
                                <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
                                    msg.role === 'user' ? "bg-slate-800 border border-slate-700" : "bg-indigo-900/50 border border-indigo-500/30"
                                )}>
                                    {msg.role === 'user'
                                        ? <User className="w-4 h-4 text-slate-300" />
                                        : <Bot className="w-4 h-4 text-indigo-400" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-indigo-600 text-white rounded-tr-sm"
                                        : msg.isError
                                            ? "bg-red-950/50 border border-red-900/50 text-red-200 rounded-tl-sm"
                                            : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm backdrop-blur-sm"
                                )}>
                                    {msg.role === 'assistant' && msg.isError && (
                                        <AlertCircle className="w-4 h-4 mb-2 text-red-400 inline-block mr-2" />
                                    )}
                                    {msg.text}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start w-full"
                        >
                            <div className="flex gap-3 max-w-[80%] flex-row">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center mt-1">
                                    <Bot className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                    <span className="text-slate-400 text-sm">Thinking...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800/60 relative z-10">
                <div className="relative flex items-end gap-2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={chatMode === 'data' ? "Ask about values, counts, or stats..." : "Ask for summaries, themes, or insights..."}
                        className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none scrollbar-thin scrollbar-thumb-slate-700"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 h-11 w-11 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </div>
                <div className="text-center mt-3">
                    <span className="text-xs text-slate-500">
                        {chatMode === 'data' ? 'Using PandasAI for exact dataframe queries.' : 'Using Gemini for contextual semantic reporting.'}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default ChatInterface;
