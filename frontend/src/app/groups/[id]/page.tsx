'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Users, Send, ShieldCheck, Lock, Globe, ArrowRight, MessageCircle, Info, Shield, Calendar, Mail, Phone, Wallet, Search, X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface GroupDetails {
    id: string;
    name: string;
    description: string;
    short_description: string;
    is_public: boolean;
    image: string;
    memberCount: number;
    created_at: string;
    email: string;
    whatsapp: string;
}

interface Message {
    id: number;
    content: string;
    user_id: number;
    username: string;
    reputation: number;
    created_at: string;
}

export default function GroupChatPage() {
    const params = useParams();
    const groupId = params?.id as string;
    const router = useRouter();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'chat' | 'about' | 'members' | 'leaderboard'>('chat');

    // Leaderboard State
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);

    // Group Top-Up Feature State
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [toppingUp, setToppingUp] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/groups/${groupId}/messages`);
            if (res.data.success) {
                setMessages(res.data.data);
                if (activeTab === 'chat') setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (!groupId) return;

        const initData = async () => {
            if (!groupId || groupId === 'undefined' || groupId === 'null') return;

            try {
                // Determine logged in user
                try {
                    const userRes = await api.get('/auth/me');
                    if (userRes.data.success) {
                        setCurrentUser(userRes.data.user);
                    }
                } catch (e) {
                    router.push('/login');
                    return;
                }

                // Fetch group info
                const res = await api.get(`/groups/${groupId}`);
                if (res.data.success) {
                    setGroup(res.data.group);
                    setIsMember(res.data.isMember);
                    setUserRole(res.data.role);

                    if (res.data.isMember) {
                        await fetchMessages();
                    }
                }
            } catch (error: any) {
                console.error("Failed to fetch group details:", error);
                if (error.response) {
                    console.error("Error data:", error.response.data);
                    console.error("Error status:", error.response.status);
                    console.error("Error URL:", error.config?.url);
                } else if (error.request) {
                    console.error("Error request:", error.request);
                } else {
                    console.error("Error message:", error.message);
                }
                router.push('/groups');
            } finally {
                setLoading(false);
            }
        };

        initData();

        let interval: NodeJS.Timeout;
        if (isMember) {
            interval = setInterval(fetchMessages, 5000);
        }
        return () => { if (interval) clearInterval(interval); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId, router, isMember]);

    // Scroll trick for tab switch
    useEffect(() => {
        if (activeTab === 'chat' && isMember) {
            scrollToBottom();
        }

        if (activeTab === 'leaderboard' && isMember && leaderboard.length === 0) {
            fetchLeaderboard();
        }
    }, [activeTab, isMember]);

    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const res = await api.get(`/groups/${groupId}/leaderboard`);
            if (res.data.success) {
                setLeaderboard(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoadingLeaderboard(false);
        }
    };


    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await api.post(`/groups/${groupId}/join`, {});
            if (res.data.success) {
                setIsMember(true);
                const groupRes = await api.get(`/groups/${groupId}`);
                setGroup(groupRes.data.group);
                setUserRole(groupRes.data.role);
                await fetchMessages();
            }
        } catch (err: any) {
            console.error("Failed to join group:", err);
            alert(err.response?.data?.error || "Failed to join group");
        } finally {
            setJoining(false);
        }
    };

    // --- Search Users for Top-Up ---
    useEffect(() => {
        if (!showTopUpModal || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get(`/groups/${groupId}/search-users?q=${searchQuery}`);
                if (res.data.success) {
                    setSearchResults(res.data.data);
                }
            } catch (err) {
                console.error("Failed to search users", err);
            } finally {
                setSearching(false);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [searchQuery, showTopUpModal, groupId]);

    const handleTopUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !topUpAmount) return;

        setToppingUp(true);
        try {
            const res = await api.post(`/groups/${groupId}/topup`, {
                targetUserId: selectedUser.id,
                amount: topUpAmount
            });
            if (res.data.success) {
                alert(res.data.message);
                setShowTopUpModal(false);
                setSelectedUser(null);
                setSearchQuery('');
                setTopUpAmount('');
            }
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to top up user");
        } finally {
            setToppingUp(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post(`/groups/${groupId}/messages`, { content: newMessage });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.data]);
                setNewMessage('');
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center overflow-hidden">
                {/* Ambient Shimmer Background */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),transparent_50%)]" />

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative w-24 h-24 mb-8"
                    >
                        {/* Outer Pulse Rings */}
                        <motion.div
                            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full border border-indigo-400"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-0 rounded-full border border-purple-400"
                        />

                        {/* Core Logo Container */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[30px] shadow-2xl shadow-indigo-500/30 flex items-center justify-center border border-white/20">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-bold text-lg tracking-tight">Syncing Community</span>
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                            />
                        </div>

                        {/* High-Prestige Progress Bar */}
                        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent w-full"
                            />
                        </div>

                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Establishing Secure Connection</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!group) return null;

    return (
        <main className="h-[100dvh] bg-[#F8FAFC] text-slate-900 font-sans flex flex-col relative overflow-hidden">
            {/* Ambient Luxe Backdrop */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_40%)] pointer-events-none" />

            {/* Industry Grade Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] pt-2 md:pt-4 shrink-0">
                <div className="max-w-[1000px] mx-auto px-4 md:px-8">
                    {/* Compact Top Bar */}
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => router.push('/groups')}
                            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shrink-0 group"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                        </button>

                        <div className={cn(
                            "w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center text-lg font-bold text-white shadow-lg",
                            group.image === 'shillong' ? "bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-500/10" :
                                group.image === 'khanapara' ? "bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/10" :
                                    group.image === 'night' ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-violet-500/10" :
                                        "bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/10"
                        )}>
                            {group.name.charAt(0)}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 justify-between">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <h1 className="text-base md:text-lg font-bold text-slate-900 truncate tracking-tight">{group.name}</h1>
                                    {group.id === '1' && <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />}
                                </div>

                                {group.whatsapp && (
                                    <motion.a
                                        href={group.whatsapp.startsWith('http') ? group.whatsapp : `https://wa.me/${group.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all shrink-0 ml-2"
                                        title="Contact on WhatsApp"
                                    >
                                        <MessageCircle className="w-4.5 h-4.5 fill-current" />
                                    </motion.a>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[12px] text-slate-500 font-bold tracking-tight">
                                    {group.memberCount.toLocaleString()} <span className="text-slate-400">Members</span>
                                </span>
                                <span className="block w-1 h-1 bg-slate-300 rounded-full" />
                                <div className="flex items-center gap-1">
                                    {group.is_public ? (
                                        <>
                                            <Globe className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Public</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-3 h-3 text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Private</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Luxe Navigation Tabs */}
                    <div className="flex items-center gap-1.5 no-scrollbar overflow-x-auto pb-1">
                        {[
                            { id: 'chat', label: 'Feed', icon: MessageCircle },
                            { id: 'leaderboard', label: 'Ranks', icon: Trophy },
                            { id: 'about', label: 'About', icon: Info },
                            { id: 'members', label: 'People', icon: Users }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 py-2 px-4 text-[13px] font-bold rounded-full transition-all whitespace-nowrap relative group",
                                    activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                )}
                            >
                                <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="group-active-tab"
                                        className="absolute inset-0 bg-indigo-600 rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto relative z-10 w-full flex flex-col">
                <AnimatePresence mode="wait">
                    {/* CHAT TAB */}
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-[1000px] mx-auto flex-1 flex flex-col p-4 md:px-8"
                        >
                            {!isMember ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
                                    <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-600/10 mb-2 border border-slate-100">
                                        <Lock className="w-10 h-10 text-indigo-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Members Only Space</h3>
                                    <p className="text-slate-500 text-center max-w-sm mb-6 font-medium leading-relaxed">
                                        Join this community to unlock the live feed, see verified predictions, and engage with the club.
                                    </p>
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1 flex items-center gap-3 text-lg"
                                    >
                                        {joining ? 'Adding you...' : 'Join Community'} <ArrowRight className="w-5 h-5" />
                                    </button>

                                    {group.whatsapp && (
                                        <a
                                            href={group.whatsapp.startsWith('http') ? group.whatsapp : `https://wa.me/${group.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 text-emerald-600 font-black text-sm uppercase tracking-widest hover:text-emerald-500 transition-colors flex items-center gap-2"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Contact Admin on WhatsApp
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col no-scrollbar">
                                    {/* Luxe Welcome Indicator */}
                                    <div className="flex justify-center my-6">
                                        <div className="px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-full flex items-center gap-2 shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Live Group Feed</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6 pb-8">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-20 bg-white/40 border border-dashed border-slate-200 rounded-[32px]">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <MessageCircle className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 font-bold tracking-tight">No messages yet.</p>
                                                <p className="text-slate-400 text-sm mt-1">Be the first to share your thoughts!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, index) => {
                                                const isSelf = msg.user_id === currentUser?.id;
                                                const showHeader = index === 0 || messages[index - 1].user_id !== msg.user_id;

                                                return (
                                                    <div key={msg.id} className={cn("flex flex-col group", isSelf ? "items-end" : "items-start")}>
                                                        {showHeader && !isSelf && (
                                                            <div className="flex items-center gap-2 mb-2 ml-1">
                                                                <span className="text-[13px] font-bold text-slate-900">
                                                                    {msg.username}
                                                                </span>
                                                                <div className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-bold text-indigo-600 uppercase tracking-widest">
                                                                    LVL {Math.floor(msg.reputation / 10) + 1}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-[22px] shadow-sm relative transition-all duration-300",
                                                            isSelf
                                                                ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10"
                                                                : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none group-hover:border-slate-300"
                                                        )}>
                                                            <p className="text-[14px] md:text-[15px] leading-relaxed break-words font-medium">
                                                                {msg.content}
                                                            </p>
                                                            <div className={cn(
                                                                "text-[9px] font-bold mt-2 flex items-center justify-end gap-1.5",
                                                                isSelf ? "text-indigo-200/70" : "text-slate-400"
                                                            )}>
                                                                <span>{formatTime(msg.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} className="h-4" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <motion.div
                            key="about"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-[1000px] mx-auto p-4 md:px-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 md:p-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
                                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Community Profile</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">About {group.name}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                        {group.description || group.short_description || "No description provided for this group. This is an official Teer Club space."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Established</p>
                                                    <p className="font-bold text-slate-900">{format(new Date(group.created_at || new Date()), 'MMM yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                    {group.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access</p>
                                                    <p className="font-bold text-slate-900">{group.is_public ? 'Open Club' : 'Private Hub'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(group.email || group.whatsapp) && (
                                        <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl shadow-slate-900/10">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Official Contact</h4>
                                            <div className="space-y-3">
                                                {group.email && (
                                                    <div className="flex items-center gap-3 text-sm font-bold truncate">
                                                        <Mail className="w-4 h-4 text-indigo-400" /> {group.email}
                                                    </div>
                                                )}
                                                {group.whatsapp && (
                                                    <motion.a
                                                        href={group.whatsapp.startsWith('http') ? group.whatsapp : `https://wa.me/${group.whatsapp.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/20"
                                                    >
                                                        <MessageCircle className="w-5 h-5 fill-current" />
                                                        CONNECT ON WHATSAPP
                                                    </motion.a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-[1000px] mx-auto p-4 md:px-8"
                        >
                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden text-center p-12 relative min-h-[400px] flex flex-col items-center justify-center">
                                {userRole === 'MODERATOR' && (
                                    <button
                                        onClick={() => setShowTopUpModal(true)}
                                        className="absolute top-8 right-8 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all hover:bg-indigo-600 shadow-lg active:scale-95 flex items-center gap-2"
                                    >
                                        <Wallet className="w-4 h-4" /> Top Up User
                                    </button>
                                )}
                                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center mb-6 shadow-sm">
                                    <Shield className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">{group.memberCount.toLocaleString()} Members</h3>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                    We protect our community's privacy. Complete rosters are visible only to verified moderators and administrators.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* LEADERBOARD TAB */}
                    {activeTab === 'leaderboard' && (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-[1000px] mx-auto flex-1 p-4 md:px-8"
                        >
                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10">
                                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full mb-3">
                                            <Trophy className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Predictor Rankings</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Hall of Fame</h3>
                                        <p className="text-slate-500 font-medium mt-1">Top 10 most respected technical masters in the community.</p>
                                    </div>
                                </div>

                                {loadingLeaderboard ? (
                                    <div className="flex flex-col gap-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                                        ))}
                                    </div>
                                ) : leaderboard.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold">The ranking is being calculated...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {leaderboard.map((user, idx) => (
                                            <div key={user.id} className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border shrink-0",
                                                    idx === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300" :
                                                        idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-200" :
                                                            idx === 2 ? "bg-gradient-to-br from-orange-400 to-rose-500 text-white border-orange-200" :
                                                                "bg-white text-slate-400 border-slate-100"
                                                )}>
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                                                        <span className="font-bold text-slate-400 uppercase">{user.username.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">@{user.username}</h4>
                                                        {user.role === 'MODERATOR' && (
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Moderator</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <span className="text-xl font-bold text-slate-900 tracking-tight">
                                                            {user.reputation}
                                                        </span>
                                                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Reputation</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sticky Chat Input (Only on Chat Tab) */}
            {activeTab === 'chat' && isMember && (
                <div className="sticky bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-slate-200/60 px-4 py-4 shrink-0">
                    <div className="max-w-[1000px] mx-auto w-full">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    placeholder="Type a community message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full bg-slate-100 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-slate-900 rounded-[20px] pl-5 pr-12 py-3.5 text-[14px] font-bold placeholder:text-slate-400 transition-all outline-none"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm",
                                            !newMessage.trim() || sending
                                                ? "bg-slate-200 text-slate-400"
                                                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-600/20"
                                        )}
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Top Up Modal - Industry Grade Luxe */}
            <AnimatePresence>
                {showTopUpModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setShowTopUpModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
                        >
                            {/* Ambient Modal Backdrop */}
                            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.05),transparent_40%)] pointer-events-none" />

                            <div className="relative z-10 p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Wallet Top-Up</h2>
                                    <p className="text-slate-500 text-[13px] font-bold mt-0.5 uppercase tracking-wider text-indigo-600">Admin Utility</p>
                                </div>
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative z-10 p-6 md:p-8 overflow-y-auto no-scrollbar">
                                {!selectedUser ? (
                                    <div className="space-y-6">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by username..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[20px] pl-12 pr-4 py-4 font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            {searching ? (
                                                <div className="flex flex-col items-center py-10 gap-3">
                                                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Scanning Registry...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map(user => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => setSelectedUser(user)}
                                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 group transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="text-left min-w-0">
                                                                <p className="font-bold text-slate-900 truncate">@{user.username}</p>
                                                                <p className="text-[11px] text-slate-400 font-bold truncate uppercase tracking-tight">{user.role}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))
                                            ) : searchQuery.length >= 2 ? (
                                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                    <p className="text-slate-400 font-bold">No user found.</p>
                                                </div>
                                            ) : (
                                                <p className="text-center text-[12px] text-slate-400 font-bold py-6">Type to search the user database.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleTopUpSubmit} className="space-y-6">
                                        <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-20"><ShieldCheck className="w-16 h-16" /></div>
                                            <div className="relative z-10 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
                                                    {selectedUser.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-lg truncate leading-tight">@{selectedUser.username}</p>
                                                    <p className="text-[11px] text-indigo-200 font-bold truncate uppercase tracking-widest mt-0.5">Verified Recipient</p>
                                                </div>
                                                <button type="button" onClick={() => setSelectedUser(null)} className="h-9 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors">Change</button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transfer Amount (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={topUpAmount}
                                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-[24px] pl-12 pr-6 py-5 text-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={toppingUp || !topUpAmount}
                                            className="w-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-5 rounded-[24px] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                                        >
                                            {toppingUp ? (
                                                <div className="w-6 h-6 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                                            ) : (
                                                <>Confirm Deposit <Wallet className="w-5 h-5" /></>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
