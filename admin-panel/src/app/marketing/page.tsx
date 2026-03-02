'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DummyWinner {
    id: number;
    name: string;
    game: string;
    round: number;
    predicted_number: string;
    bet_amount: number;
    reward_amount: number;
    target_date: string;
    created_at: string;
}

export default function MarketingPage() {
    const [winners, setWinners] = useState<DummyWinner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingCommon, setIsGeneratingCommon] = useState(false);

    // Form state for manual addition
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        game: 'Shillong',
        round: 1,
        predicted_number: '',
        bet_amount: '',
        reward_amount: '',
        target_date: new Date().toISOString().split('T')[0]
    });

    const fetchWinners = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/marketing/admin/dummy-winners');
            if (res.data.error) throw new Error(res.data.error);
            setWinners(res.data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch winners');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWinners();
    }, []);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            const res = await api.post('/marketing/admin/dummy-winners/generate', { target_date: new Date().toISOString().split('T')[0] });
            const data = res.data;

            if (data.error) throw new Error(data.error);

            toast.success(data.message || 'Successfully generated dummy winners!');
            fetchWinners();
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate dummy winners');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCommon = async () => {
        try {
            setIsGeneratingCommon(true);
            const res = await api.post('/common-numbers/generate');
            if (res.data.success) {
                toast.success('Successfully generated AI Target Numbers and notified users!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate common numbers');
        } finally {
            setIsGeneratingCommon(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this dummy winner?')) return;

        try {
            const res = await api.delete(`/marketing/admin/dummy-winners/${id}`);
            const data = res.data;
            if (data.error) throw new Error(data.error);

            toast.success('Winner deleted successfully');
            setWinners(winners.filter(w => w.id !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete winner');
        }
    };

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                round: Number(formData.round),
                bet_amount: Number(formData.bet_amount),
                reward_amount: Number(formData.reward_amount)
            };

            const res = await api.post('/marketing/admin/dummy-winners', payload);
            const data = res.data;

            if (data.error) throw new Error(data.error);

            toast.success('Dummy winner added successfully');
            setIsAdding(false);
            setFormData({
                name: '',
                game: 'Shillong',
                round: 1,
                predicted_number: '',
                bet_amount: '',
                reward_amount: '',
                target_date: new Date().toISOString().split('T')[0]
            });
            fetchWinners();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add manual winner');
        }
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Marketing & Promotions</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Manage dummy winners and promotional content for the homepage.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Manual
                    </button>
                    <button
                        onClick={handleGenerateCommon}
                        disabled={isGeneratingCommon}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Zap className={`w-4 h-4 ${isGeneratingCommon ? 'animate-spin' : ''}`} />
                        {isGeneratingCommon ? 'Generating AI Targets...' : 'Generate AI Target Numbers'}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Generating...' : 'Auto-Generate Daily Winners'}
                    </button>
                </div>
            </div>

            {/* Manual Add Form */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Add Custom Winner</h2>
                    <form onSubmit={handleAddManual} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Game</label>
                            <select value={formData.game} onChange={e => setFormData({ ...formData, game: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                <option>Shillong</option>
                                <option>Khanapara</option>
                                <option>Juwai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Round</label>
                            <select value={formData.round} onChange={e => setFormData({ ...formData, round: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                <option value={1}>Round 1</option>
                                <option value={2}>Round 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prediction</label>
                            <input required type="text" value={formData.predicted_number} onChange={e => setFormData({ ...formData, predicted_number: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. 45" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bet Amount (₹)</label>
                            <input required type="number" value={formData.bet_amount} onChange={e => setFormData({ ...formData, bet_amount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reward Amount (₹)</label>
                            <input required type="number" value={formData.reward_amount} onChange={e => setFormData({ ...formData, reward_amount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="4000" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Date</label>
                            <input required type="date" value={formData.target_date} onChange={e => setFormData({ ...formData, target_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                Save Winner
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">These dummy winners will be displayed in the "Daily Prediction Winners" section on the frontend homepage. Generating new ones based on today's actual results will help build trust and urgency for users.</p>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Player Name</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Game</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Prediction</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Bet</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Reward</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">Loading winners...</td>
                                </tr>
                            ) : winners.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">No dummy winners found. Click auto-generate to create some.</td>
                                </tr>
                            ) : (
                                winners.map(winner => (
                                    <tr key={winner.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                                            {new Date(winner.target_date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-slate-900">{winner.name}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-700">{winner.game}</span>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">R{winner.round}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-black text-sm border border-indigo-100">
                                                {winner.predicted_number}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="font-bold text-slate-600">₹{winner.bet_amount}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">₹{Number(winner.reward_amount).toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleDelete(winner.id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
