import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Pencil, User, Mail, Phone, MapPin, Link as LinkIcon, FileText, Tag, Calendar,
    Settings, Palette, Layout, Code, Database, Shield, Zap, Share2, Building,
    Package, DollarSign, Monitor, Navigation, ExternalLink, ChevronRight,
    Clock, Droplet, LayoutTemplate, FileCode, Fingerprint, Lock, Menu, Globe,
    Server, UserCheck, Send, CircleDot, CheckCircle, XCircle, Type, FolderRoot
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectCardProps {
    fieldKey: string;
    value: string;
    index: number;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.05 * i,
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
        }
    }),
    hover: {
        y: -8,
        transition: {
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

const iconVariants = {
    initial: { scale: 1 },
    hover: {
        scale: 1.1,
        rotate: [0, 5, -5, 5, 0],
        transition: {
            duration: 0.6,
            ease: 'easeInOut'
        }
    }
};

export const ProjectCard = ({ fieldKey, value, index }: ProjectCardProps) => {
    const formattedKey = fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isHovered = false; // Removed hover state since we don't need it anymore

    const getIcon = (key: string): ReactNode => {
        const iconMap: Record<string, ReactNode> = {
            // User-related
            name: <User className="w-5 h-5" />,
            username: <User className="w-5 h-5" />,
            email: <Mail className="w-5 h-5" />,
            phone: <Phone className="w-5 h-5" />,

            // Location
            address: <MapPin className="w-5 h-5" />,
            location: <MapPin className="w-5 h-5" />,

            // Website & Links
            website: <LinkIcon className="w-5 h-5" />,
            url: <LinkIcon className="w-5 h-5" />,
            link: <ExternalLink className="w-5 h-5" />,

            // Content
            description: <FileText className="w-5 h-5" />,
            content: <FileText className="w-5 h-5" />,
            text: <FileText className="w-5 h-5" />,

            // Metadata
            title: <Tag className="w-5 h-5" />,
            date: <Calendar className="w-5 h-5" />,
            time: <Clock className="w-5 h-5" />,  // Added Clock icon

            // Settings & Configuration
            settings: <Settings className="w-5 h-5" />,
            config: <Settings className="w-5 h-5" />,
            configuration: <Settings className="w-5 h-5" />,
            preferences: <Settings className="w-5 h-5" />,

            // Design
            theme: <Palette className="w-5 h-5" />,
            color: <Droplet className="w-5 h-5" />,  // Added Droplet icon
            style: <Palette className="w-5 h-5" />,

            // Layout & Structure
            layout: <Layout className="w-5 h-5" />,
            structure: <LayoutTemplate className="w-5 h-5" />,  // Added LayoutTemplate icon
            template: <LayoutTemplate className="w-5 h-5" />,

            // Code & Development
            code: <Code className="w-5 h-5" />,
            script: <FileCode className="w-5 h-5" />,  // Added FileCode icon
            programming: <Code className="w-5 h-5" />,

            // Data
            database: <Database className="w-5 h-5" />,
            storage: <Database className="w-5 h-5" />,
            blobid: <Fingerprint className="w-5 h-5" />,  // Added Fingerprint icon for blobId

            // Security
            security: <Shield className="w-5 h-5" />,
            password: <Lock className="w-5 h-5" />,  // Added Lock icon
            private: <Lock className="w-5 h-5" />,

            // Performance
            performance: <Zap className="w-5 h-5" />,
            speed: <Zap className="w-5 h-5" />,

            // Social & Sharing
            social: <Share2 className="w-5 h-5" />,
            share: <Share2 className="w-5 h-5" />,

            // Business
            company: <Building className="w-5 h-5" />,
            organization: <Building className="w-5 h-5" />,
            business: <Building className="w-5 h-5" />,

            // Products & Items
            product: <Package className="w-5 h-5" />,
            item: <Package className="w-5 h-5" />,

            // Financial
            price: <DollarSign className="w-5 h-5" />,
            cost: <DollarSign className="w-5 h-5" />,
            amount: <DollarSign className="w-5 h-5" />,

            // UI Elements
            screen: <Monitor className="w-5 h-5" />,
            display: <Monitor className="w-5 h-5" />,
            navigation: <Navigation className="w-5 h-5" />,
            menu: <Menu className="w-5 h-5" />,  // Added Menu icon

            // Network & Connectivity
            network: <Globe className="w-5 h-5" />,  // Added Globe icon
            server: <Server className="w-5 h-5" />,  // Added Server icon

            // Owner and Send To specific
            owner: <UserCheck className="w-5 h-5" />,  // Added UserCheck icon
            'send_to': <Send className="w-5 h-5" />,   // Added Send icon

            // Status
            status: <CircleDot className="w-5 h-5" />,  // Added CircleDot icon
            active: <CheckCircle className="w-5 h-5" />,  // Added CheckCircle icon
            inactive: <XCircle className="w-5 h-5" />,  // Added XCircle icon

            // Type
            type: <Type className="w-5 h-5" />,  // Added Type icon

            // Root
            root: <FolderRoot className="w-5 h-5" />  // Added FolderRoot icon
        };

        // First try exact match, then try partial match
        return (
            iconMap[key.toLowerCase()] ||
            Object.entries(iconMap).find(([k]) =>
                key.toLowerCase().includes(k)
            )?.[1] ||
            <FileText className="w-5 h-5" />
        );
    };

    const iconBgGradient = 'from-secondary-500/15 to-secondary-600/15';
    const cardBgGradient = 'from-primary-800/70 to-primary-900/70';

    return (
        <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}

            className={cn(
                "group relative overflow-hidden rounded-2xl p-5 sm:p-6 border backdrop-blur-lg",
                "transition-all duration-500 h-full",
                "bg-gradient-to-br",
                cardBgGradient,
                "border-secondary-500/15 hover:border-secondary-400/30",
                "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)]"
            )}
        >
            {/* Animated gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl p-[1px] pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-secondary-500/0 via-secondary-400/20 to-secondary-500/0"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? [0, '100%'] : ['-100%', 0],
                    }}
                    transition={{
                        duration: 1.5,
                        ease: 'easeInOut',
                        repeat: isHovered ? Infinity : 0,
                        repeatType: 'loop'
                    }}
                />
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#2d374850_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

            <div className="relative z-10 h-full flex flex-col">
                <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <motion.div
                            className={cn(
                                "p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300",
                                "bg-gradient-to-br",
                                iconBgGradient,
                                "border-secondary-500/20 group-hover:border-secondary-400/40"
                            )}
                            variants={iconVariants}
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={`${fieldKey}-${isHovered ? 'hover' : 'idle'}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.2 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "block w-5 h-5 transition-colors duration-300",
                                        isHovered ? "text-white" : "text-secondary-300"
                                    )}
                                >
                                    {getIcon(fieldKey)}
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>
                        <div className="overflow-hidden">
                            <motion.h3
                                className={cn(
                                    "text-base sm:text-lg font-semibold mb-1 break-words tracking-tight",
                                    "bg-clip-text transition-all duration-300",
                                    "text-white"
                                )}
                                initial={false}
                                animate={{
                                    x: isHovered ? [0, 2, 0] : 0,
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: 'easeInOut',
                                    repeat: isHovered ? Infinity : 0,
                                    repeatType: 'reverse'
                                }}
                            >
                                {formattedKey}
                            </motion.h3>
                            <div className="text-xs uppercase tracking-wider font-medium bg-gradient-to-r from-secondary-400/80 to-secondary-300/80 bg-clip-text text-transparent">
                                Project Detail
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-auto pt-2">
                    <AnimatePresence mode="wait">
                        {value ? (
                            <motion.div
                                key="value-content"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="relative"
                            >
                                <motion.p
                                    className={cn(
                                        "text-base font-medium leading-relaxed break-words transition-colors duration-300",
                                        isHovered ? "text-white" : "text-white/90"
                                    )}
                                >
                                    {(() => {
                                        if (['owner', 'send_to'].includes(fieldKey) && value.length > 30) {
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-help">
                                                                {`${value.slice(0, 30)}...`}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs break-words">
                                                            {value}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        } else if (fieldKey === 'blobId' && value.length > 20) {
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-help">
                                                                {`${value.slice(0, 20)}...`}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs break-words">
                                                            {value}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        } else if (['start_date', 'end_date'].includes(fieldKey) && value) {
                                            try {
                                                const date = new Date(value);
                                                // Format for English locale
                                                const options: Intl.DateTimeFormatOptions = {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                    timeZone: 'Asia/Bangkok'
                                                };

                                                const formattedDate = date.toLocaleDateString('en-US', options);

                                                // Format: May 30, 2024 at 1:23 PM
                                                return (
                                                    <div className="flex flex-col">
                                                        <span>{formattedDate}</span>
                                                    </div>
                                                );
                                            } catch (e) {
                                                console.error('Error formatting date:', e);
                                                return value;
                                            }
                                        }
                                        return value;
                                    })()}
                                </motion.p>
                            </motion.div>
                        ) : (
                            <motion.em
                                key="empty-state"
                                className="text-secondary-500 italic text-sm"
                                initial={{ opacity: 0.6 }}
                                animate={{
                                    opacity: [0.6, 0.8, 0.6],
                                    x: [0, 2, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            >
                                No data found
                            </motion.em>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
