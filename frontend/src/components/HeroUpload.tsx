import React, { useCallback } from 'react';
import { HeroSection } from '@/components/ui/hero-section-dark';
import { SplineScene } from '@/components/ui/splite';
import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';
import { UploadCloud, FileSpreadsheet, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HeroUpload: React.FC = () => {
    const [isUploading, setIsUploading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Upload success:", response.data);
            // Navigate to dashboard and optionally trigger analysis later
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Upload failed", err);
            setError(err.response?.data?.error || "Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    }, [navigate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        multiple: false
    });

    return (
        <HeroSection
            title="OpinionIQ Enterprise Analysis"
            subtitle={{
                regular: "Decode your feedback ",
                gradient: "instantly with AI.",
            }}
            description="Upload your feedback dataset to unlock deep sentiment analysis, AI-generated reports, and conversational queries—all in seconds."
            gridOptions={{
                angle: 65,
                opacity: 0.3,
                cellSize: 60,
                lightLineColor: "#4f46e5",
                darkLineColor: "#4f46e5",
            }}
            className="pb-24"
        >
            <div className="mt-16 sm:mt-24 max-w-7xl mx-auto w-full flex flex-col items-center justify-center z-20 relative">
                <Card className="w-full overflow-hidden bg-slate-950/80 border-slate-800 shadow-2xl shadow-indigo-500/10">
                    <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

                    <div className="flex flex-col lg:flex-row h-auto lg:h-[600px] w-full relative z-10">
                        {/* Left Content: Interactive Dropzone */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-800/60 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                                    Start Analysis
                                </h3>
                            </div>

                            {/* Glassmorphism Dropzone */}
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="group relative cursor-pointer"
                                >
                                    <div className={`absolute inset-0 rounded-2xl blur opacity-25 transition duration-500 ${isDragActive ? 'bg-emerald-500 opacity-50' : 'bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:opacity-40'}`}></div>
                                    <div className={`relative border-2 border-dashed bg-slate-900/60 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${isDragActive ? 'border-emerald-400 bg-emerald-950/20' : 'border-indigo-500/50 group-hover:bg-slate-900/80 group-hover:border-indigo-400'}`}>

                                        <AnimatePresence mode="wait">
                                            {isUploading ? (
                                                <motion.div
                                                    key="uploading"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex flex-col items-center"
                                                >
                                                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                                                    <h4 className="text-lg font-semibold text-indigo-300">AI is Analyzing...</h4>
                                                    <p className="text-slate-400 text-sm mt-2">Identifying sentiment columns</p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="idle"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex flex-col items-center w-full"
                                                >
                                                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 relative">
                                                        <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-emerald-400' : 'text-indigo-400'}`} />
                                                        {isDragActive && <div className="absolute inset-0 border border-emerald-500/50 rounded-full animate-ping opacity-50"></div>}
                                                    </div>
                                                    <h4 className="text-xl font-semibold text-white mb-2">
                                                        {isDragActive ? "Drop CSV Here!" : "Drag & Drop CSV"}
                                                    </h4>
                                                    <p className="text-slate-400 text-center text-sm mb-6 max-w-xs">
                                                        or click to manually select a file from your computer
                                                    </p>

                                                    {error && (
                                                        <div className="mb-4 text-red-400 text-sm bg-red-950/50 px-4 py-2 rounded border border-red-900/50 text-center">
                                                            {error}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-4">
                                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
                                                            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                                            .CSV Supported
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
                                                            <Zap className="w-4 h-4 text-amber-500" />
                                                            Zero Config
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>

                        </div>

                        {/* Right Content: 3D Spline Interactive Scene */}
                        <div className="flex-[1.2] relative min-h-[400px] lg:min-h-full bg-black/40">
                            {/* Fallback to dashboard image if 3D fails, though Spline handles its own loader */}
                            <div className="absolute inset-0 overflow-hidden rounded-r-xl">
                                <SplineScene
                                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                    className="w-full h-[120%] -mt-[10%] object-cover"
                                />
                            </div>
                            <div className="absolute bottom-6 right-6 z-20 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-xs text-slate-300 font-medium tracking-wide text-uppercase">Interactive 3D Preview</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </HeroSection>
    );
};

export default HeroUpload;
