'use client';

import { useState, useEffect } from 'react';
import { Rocket, ShieldCheck, AlertCircle, Link as LinkIcon, Activity, Search, BarChart3, Users as UsersIcon, MousePointerClick } from 'lucide-react';
import api from '@/lib/api';

export default function SEOPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

    const [seoData, setSeoData] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        api.get('/admin/analytics/seo-dashboard')
            .then(res => {
                if (res.data.success) setSeoData(res.data.data);
            })
            .catch(err => console.error("Failed to load SEO stats", err))
            .finally(() => setLoadingStats(false));
    }, []);

    const handleIndexRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url) return;

        // Basic validation
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            setResult({ error: 'URL must start with http:// or https://' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await api.post('/admin/seo/index-url', {
                url,
                type: 'URL_UPDATED'
            });

            if (res.data.success) {
                setResult({
                    success: true,
                    message: res.data.message || 'Successfully sent to Google Indexing API. URL will be crawled shortly.'
                });
                setUrl(''); // Clear on success
            } else {
                setResult({
                    error: res.data.message || 'Failed to submit URL'
                });
            }
        } catch (error: any) {
            console.error('Indexing error:', error);
            setResult({
                error: error.response?.data?.message || error.message || 'An error occurred while contacting the server.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">SEO Command Center</h1>
                    <p className="text-slate-500 mt-1">Manage indexing, rich snippets, and metadata to drive 1M+ organic users.</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 flex items-center gap-2 shadow-sm">
                    <Rocket className="w-4 h-4" />
                    Growth Engine Active
                </div>
            </div>

            {/* Google Integrations Live Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <UsersIcon className="w-8 h-8 text-blue-100" />
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">GA4 Live</span>
                    </div>
                    {loadingStats ? (
                        <div className="animate-pulse h-10 bg-white/20 rounded w-1/2"></div>
                    ) : (
                        <div>
                            <div className="text-4xl font-black tracking-tight">{seoData?.ga4?.activeUsers || 0}</div>
                            <div className="text-blue-100 text-sm font-medium mt-1">Real-Time Active Users</div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <MousePointerClick className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">30 Days</span>
                    </div>
                    {loadingStats ? (
                        <div className="animate-pulse h-8 bg-slate-100 rounded w-3/4"></div>
                    ) : (
                        <div>
                            <div className="text-3xl font-black text-slate-900">{seoData?.gsc?.totals?.clicks?.toLocaleString() || 0}</div>
                            <div className="text-slate-500 text-sm font-semibold mt-1">Total Search Clicks</div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-violet-500" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">30 Days</span>
                    </div>
                    {loadingStats ? (
                        <div className="animate-pulse h-8 bg-slate-100 rounded w-3/4"></div>
                    ) : (
                        <div>
                            <div className="text-3xl font-black text-slate-900">{seoData?.gsc?.totals?.impressions?.toLocaleString() || 0}</div>
                            <div className="text-slate-500 text-sm font-semibold mt-1">Search Impressions</div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg</span>
                    </div>
                    {loadingStats ? (
                        <div className="animate-pulse h-8 bg-slate-800 rounded w-1/2"></div>
                    ) : (
                        <div>
                            <div className="text-3xl font-black">{seoData?.gsc?.totals?.avgPosition || '0.0'}</div>
                            <div className="text-slate-400 text-sm font-medium mt-1">Google Rank Position</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Instant Indexer Tool */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                                <Search className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Google Instant Indexer</h2>
                                <p className="text-sm text-slate-500">Force Google to crawl or re-crawl a specific URL immediately.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleIndexRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Target URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-shadow"
                                        placeholder="https://teer.club/shillong-teer-result-today"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    Enter the absolute URL (e.g., <code className="bg-slate-100 px-1 rounded">https://teer.club/...</code>). This pings the Google Indexing API.
                                </p>
                            </div>

                            {result && (
                                <div className={`p-4 rounded-xl flex items-start gap-3 border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                    {result.success ? <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                                    <div className="text-sm font-medium">
                                        {result.success ? result.message : result.error}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !url}
                                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Activity className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Rocket className="w-5 h-5" />
                                    )}
                                    {loading ? 'Pinging Google...' : 'Force Index URL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Automation Status Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Automation Status</h2>
                        <p className="text-sm text-slate-500">Background SEO Tasks</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 relative">
                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="font-semibold text-slate-700 text-sm">Auto-Result Indexing</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">Active</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            The backend automatically pings Google the exact second a live result is scraped and saved to the database.
                        </p>
                        <hr className="border-slate-100" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="font-semibold text-slate-700 text-sm">Post Indexing (TBD)</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Automatic indexing for high-quality user posts is pending implementation in the post-approval pipeline.
                        </p>
                    </div>
                </div>

                {/* Top Google Queries */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Top Search Queries</h2>
                            <p className="text-sm text-slate-500">Keywords driving traffic from Google Search (Last 30 Days)</p>
                        </div>
                        <Search className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-500">Query</th>
                                    <th className="px-6 py-4 font-bold text-slate-500">Clicks</th>
                                    <th className="px-6 py-4 font-bold text-slate-500">Impressions</th>
                                    <th className="px-6 py-4 font-bold text-slate-500">Avg. Position</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingStats ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-400">Loading queries...</td></tr>
                                ) : !seoData?.gsc?.topQueries?.length ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-400 font-medium">No Search Console data available yet. Ensure service-account.json is valid and site is verified.</td></tr>
                                ) : (
                                    seoData.gsc.topQueries.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{row.keys.join(' ')}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">{row.clicks}</td>
                                            <td className="px-6 py-4 font-medium text-slate-500">{row.impressions}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.position < 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {row.position.toFixed(1)}
                                                    </span>
                                                </div>
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
