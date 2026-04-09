import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Globe, GraduationCap, MapPin } from 'lucide-react';
import { ShineBorder } from '@/components/ui/shine-border';
import GeometricBackground from '@/components/ui/geometric';

import profileImage from '../../public/profile.jpg';

/* ─────────────────────────────────────────
   👇 PERSONALISE THIS SECTION
   ───────────────────────────────────────── */
const PROFILE = {
    // STEP 1 — Replace with your hosted image URL or local import path
    // e.g. "/profile.jpg"  (place photo in /public folder)
    // or   "https://your-cdn.com/photo.jpg"
    photo: profileImage,                              // ← paste your photo URL here

    name:       'Dhrubojyoti Hazra',
    degree:     'BTech Computer Science and Engineering — Data Science',
    university: 'Brainware University',
    location:   'Madhyamgram, Kolkata',

    // STEP 2 — Replace with your real links
    github:    'https://github.com/dhrubojyotihazra',
    linkedin:  'https://www.linkedin.com/in/dhrubojyoti-hazra-a71a9a325/',
    email:     'mailto:dhrubojyotihazra@gmail.com',
    portfolio: 'https://dhrubojyoti-portfolio.vercel.app', // ← your portfolio website URL
};
/* ───────────────────────────────────────── */

const SHINE: [string, string, string] = ['#A07CFE', '#FE8FB5', '#FFBE7B'];

const SOCIAL_BTN =
    'w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 ';

export default function Contact() {
    return (
        <GeometricBackground className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 pt-24 pb-8 mt-0 overflow-hidden">

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 mb-10 text-center"
            >
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 mb-6 md:mb-8">
                    Meet the Developer
                </h1>
                <p className="text-white/60 mt-3 text-base sm:text-lg md:text-xl font-light tracking-wide max-w-xl mx-auto px-4">
                    OpinionIQ was built to showcase the seamless integration of advanced Machine Learning and NLP models with a modern, production-ready web framework.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="relative z-10 w-full max-w-sm"
            >
                <ShineBorder
                    color={SHINE}
                    className={[
                        'w-full !max-w-none !block',
                        'bg-black/25 border border-white/20 backdrop-blur-md',
                        'rounded-2xl p-6 sm:p-8 text-center',
                        'shadow-[inset_0_1px_0px_rgba(255,255,255,0.1),0_0_24px_rgba(0,0,0,0.35)]',
                        'relative',
                        'before:absolute before:inset-0 before:rounded-2xl',
                        'before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent',
                        'before:opacity-70 before:pointer-events-none',
                        'after:absolute after:inset-0 after:rounded-2xl',
                        'after:bg-gradient-to-tl after:from-white/5 after:via-transparent after:to-transparent',
                        'after:opacity-50 after:pointer-events-none',
                    ].join(' ')}
                >
                    <div className="relative z-10 flex flex-col items-center">

                        {/* ── Profile photo ── */}
                        <div className="mb-5">
                            {PROFILE.photo ? (
                                <img
                                    src={PROFILE.photo}
                                    alt={PROFILE.name}
                                    className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/50 shadow-xl shadow-indigo-500/20"
                                />
                            ) : (
                                /* Placeholder initials avatar shown until photo is set */
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600/50 to-purple-700/50 border-4 border-indigo-400/40 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                                    <span className="text-3xl font-black text-indigo-200 select-none">DH</span>
                                </div>
                            )}
                        </div>

                        {/* ── Name ── */}
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300 mb-1">
                            {PROFILE.name}
                        </h1>

                        {/* ── Degree ── */}
                        <p className="text-slate-400 text-sm leading-snug max-w-[240px] mb-5">
                            {PROFILE.degree}
                        </p>

                        {/* ── University + Location ── */}
                        <div className="flex flex-col gap-2 mb-6 text-sm text-slate-400">
                            <span className="flex items-center justify-center gap-2">
                                <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                {PROFILE.university}
                            </span>
                            <span className="flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                {PROFILE.location}
                            </span>
                        </div>

                        {/* ── Divider ── */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-6" />

                        {/* ── Social icons ── */}
                        <div className="flex items-center gap-3 mb-5">
                            <a
                                href={PROFILE.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className={SOCIAL_BTN + 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:scale-110'}
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <a
                                href={PROFILE.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className={SOCIAL_BTN + 'bg-blue-600/15 border-blue-500/25 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400/50 hover:scale-110'}
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href={PROFILE.email}
                                aria-label="Email"
                                className={SOCIAL_BTN + 'bg-indigo-600/15 border-indigo-500/25 text-indigo-400 hover:bg-indigo-600/30 hover:border-indigo-400/50 hover:scale-110'}
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>

                        {/* ── Portfolio button ── */}
                        <a
                            href={PROFILE.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Globe className="w-4 h-4" />
                            View Portfolio
                        </a>

                    </div>
                </ShineBorder>

                {/* ── subtle tagline below card ── */}
                <p className="text-center text-slate-600 text-xs mt-5">
                    Built with ❤️ using React, Flask &amp; Groq · OpinionIQ
                </p>
            </motion.div>

        </GeometricBackground>
    );
}
