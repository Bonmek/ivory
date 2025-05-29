import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { CirclePlus } from 'lucide-react';

function UploadZipPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                setUploadedFile(file as File);
            } else {
                // Show error for invalid file type
                console.error('Only ZIP files are allowed');
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                setUploadedFile(file as File);
            } else {
                console.error('Only ZIP files are allowed');
            }
        }
    };

    const handleUpload = async () => {
        if (!uploadedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setUploadProgress(i);
            }

            // Reset after successful upload
            setTimeout(() => {
                setUploadedFile(null);
                setUploadProgress(0);
            }, 1000);
        } catch (error) {
            console.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadProgress(0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        onDrop(files);
    };

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Upload Zip | Ivory</title>
                <link rel="canonical" href="http://mysite.com/example" />
            </Helmet>
            <div className="min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center"
                >
                    <CirclePlus className="h-6 w-6 lg:h-10 lg:w-10 text-sky-500 mr-4" />
                    <h1 className="text-3xl font-semibold font-pixel">
                        <FormattedMessage id="uploadZip.title" />
                    </h1>
                </motion.div>
                <div className="relative z-10 container mx-auto py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Main Upload Card */}
                        <motion.div
                            className={`relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-500 ${isDragActive
                                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-2xl shadow-purple-500/25'
                                : 'bg-white/10 border-gray-300 hover:bg-white/15'
                                }`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10"></div>

                            <div className="relative z-10 p-8">
                                {/* Upload Area */}
                                <motion.div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${isDragActive
                                        ? 'border-purple-400 bg-purple-500/10'
                                        : 'border-gray-400/30 hover:border-purple-400/50 hover:bg-purple-500/5'
                                        }`}
                                    animate={{
                                        scale: isDragActive ? 1.05 : 1,
                                        borderColor: isDragActive ? '#a855f7' : '#9ca3af50'
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <input
                                        type="file"
                                        accept=".zip,application/zip"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />

                                    <div className="flex flex-col items-center justify-center space-y-6">
                                        {/* Upload Icon */}
                                        <motion.div
                                            className={`relative p-6 rounded-full transition-all duration-300 ${isDragActive
                                                ? 'bg-gradient-to-br from-primary via-secondary-500 to-secondary'
                                                : 'bg-gradient-to-br from-gray-700 to-gray-800 group-hover:from-primary/80 group-hover:to-secondary/80'
                                                }`}
                                            animate={{
                                                scale: isDragActive ? 1.1 : 1,
                                                rotate: isDragActive ? 360 : 0
                                            }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <motion.svg
                                                className="w-12 h-12 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                animate={{
                                                    y: isDragActive ? [0, -5, 0] : 0
                                                }}
                                                transition={{ duration: 0.6, repeat: isDragActive ? Infinity : 0 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </motion.svg>
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-white/20"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.3, 0, 0.3]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.div>

                                        {/* Text */}
                                        <motion.div
                                            className="space-y-2"
                                            animate={{
                                                y: isDragActive ? -5 : 0
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3 className="text-2xl font-bold text-white">
                                                {isDragActive ? 'Drop it like it\'s hot!' : 'Drag & Drop Your ZIP'}
                                            </h3>
                                            <p className="text-white/80">
                                                or click to browse files
                                            </p>
                                            <p className="text-sm text-white/60">
                                                Maximum file size: 100MB
                                            </p>
                                        </motion.div>

                                        {/* Visual indicators */}
                                        <motion.div
                                            className="flex space-x-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5, duration: 0.4 }}
                                        >
                                            <motion.div
                                                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <motion.div
                                                    className="w-2 h-2 bg-green-400 rounded-full"
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                                <span className="text-sm text-white">ZIP files only</span>
                                            </motion.div>
                                            <motion.div
                                                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <motion.div
                                                    className="w-2 h-2 bg-blue-400 rounded-full"
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                                />
                                                <span className="text-sm text-white">Fast upload</span>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* File Preview */}
                        <AnimatePresence>
                            {uploadedFile && (
                                <motion.div
                                    className="mt-8"
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                                    transition={{ duration: 0.5, ease: "backOut" }}
                                >
                                    <motion.div
                                        className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl rounded-2xl border border-gray-300 p-6 shadow-2xl"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <motion.div
                                                    className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
                                                    animate={{ rotate: [0, 5, -5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.2, duration: 0.4 }}
                                                >
                                                    <p className="font-semibold text-white text-lg">{uploadedFile.name}</p>
                                                    <p className="text-white/80">
                                                        {(uploadedFile.size as number / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </motion.div>
                                            </div>

                                            <motion.div
                                                className="flex items-center space-x-3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                            >
                                                <motion.button
                                                    onClick={removeFile}
                                                    disabled={isUploading}
                                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Remove
                                                </motion.button>
                                                <motion.button
                                                    onClick={handleUpload}
                                                    disabled={isUploading}
                                                    className="relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 disabled:opacity-50"
                                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(168, 85, 247, 0.4)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {isUploading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <motion.div
                                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            />
                                                            <span>Uploading...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            <span>Upload</span>
                                                        </div>
                                                    )}
                                                </motion.button>
                                            </motion.div>
                                        </div>

                                        {/* Progress Bar */}
                                        <AnimatePresence>
                                            {isUploading && (
                                                <motion.div
                                                    className="mt-6"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex justify-between text-sm text-white mb-2">
                                                        <span>Uploading...</span>
                                                        <motion.span
                                                            key={uploadProgress}
                                                            initial={{ scale: 1.2 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {uploadProgress}%
                                                        </motion.span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full relative"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${uploadProgress}%` }}
                                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                                        >
                                                            <motion.div
                                                                className="absolute inset-0 bg-white/20"
                                                                animate={{
                                                                    x: ["-100%", "100%"]
                                                                }}
                                                                transition={{
                                                                    duration: 1.5,
                                                                    repeat: Infinity,
                                                                    ease: "linear"
                                                                }}
                                                            />
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Message */}
                        {uploadProgress === 100 && isUploading && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl animate-fade-in">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500 rounded-full">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-green-200 font-medium">Upload completed successfully!</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default UploadZipPage;