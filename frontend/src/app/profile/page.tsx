'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Settings,
    LogOut,
    Calendar,
    Trophy,
    Wallet,
    Edit3,
    Camera,
    Grid,
    Target,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    Clock,
    Plus,
    Landmark,
    AlertCircle,
    ArrowUpRight,
    Users,
    Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeUpItem } from '@/lib/motion';

interface UserData {
    id: number;
    username: string;
    email: string;
    profile_picture: string | null;
    bio: string | null;
    reputation: number;
    wallet_balance: number;
    created_at: string;
}

interface UserPost {
    id: number;
    game_type: string;
    round: string;
    number: string;
    amount: string;
    caption: string;
    created_at: string;
}

interface BankAccount {
    id: number;
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    is_primary: boolean;
}

interface WithdrawalRequest {
    id: number;
    amount: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    admin_note: string | null;
    bank_name: string | null;
    account_number: string | null;
    created_at: string;
    updated_at: string;
}

const WITHDRAWAL_THRESHOLD = 2500;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

// Constructs full URL for uploaded profile pictures
const getAvatarUrl = (path: string | null): string => {
    if (!path) return '/default-avatar.png';
    // Already absolute URL
    if (path.startsWith('http')) return path;
    // /uploads/* paths are served by backend, need to be proxied or prefixed
    if (path.startsWith('/uploads/')) {
        // In Dev: Next.js rewrites /uploads/ to backend via next.config.ts
        // This works client-side and server-side
        return path;
    }
    return path;
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [posts, setPosts] = useState<UserPost[]>([]);
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [connections, setConnections] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'finance' | 'settings' | 'connections' | 'library'>('posts');
    const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [savedNumbers, setSavedNumbers] = useState<any[]>([]);

    // Edit form state
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Bank form state
    const [bankForm, setBankForm] = useState({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });

    const [withdrawAmount, setWithdrawAmount] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Check auth first to avoid noisy parallel 401s
            const userRes = await api.get('/auth/me');

            if (userRes.data.success) {
                setUser(userRes.data.user);
                setEditBio(userRes.data.user.bio || '');
                setEditAvatar(userRes.data.user.profile_picture || '');

                // Fetch other data — each is independent; failures are silent
                const postsRes = await api.get('/user/posts').catch(() => ({ data: { success: false, data: [] } }));
                const bankRes = await api.get('/finance/bank-accounts').catch(() => ({ data: { success: false, data: [] } }));
                const withdrawalRes = await api.get('/finance/withdrawals').catch(() => ({ data: { success: false, data: [] } }));
                const connRes = await api.get('/referral/connections').catch(() => ({ data: { success: false, data: null } }));

                if (postsRes.data.success) setPosts(postsRes.data.data);
                if (bankRes.data.success) setBanks(bankRes.data.data);
                if (withdrawalRes.data.success) setWithdrawals(withdrawalRes.data.data);
                if (connRes.data.success) setConnections(connRes.data.data);

                // Fetch Saved Common Numbers
                const savedRes = await api.get('/common-numbers/library').catch(() => ({ data: { success: false, data: [] } }));
                if (savedRes.data.success) setSavedNumbers(savedRes.data.data);
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                // Quietly redirect without error logging
                router.push('/login');
            } else {
                console.error("Failed to load profile", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_picture', file);

        setUploading(true);
        try {
            const res = await api.post('/user/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                // Update user state with new image URL
                if (user) {
                    const imageUrl = res.data.imageUrl;
                    setUser({ ...user, profile_picture: imageUrl });
                    setEditAvatar(imageUrl);
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.put('/user/profile', {
                bio: editBio,
                profile_picture: editAvatar
            });
            if (res.data.success) {
                setUser(res.data.user);
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.post('/finance/bank-accounts', bankForm);
            if (res.data.success) {
                setBanks([res.data.data, ...banks]);
                setIsAddingBank(false);
                setBankForm({ account_holder_name: '', bank_name: '', account_number: '', ifsc_code: '' });
            }
        } catch (err) {
            console.error("Add bank failed", err);
        } finally {
            setUpdating(false);
        }
    };

    const setPrimaryBank = async (id: number) => {
        try {
            const res = await api.put(`/finance/bank-accounts/${id}/primary`);
            if (res.data.success) {
                setBanks(banks.map(b => ({ ...b, is_primary: b.id === id })));
            }
        } catch (err) {
            console.error("Set primary failed", err);
        }
    };

    const handleWithdraw = async () => {
        const primaryBank = banks.find(b => b.is_primary);
        setWithdrawMsg(null);
        if (!primaryBank) {
            setWithdrawMsg({ type: 'error', text: 'Please set a primary bank account first.' });
            return;
        }
        if (!withdrawAmount || parseFloat(withdrawAmount) < WITHDRAWAL_THRESHOLD) {
            setWithdrawMsg({ type: 'error', text: `Minimum withdrawal is ₹${WITHDRAWAL_THRESHOLD.toLocaleString()}` });
            return;
        }

        setUpdating(true);
        try {
            const res = await api.post('/finance/withdraw', {
                amount: parseFloat(withdrawAmount),
                bank_account_id: primaryBank.id
            });
            if (res.data.success) {
                setWithdrawMsg({ type: 'success', text: res.data.message || 'Withdrawal request submitted successfully!' });
                setWithdrawAmount('');
                // Refresh both balance and withdrawal history
                const [userRes, wrRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/finance/withdrawals')
                ]);
                if (userRes.data.success) setUser(userRes.data.user);
                if (wrRes.data.success) setWithdrawals(wrRes.data.data);
            }
        } catch (err: any) {
            setWithdrawMsg({ type: 'error', text: err.response?.data?.error || 'Withdrawal request failed. Please try again.' });
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            router.push('/');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 relative font-sans antialiased">
            {/* Immersive Header Top Blur */}
            <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-0" />

            <div className="relative z-10 px-4 md:px-6 max-w-[600px] mx-auto pt-8">

                {/* Simple Header */}
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 active:scale-95 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Club Identity</span>
                    </div>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile Identity Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-10 -mt-10" />

                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-slate-50 border-2 border-white shadow-xl ring-1 ring-slate-100 flex items-center justify-center">
                                <img
                                    src={getAvatarUrl(user.profile_picture)}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                />
                            </div>
                            <label
                                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {uploading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleProfilePictureUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <h2 className="text-2xl font-bold font-sans text-slate-900 mb-1">{user.username}</h2>
                        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-4">Resident Expert</p>

                        <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm mb-6">
                            {user.bio || "No professional bio set yet. Share your Teer philosophy with the club."}
                        </p>

                        <div className="flex items-center gap-8 w-full pt-6 border-t border-slate-50">
                            <div className="flex-1 text-center">
                                <p className="text-xl font-bold text-slate-900">{posts.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Predictions</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100" />
                            <div className="flex-1 text-center">
                                <p className="text-xl font-bold text-slate-900">{user.reputation}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100" />
                            <div className="flex-1 text-center">
                                <p className="text-xl font-bold text-emerald-600">₹{parseFloat(user.wallet_balance.toString()).toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center gap-2 mb-8 bg-white/50 p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                    {[
                        { id: 'posts', label: 'My Activity', icon: Grid },
                        { id: 'library', label: 'Saved Library', icon: Bookmark },
                        { id: 'connections', label: 'Connections', icon: Users },
                        { id: 'finance', label: 'Wallet & Bank', icon: Wallet },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-400" : "text-slate-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'posts' && (
                        <motion.div
                            key="posts"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {posts.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                                    <Edit3 className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold text-sm">No predictions posted yet.</p>
                                    <p className="text-xs text-slate-300 mt-1">Your strategy starts here.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        variants={fadeUpItem}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-indigo-200 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                    <Target className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-900">{post.game_type}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.round}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Number</p>
                                                <span className="text-xl font-bold text-slate-900">{post.number}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/80 rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                            <span className="text-[11px] font-bold text-indigo-600">Stake: ₹{post.amount}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'library' && (
                        <motion.div
                            key="library"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {savedNumbers.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                                    <Bookmark className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold text-sm">Your library is empty.</p>
                                    <p className="text-xs text-slate-300 mt-1">Save target cards to track your guesses.</p>
                                </div>
                            ) : (
                                savedNumbers.map((record) => (
                                    <motion.div
                                        key={record.id}
                                        variants={fadeUpItem}
                                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 hover:border-indigo-200 transition-all group/card"
                                    >
                                        <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                                            <div className="flex items-center gap-3">
                                                <Target className="w-5 h-5 text-indigo-500" />
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{record.game} Target</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Generated Date</p>
                                                <span className="text-xs font-bold text-slate-500">
                                                    {new Date(record.target_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Target Digits */}
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Common Numbers</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {record.direct_numbers.split(',').map((num: string, i: number) => (
                                                        <div key={i} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-slate-200">
                                                            {num.trim()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* House & Ending */}
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">House & Ending</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {[...record.house.split(','), ...record.ending.split(',')].map((num: string, i: number) => (
                                                        <div key={i} className={cn(
                                                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5",
                                                            i < record.house.split(',').length ? "bg-rose-600 text-white" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                                        )}>
                                                            <span className="font-bold text-lg leading-none">{num.trim()}</span>
                                                            <span className="text-[7px] font-black uppercase">{i < record.house.split(',').length ? 'H' : 'E'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'connections' && (
                        <motion.div
                            key="connections"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Network Growth</h3>

                                <div className="space-y-6">
                                    {/* Levels Summary */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {[1, 2, 3, 4, 5].map((lvl) => (
                                            <div key={lvl} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">LVL {lvl}</p>
                                                <p className="text-sm font-bold text-slate-900">{connections?.[`level${lvl}`]?.length || 0}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Detailed List */}
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4, 5].map((lvl) => {
                                            const levelUsers = connections?.[`level${lvl}`] || [];
                                            if (levelUsers.length === 0) return null;

                                            return (
                                                <div key={lvl} className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Type: Level {lvl}</h4>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        {levelUsers.map((conn: any) => (
                                                            <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
                                                                        {conn.profilePicture ? (
                                                                            <img
                                                                                src={conn.profilePicture.startsWith('http') ? conn.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${conn.profilePicture}`}
                                                                                alt={conn.username}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <User className="w-4 h-4 text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{conn.username}</p>
                                                                        <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(conn.connectedAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[9px] font-bold text-slate-400 uppercase">
                                                                    Active
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {(!connections || Object.values(connections).every((arr: any) => arr.length === 0)) && (
                                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                                    No connections found.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Referral Info */}
                            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Club Code</p>
                                <p className="text-2xl font-black mb-4 truncate">teer.club/invite/{user?.username}</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`https://teer.club/invite/${user?.username}`)}
                                    className="w-full bg-white text-slate-900 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Copy Invite Link
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div
                            key="finance"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Wallet Summary */}
                            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Available Balance</p>
                                    <h3 className="text-3xl font-bold mb-6">₹{parseFloat(user.wallet_balance.toString()).toLocaleString()}</h3>

                                    {withdrawMsg && (
                                        <div className={`rounded-xl p-3 mb-4 text-xs font-bold ${withdrawMsg.type === 'success'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                            }`}>
                                            {withdrawMsg.text}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                            <button
                                                onClick={handleWithdraw}
                                                disabled={updating || !withdrawAmount}
                                                className="bg-white text-slate-900 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {updating ? <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                                                Withdraw
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Min ₹{WITHDRAWAL_THRESHOLD.toLocaleString()} · Needs primary bank · Admin approved within 24h
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Accounts */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Bank Details</h4>
                                    <button
                                        onClick={() => setIsAddingBank(true)}
                                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-700"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add New
                                    </button>
                                </div>

                                {banks.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-100">
                                        <Landmark className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No banks linked</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {banks.map(bank => (
                                            <div
                                                key={bank.id}
                                                className={cn(
                                                    "bg-white rounded-xl border p-4 transition-all",
                                                    bank.is_primary ? "border-indigo-600 ring-1 ring-indigo-600/10" : "border-slate-100"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                            <Landmark className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{bank.bank_name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bank.account_holder_name}</p>
                                                        </div>
                                                    </div>
                                                    {bank.is_primary ? (
                                                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-bold uppercase rounded">Primary</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setPrimaryBank(bank.id)}
                                                            className="text-[8px] font-bold text-slate-400 uppercase hover:text-indigo-600"
                                                        >
                                                            Set Primary
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="pl-13 flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-50 mt-2">
                                                    <span>**** {bank.account_number.slice(-4)}</span>
                                                    <span className="text-[9px] uppercase tracking-tighter">{bank.ifsc_code}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Withdrawal Request History */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Withdrawal History</h4>
                                {withdrawals.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No withdrawal requests yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {withdrawals.map(wr => (
                                            <div key={wr.id} className="bg-white rounded-xl border border-slate-100 p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="text-base font-black text-slate-900">₹{Number(wr.amount).toLocaleString('en-IN')}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                            {wr.bank_name ? `→ ${wr.bank_name} **** ${wr.account_number?.slice(-4)}` : 'Bank account not linked'}
                                                        </p>
                                                    </div>
                                                    <span className={cn(
                                                        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase',
                                                        wr.status === 'PENDING' && 'bg-amber-50 text-amber-700 border border-amber-100',
                                                        wr.status === 'APPROVED' && 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                                                        wr.status === 'REJECTED' && 'bg-red-50 text-red-700 border border-red-100',
                                                    )}>
                                                        {wr.status === 'PENDING' && '⏳ '}
                                                        {wr.status === 'APPROVED' && '✅ '}
                                                        {wr.status === 'REJECTED' && '❌ '}
                                                        {wr.status}
                                                    </span>
                                                </div>
                                                {wr.admin_note && (
                                                    <p className="text-[10px] text-slate-400 italic mt-1">Note: {wr.admin_note}</p>
                                                )}
                                                <p className="text-[10px] text-slate-300 font-bold mt-2">
                                                    {new Date(wr.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Security</p>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-900">Email Address</p>
                                                <p className="text-[11px] font-bold text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                                <LogOut className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-rose-600">Power Off</p>
                                                <p className="text-[11px] font-bold text-rose-300 uppercase tracking-widest">Secure Logout</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-rose-200 group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modals */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditing(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[32px] w-full max-w-[450px] overflow-hidden shadow-2xl relative z-10"
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-bold font-sans text-slate-900">Edit Identity</h3>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Avatar Display URL</label>
                                            <input
                                                type="text"
                                                value={editAvatar}
                                                onChange={(e) => setEditAvatar(e.target.value)}
                                                placeholder="Paste an image URL..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Professional Bio</label>
                                            <textarea
                                                rows={4}
                                                value={editBio}
                                                onChange={(e) => setEditBio(e.target.value)}
                                                placeholder="What is your winning philosophy?"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {updating ? "Processing..." : "Sync Changes"}
                                            {!updating && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {isAddingBank && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAddingBank(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[32px] w-full max-w-[450px] overflow-hidden shadow-2xl relative z-10"
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold font-sans text-slate-900">Add Bank Account</h3>
                                        <button
                                            onClick={() => setIsAddingBank(false)}
                                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddBank} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Account Holder Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={bankForm.account_holder_name}
                                                onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Bank Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={bankForm.bank_name}
                                                onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">A/C Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankForm.account_number}
                                                    onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">IFSC Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankForm.ifsc_code}
                                                    onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                                        >
                                            {updating ? "Saving..." : "Save Bank Account"}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
