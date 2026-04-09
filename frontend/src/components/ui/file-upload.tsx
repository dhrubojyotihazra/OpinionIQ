'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
    UploadCloud,
    File as FileIcon,
    Trash2,
    Loader,
    CheckCircle,
    FileSpreadsheet,
} from 'lucide-react';

export interface CsvFileEntry {
    id: string;
    name: string;
    size: number;
    type: string;
    file: File;
    progress: number; // 0–100 (simulated while awaiting upload)
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
}

interface FileUploadProps {
    /** Called when the user confirms a file and we should start the real upload */
    onUpload: (file: File, onProgress: (pct: number) => void) => Promise<void>;
    /** Called when all files are done uploading (or any single file) */
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export default function FileUpload({ onUpload, onSuccess, onError }: FileUploadProps) {
    const [files, setFiles] = useState<CsvFileEntry[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFiles = async (fileList: FileList) => {
        const newEntries: CsvFileEntry[] = Array.from(fileList).map((f) => ({
            id: `${f.name}-${Date.now()}-${Math.random()}`,
            name: f.name,
            size: f.size,
            type: f.type,
            file: f,
            progress: 0,
            status: 'uploading',
        }));

        setFiles((prev) => [...prev, ...newEntries]);

        for (const entry of newEntries) {
            try {
                await onUpload(entry.file, (pct) => {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === entry.id ? { ...f, progress: Math.min(pct, 100) } : f
                        )
                    );
                });
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === entry.id ? { ...f, progress: 100, status: 'done' } : f
                    )
                );
                onSuccess?.();
            } catch (err: any) {
                const msg = err?.message ?? 'Upload failed';
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === entry.id ? { ...f, status: 'error', error: msg } : f
                    )
                );
                onError?.(msg);
            }
        }
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        // Reset so same file can be re-selected
        e.target.value = '';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* ── Drop Zone ── */}
            <motion.div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                initial={false}
                animate={{
                    borderColor: isDragging ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    scale: isDragging ? 1.02 : 1,
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                    'relative rounded-2xl p-8 md:p-10 text-center cursor-pointer',
                    'bg-white/[0.03] border border-dashed border-white/10',
                    'shadow-sm hover:shadow-md backdrop-blur-sm group transition-shadow',
                    isDragging && 'ring-4 ring-blue-400/30 border-blue-500',
                )}
            >
                <div className="flex flex-col items-center gap-4">
                    {/* Icon */}
                    <motion.div
                        animate={{ y: isDragging ? [-5, 0, -5] : 0 }}
                        transition={{ duration: 1.5, repeat: isDragging ? Infinity : 0, ease: 'easeInOut' }}
                        className="relative"
                    >
                        {isDragging && (
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -inset-4 bg-blue-400/10 rounded-full blur-md"
                            />
                        )}
                        <UploadCloud
                            className={clsx(
                                'w-16 h-16 drop-shadow-sm transition-colors duration-300',
                                isDragging
                                    ? 'text-blue-400'
                                    : 'text-zinc-400 group-hover:text-blue-400',
                            )}
                        />
                    </motion.div>

                    {/* Text */}
                    <div className="space-y-1.5">
                        <h3 className="text-lg md:text-xl font-semibold text-white/80">
                            {isDragging
                                ? 'Drop your CSV here'
                                : files.length
                                    ? 'Upload another file'
                                    : 'Drag & drop your CSV'}
                        </h3>
                        <p className="text-white/40 text-sm">
                            {isDragging ? (
                                <span className="font-medium text-blue-400">Release to upload</span>
                            ) : (
                                <>or <span className="text-blue-400 font-medium">click to browse</span></>
                            )}
                        </p>
                        <p className="text-xs text-white/20 flex items-center justify-center gap-1.5 mt-1">
                            <FileSpreadsheet size={12} className="text-emerald-400" />
                            .CSV files only — zero configuration required
                        </p>
                    </div>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept=".csv,text/csv"
                    onChange={onSelect}
                />
            </motion.div>

            {/* ── File List ── */}
            <div className="mt-5 space-y-3">
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-between items-center px-1 mb-2"
                        >
                            <h4 className="text-sm font-semibold text-white/60">
                                {files.length} file{files.length > 1 ? 's' : ''}
                            </h4>
                            {files.length > 1 && (
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-xs px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-red-400 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    className={clsx(
                        'flex flex-col gap-3',
                        files.length > 3 && 'max-h-72 overflow-y-auto pr-1',
                    )}
                >
                    <AnimatePresence>
                        {files.map((file) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                                className={clsx(
                                    'px-4 py-3.5 flex items-center gap-3 rounded-xl',
                                    'bg-white/[0.04] border border-white/[0.07]',
                                    'hover:bg-white/[0.06] transition-colors duration-200',
                                    file.status === 'error' && 'border-red-500/25 bg-red-950/20',
                                    file.status === 'done' && 'border-emerald-500/20',
                                )}
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <FileIcon
                                        className={clsx(
                                            'w-8 h-8',
                                            file.status === 'done' && 'text-emerald-400',
                                            file.status === 'error' && 'text-red-400',
                                            file.status === 'uploading' && 'text-blue-400',
                                            file.status === 'pending' && 'text-zinc-400',
                                        )}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-white/80 truncate">
                                            {file.name}
                                        </p>
                                        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs text-white/30">
                                            {Math.round(file.progress)}%
                                            {file.status === 'uploading' && (
                                                <Loader className="w-3.5 h-3.5 animate-spin text-blue-400" />
                                            )}
                                            {file.status === 'done' && (
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                            )}
                                            {file.status === 'done' && (
                                                <Trash2
                                                    className="w-3.5 h-3.5 cursor-pointer text-white/20 hover:text-red-400 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFiles((prev) => prev.filter((f) => f.id !== file.id));
                                                    }}
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/25 mt-0.5">{formatFileSize(file.size)}</p>

                                    {/* Progress bar */}
                                    {file.status !== 'error' && (
                                        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${file.progress}%` }}
                                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                                className={clsx(
                                                    'h-full rounded-full',
                                                    file.status === 'done' ? 'bg-emerald-500' : 'bg-blue-500',
                                                )}
                                            />
                                        </div>
                                    )}

                                    {file.status === 'error' && (
                                        <p className="text-xs text-red-400 mt-1">{file.error}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
