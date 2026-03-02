'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { Search, Loader2, Download, Filter, Ticket as TicketIcon, TrendingUp, FilterX } from 'lucide-react';

interface Ticket {
    ticket_id: number;
    game_type: string;
    round: string;
    number: string;
    amount: number;
    caption: string;
    status: string;
    created_at: string;
    user_id: number;
    username: string;
}

interface HotNumber {
    number: string;
    total_amount: number;
    ticket_count: number;
}

interface Summary {
    totalRevenue: number;
    totalTickets: number;
    hotNumbers: HotNumber[];
}

export default function TicketsPage() {
    const { isAuthenticated } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<string>(() => {
        return new Date().toLocaleDateString('en-CA'); // Gets local YYYY-MM-DD
    });
    const [search, setSearch] = useState('');
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [date, isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Tickets
            const ticketsRes = await api.get(`/admin/tickets?date=${date}`);
            const ticketsData = ticketsRes.data;

            // Fetch Summary
            const summaryRes = await api.get(`/admin/tickets/summary?date=${date}`);
            const summaryData = summaryRes.data;

            if (ticketsData.success) {
                setTickets(ticketsData.tickets);
            }
            if (summaryData.success) {
                setSummary(summaryData.summary);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReceipt = async (ticket: Ticket) => {
        setDownloadingId(ticket.ticket_id);
        try {
            // Dynamic import of generating PDF to keep bundle small
            const { jsPDF } = await import('jspdf');

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [80, 150] // Receipt printer format
            });

            // Branded Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('TEER CLUB', 40, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Premium Predictions', 40, 20, { align: 'center' });
            doc.line(5, 25, 75, 25);

            // Ticket Date & ID
            doc.setFontSize(9);
            doc.text(`Date/Time: ${format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')}`, 5, 32);
            doc.text(`Ticket ID: #${ticket.ticket_id.toString().padStart(6, '0')}`, 5, 38);

            // User Info
            doc.setFont('helvetica', 'bold');
            doc.text('User Details:', 5, 48);
            doc.setFont('helvetica', 'normal');
            doc.text(`ID: ${ticket.user_id} | @${ticket.username}`, 5, 54);

            doc.line(5, 60, 75, 60);

            // Bet Details
            doc.setFont('helvetica', 'bold');
            doc.text('Bet Information:', 5, 68);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Game:`, 5, 76);
            doc.text(`${ticket.game_type}`, 75, 76, { align: 'right' });

            doc.text(`Round:`, 5, 82);
            doc.text(`${ticket.round}`, 75, 82, { align: 'right' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Selected Number:`, 5, 92);
            doc.text(`${ticket.number}`, 75, 92, { align: 'right' });

            doc.line(5, 98, 75, 98);

            // Amount
            doc.setFontSize(14);
            doc.text(`Amount:`, 5, 108);
            doc.text(`Rs. ${ticket.amount.toFixed(2)}`, 75, 108, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Official Teer Club Receipt', 40, 130, { align: 'center' });
            doc.text('Thank you for playing!', 40, 135, { align: 'center' });
            doc.text('Track your bets on teer.club', 40, 140, { align: 'center' });

            doc.save(`TeerClub_Ticket_${ticket.ticket_id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate receipt PDF. Try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.username.toLowerCase().includes(search.toLowerCase()) ||
        t.ticket_id.toString().includes(search) ||
        t.number.includes(search)
    );

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="w-full max-w-7xl px-8 py-10 flex flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <TicketIcon className="w-8 h-8 text-blue-600" />
                            {date ? 'Daily Tickets' : 'All Tickets'}
                        </h1>
                        <p className="text-slate-500 font-medium">Verify public bets and monitor {date ? 'daily' : 'all'} ticket sales.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        {date && (
                            <button
                                onClick={() => setDate('')}
                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold"
                            >
                                All Time
                            </button>
                        )}
                        {date !== new Date().toLocaleDateString('en-CA') && (
                            <button
                                onClick={() => setDate(new Date().toLocaleDateString('en-CA'))}
                                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                                title="Reset to Today"
                            >
                                <FilterX className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Analytics Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 relative">Total Revenue</h3>
                            <div className="text-4xl font-black text-slate-900 tracking-tight relative">
                                Rs. {summary?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-50" />
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 relative">Tickets Sold</h3>
                            <div className="text-4xl font-black text-slate-900 tracking-tight relative">
                                {summary?.totalTickets?.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>

                    {/* Hot Numbers */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col">
                        <h3 className="text-slate-900 text-base font-bold flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-red-500" />
                            Hot Numbers Today
                        </h3>
                        <div className="flex-1 overflow-y-auto max-h-[120px] pr-2 space-y-3 scrollbar-hide">
                            {summary?.hotNumbers && summary.hotNumbers.length > 0 ? (
                                summary.hotNumbers.slice(0, 5).map((hn, idx) => (
                                    <div key={hn.number} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                                            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center font-black text-red-600 shadow-sm">
                                                {hn.number}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-slate-900">Rs. {hn.total_amount.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-slate-500 tracking-wider mix-blend-multiply uppercase">{hn.ticket_count} tkts</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 text-center py-4 font-medium">No hot numbers yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ticket Ledger</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search ticket, user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Ticket ID</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">User</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Game & Round</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Number</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Amount</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                                            Loading tickets...
                                        </td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                                            {date ? 'No tickets found for this date.' : 'No tickets found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((t) => (
                                        <tr key={t.ticket_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">#{t.ticket_id.toString().padStart(6, '0')}</span>
                                                    <span className="text-xs text-slate-500">{format(new Date(t.created_at), 'HH:mm a')}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-slate-600">
                                                            {(t.username || 'Unknown').slice(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">@{t.username || 'Unknown'}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">ID: {t.user_id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 capitalize">{t.game_type}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">{t.round}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 font-black text-blue-600 shadow-sm">
                                                    {t.number}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-sm font-black text-slate-900">Rs. {t.amount.toFixed(2)}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => downloadReceipt(t)}
                                                    disabled={downloadingId === t.ticket_id}
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold text-xs rounded-xl transition-colors gap-2"
                                                >
                                                    {downloadingId === t.ticket_id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                    Receipt
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
        </div>
    );
}
