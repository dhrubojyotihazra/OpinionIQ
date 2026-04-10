import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import FileUpload from '@/components/ui/file-upload';
import { UploadCard, type UploadStatus } from '@/components/ui/upload-ui';
import { config } from '../config';
import { GlassButton } from '@/components/ui/glass-button';
import { Zap } from 'lucide-react';

interface CardState {
    status: UploadStatus;
    progress: number;
    title: string;
    description: string;
}

const HeroUpload: React.FC = () => {
    const [card, setCard] = useState<CardState | null>(null);
    const navigate = useNavigate();
    const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Called by FileUpload for every dropped CSV */
    const handleUpload = async (
        file: File,
        onProgress: (pct: number) => void
    ): Promise<void> => {
        // Show the UploadCard in "uploading" state right away
        setCard({
            status: 'uploading',
            progress: 0,
            title: 'Just a moment…',
            description: `Uploading "${file.name}" — running sentiment detection.`,
        });

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${config.apiUrl}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (evt) => {
                    const pct = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
                    onProgress(pct);
                    setCard((prev) => prev ? { ...prev, progress: pct } : prev);
                },
            });

            // Success
            onProgress(100);
            sessionStorage.setItem('hasUploaded', 'true');
            setCard({
                status: 'success',
                progress: 100,
                title: 'File uploaded!',
                description: 'Your dataset was accepted. Heading to the analytics dashboard now.',
            });

            if (navigateTimer.current) clearTimeout(navigateTimer.current);
            navigateTimer.current = setTimeout(() => navigate('/dashboard'), 1800);

        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'Upload failed. Please try again.';
            setCard({
                status: 'error',
                progress: 0,
                title: 'Upload failed',
                description: msg,
            });
            throw new Error(msg); // re-throw so FileUpload marks the entry as errored
        }
    };

    const dismissCard = () => {
        if (navigateTimer.current) clearTimeout(navigateTimer.current);
        setCard(null);
    };

    return (
        <HeroGeometric
            title1="Turn feedback into"
            title2="clear insight"
        >
            <div className="w-full max-w-2xl mx-auto mt-2 space-y-4">
                {/* Status card (UploadCard) */}
                <AnimatePresence mode="wait">
                    {card && (
                        <UploadCard
                            key={card.status}
                            status={card.status}
                            progress={card.progress}
                            title={card.title}
                            description={card.description}
                            primaryButtonText={
                                card.status === 'uploading'
                                    ? 'Cancel'
                                    : card.status === 'success'
                                        ? 'Go to Dashboard'
                                        : 'Retry'
                            }
                            onPrimaryButtonClick={() => {
                                if (card.status === 'success') navigate('/dashboard');
                                else dismissCard();
                            }}
                            secondaryButtonText={
                                card.status === 'success' ? undefined : 'Dismiss'
                            }
                            onSecondaryButtonClick={dismissCard}
                            onDismiss={dismissCard}
                        />
                    )}
                </AnimatePresence>

                {/* Main CTA for Landing Page */}
                {!card && (
                    <div className="flex flex-col items-center justify-center pb-8">
                        <GlassButton
                            size="lg"
                            className="w-full sm:w-[280px] h-[56px] shadow-indigo-500/20 shadow-2xl"
                            contentClassName="flex items-center justify-center gap-3 text-xl tracking-tight"
                            onClick={() => {
                                // Scrolly / Focus the dropzone
                                const dev = document.querySelector('.dropzone-section');
                                if (dev) dev.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <span>Get Started Now</span>
                            <Zap className="w-6 h-6 text-indigo-300 fill-indigo-300/20" />
                        </GlassButton>
                        <p className="mt-4 text-white/50 text-sm font-light">
                            Experience the power of OpinionIQ analytics
                        </p>
                    </div>
                )}

                {/* FileUpload dropzone + file list */}
                <div className="dropzone-section">
                    <FileUpload
                        onUpload={handleUpload}
                        onSuccess={() => {/* handled inside handleUpload */}}
                        onError={() => {/* handled inside handleUpload */}}
                    />
                </div>
            </div>

            <p className="mt-6 text-xs text-white/20 tracking-wide">
                No account needed &nbsp;·&nbsp; Works on any device &nbsp;·&nbsp; Free to try
            </p>
        </HeroGeometric>
    );
};

export default HeroUpload;
