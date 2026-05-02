"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
    return (
        <div className={`rounded-xl border p-5 ${accent ? "bg-gray-900 text-white border-gray-800" : "bg-white border-gray-200"}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className={`text-3xl font-semibold ${accent ? "text-white" : "text-gray-900"}`}>{value}</h3>
                {accent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
        </div>
    );
}

export default function RealtimeDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ["realtime-analytics"],
        queryFn: () => api.analytics.getRealtime(),
        refetchInterval: 5000,
    });

    const stats = data?.data;
    const activeUsers = stats?.activeUsers || 0;
    const topPages = stats?.topPages || [];
    const topReferrers = stats?.topReferrers || [];
    const sessions = stats?.sessions || [];
    const devices = stats?.devices || {};
    const browsers = stats?.browsers || {};

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl pb-20">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Real-Time Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Live website activity — updates every 5 seconds.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard label="Active Users" value={activeUsers} accent />
                <KpiCard label="Top Page" value={topPages[0]?.page || "—"} />
                <KpiCard label="Top Referrer" value={topReferrers[0]?.referrer || "direct"} />
                <KpiCard label="Sessions" value={sessions.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Top Pages */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Active Pages</h3>
                    {topPages.length === 0 ? (
                        <p className="text-sm text-gray-400">No active pages right now.</p>
                    ) : (
                        <div className="space-y-2">
                            {topPages.map((p: any, i: number) => (
                                <div key={p.page} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-400 w-5">{i + 1}</span>
                                        <span className="text-sm text-gray-700 truncate max-w-[300px]">{p.page}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 bg-gray-900 rounded-full" style={{ width: `${Math.max(16, (p.count / (topPages[0]?.count || 1)) * 80)}px` }} />
                                        <span className="text-xs font-medium text-gray-600 w-6 text-right">{p.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Referrers + Devices */}
                <div className="space-y-6">
                    {/* Referrers */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Referrers</h3>
                        {topReferrers.length === 0 ? (
                            <p className="text-sm text-gray-400">No data yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {topReferrers.map((r: any) => (
                                    <div key={r.referrer} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{r.referrer}</span>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Device + Browser */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Devices & Browsers</h3>
                        <div className="space-y-2 text-sm">
                            {Object.entries(devices).map(([device, count]) => (
                                <div key={device} className="flex items-center justify-between">
                                    <span className="text-gray-700">{device}</span>
                                    <span className="text-xs font-medium text-gray-500">{count as number}</span>
                                </div>
                            ))}
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                {Object.entries(browsers).map(([browser, count]) => (
                                    <div key={browser} className="flex items-center justify-between">
                                        <span className="text-gray-700">{browser}</span>
                                        <span className="text-xs font-medium text-gray-500">{count as number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Sessions Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Live Sessions</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Updating live
                    </div>
                </div>
                {sessions.length === 0 ? (
                    <div className="p-12 text-center text-sm text-gray-400">No active sessions right now.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                                    <th className="px-5 py-3 font-medium">Session</th>
                                    <th className="px-5 py-3 font-medium">Page</th>
                                    <th className="px-5 py-3 font-medium">Referrer</th>
                                    <th className="px-5 py-3 font-medium">Device</th>
                                    <th className="px-5 py-3 font-medium">Browser</th>
                                    <th className="px-5 py-3 font-medium">OS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sessions.map((s: any, i: number) => (
                                    <tr key={`${s.sessionId}-${i}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{s.sessionId}…</td>
                                        <td className="px-5 py-3 text-gray-700 max-w-[200px] truncate">{s.page}</td>
                                        <td className="px-5 py-3 text-gray-500">{s.referrer}</td>
                                        <td className="px-5 py-3 text-gray-600">{s.deviceType}</td>
                                        <td className="px-5 py-3 text-gray-600">{s.browser}</td>
                                        <td className="px-5 py-3 text-gray-600">{s.os}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
