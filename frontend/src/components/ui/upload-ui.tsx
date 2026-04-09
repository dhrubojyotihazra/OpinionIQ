'use client';

import * as React from 'react';
import { X, ArrowDownCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type UploadStatus = 'uploading' | 'success' | 'error';

export interface UploadCardProps {
    status: UploadStatus;
    progress?: number;
    title: string;
    description: string;
    primaryButtonText: string;
    onPrimaryButtonClick?: () => void;
    secondaryButtonText?: string;
    onSecondaryButtonClick?: () => void;
    onDismiss?: () => void;
}

const STATUS_CONFIG: Record<UploadStatus, { icon: React.ElementType; accent: string; glow: string; track: string; fill: string }> = {
    uploading: {
        icon: ArrowDownCircle,
        accent: 'border-blue-500/30 bg-blue-950/20',
        glow:   'text-blue-400',
        track:  'bg-white/[0.08]',
        fill:   'bg-blue-500',
    },
    success: {
        icon: CheckCircle,
        accent: 'border-emerald-500/30 bg-emerald-950/20',
        glow:   'text-emerald-400',
        track:  'bg-white/[0.08]',
        fill:   'bg-emerald-500',
    },
    error: {
        icon: XCircle,
        accent: 'border-red-500/30 bg-red-950/20',
        glow:   'text-red-400',
        track:  'bg-white/[0.08]',
        fill:   'bg-red-500',
    },
};

export const UploadCard: React.FC<UploadCardProps> = ({
    status,
    progress = 0,
    title,
    description,
    primaryButtonText,
    onPrimaryButtonClick,
    secondaryButtonText,
    onSecondaryButtonClick,
    onDismiss,
}) => {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className={clsx(
                'relative rounded-2xl border p-5 backdrop-blur-sm',
                'flex flex-col gap-4 shadow-lg',
                cfg.accent,
            )}
        >
            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-3.5 right-3.5 text-white/20 hover:text-white/60 transition-colors"
                >
                    <X size={15} />
                </button>
            )}

            {/* Body */}
            <div className="flex items-start gap-4">
                <div className={clsx('flex-shrink-0 mt-0.5', cfg.glow)}>
                    <Icon size={28} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white/90 mb-0.5">{title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{description}</p>

                    {/* Progress bar (uploading only) */}
                    {status === 'uploading' && (
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-white/30 mb-1.5">
                                <span>Uploading…</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className={clsx('w-full h-1.5 rounded-full overflow-hidden', cfg.track)}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className={clsx('h-full rounded-full', cfg.fill)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={(e) => { e.preventDefault(); onPrimaryButtonClick?.(); }}
                    className={clsx(
                        'flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-200',
                        status === 'uploading'
                            ? 'bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white/80'
                            : status === 'success'
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                                : 'bg-red-500 hover:bg-red-400 text-white',
                    )}
                >
                    {primaryButtonText}
                </button>

                {secondaryButtonText && (
                    <button
                        onClick={(e) => { e.preventDefault(); onSecondaryButtonClick?.(); }}
                        className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] text-white/50 hover:text-white/80 transition-all duration-200"
                    >
                        {secondaryButtonText}
                    </button>
                )}
            </div>
        </motion.div>
    );
};
