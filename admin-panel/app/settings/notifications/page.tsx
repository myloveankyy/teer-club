"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";

type Tab = "overview" | "send" | "subscribers" | "campaigns" | "config";

function StatusBadge({ status }: { status: string }) {
    const isActive = status === "active";
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

function DeliveryBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        delivered: "bg-emerald-50 text-emerald-700",
        failed: "bg-red-50 text-red-600",
        sent: "bg-blue-50 text-blue-600",
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-500"}`}>
            {status}
        </span>
    );
}

function formatDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-1">{value}</h3>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function NotificationSettingsPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [formData, setFormData] = useState({ a2hsEnabled: true, pushEnabled: false });
    const [pushMessage, setPushMessage] = useState({ title: "", body: "", url: "" });
    const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["notificationSettings"],
        queryFn: () => api.settings.notifications.get(),
    });

    const { data: subData } = useQuery({
        queryKey: ["notificationSubscribers"],
        queryFn: () => api.settings.notifications.getSubscribers(),
        refetchInterval: 15000,
    });

    const { data: campaignData } = useQuery({
        queryKey: ["notificationCampaigns"],
        queryFn: () => api.settings.notifications.getCampaigns(),
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (settingsData?.data) {
            setFormData({
                a2hsEnabled: settingsData?.data?.a2hsEnabled ?? true,
                pushEnabled: settingsData?.data?.pushEnabled ?? false,
            });
        }
    }, [settingsData]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => api.settings.notifications.update(data),
        onSuccess: () => {
            showToast("Configuration saved", "success");
            queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
        },
        onError: (err: any) => showToast(err.message || "Failed to save", "error"),
    });

    const sendMutation = useMutation({
        mutationFn: (data: typeof pushMessage) => api.settings.notifications.sendPush(data),
        onSuccess: (res: any) => {
            const d = res?.data;
            showToast(`Notification sent — ${d?.deliveredCount ?? 0} delivered, ${d?.failedCount ?? 0} failed`, "success");
            setPushMessage({ title: "", body: "", url: "" });
            queryClient.invalidateQueries({ queryKey: ["notificationCampaigns"] });
        },
        onError: (err: any) => showToast(err.message || "Send failed", "error"),
    });

    const handleSave = (e: React.FormEvent) => { e.preventDefault(); updateMutation.mutate(formData); };
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.pushEnabled) { showToast("Enable push notifications first in Configuration", "error"); return; }
        sendMutation.mutate(pushMessage);
    };

    const subscribers = subData?.data?.subscribers || [];
    const campaigns = campaignData?.data?.campaigns || [];
    const totalActive = subData?.data?.totalActive || 0;
    const totalCampaigns = campaigns.length;

    const avgDeliveryRate = totalCampaigns > 0
        ? (campaigns.reduce((a: number, c: any) => a + (c.audienceSize > 0 ? (c.deliveredCount / c.audienceSize) * 100 : 0), 0) / totalCampaigns).toFixed(1)
        : "0.0";
    const avgCTR = totalCampaigns > 0
        ? (campaigns.reduce((a: number, c: any) => a + (c.deliveredCount > 0 ? (c.clickCount / c.deliveredCount) * 100 : 0), 0) / totalCampaigns).toFixed(1)
        : "0.0";

    const tabs: { key: Tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "send", label: "Send Notification" },
        { key: "subscribers", label: "Subscribers" },
        { key: "campaigns", label: "Campaign Logs" },
        { key: "config", label: "Configuration" },
    ];

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl pb-20">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">Manage push notifications, subscribers, and delivery analytics.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? "border-gray-900 text-gray-900"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard label="Active Subscribers" value={totalActive} sub={`${subData?.data?.total || 0} total`} />
                        <KpiCard label="Campaigns Sent" value={totalCampaigns} />
                        <KpiCard label="Avg Delivery Rate" value={`${avgDeliveryRate}%`} />
                        <KpiCard label="Avg CTR" value={`${avgCTR}%`} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">System Status</h3>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${formData.pushEnabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                                <span className="text-gray-600">Push Notifications: <strong>{formData.pushEnabled ? "Enabled" : "Disabled"}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${formData.a2hsEnabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                                <span className="text-gray-600">A2HS Prompt: <strong>{formData.a2hsEnabled ? "Enabled" : "Disabled"}</strong></span>
                            </div>
                        </div>
                    </div>
                    {/* Recent Campaigns */}
                    {campaigns.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Campaigns</h3>
                            <div className="space-y-3">
                                {campaigns.slice(0, 5).map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{c.title}</p>
                                            <p className="text-xs text-gray-400">{formatDate(c.sentAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>{c.deliveredCount}/{c.audienceSize} delivered</span>
                                            <span>{c.clickCount} clicks</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "send" && (
                <div className="max-w-xl">
                    <form onSubmit={handleSend} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                        <h2 className="text-sm font-semibold text-gray-900">Compose Notification</h2>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                            <input type="text" required value={pushMessage.title} onChange={(e) => setPushMessage({ ...pushMessage, title: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition" placeholder="e.g. Shillong Teer Results Out!" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Body</label>
                            <textarea required rows={3} value={pushMessage.body} onChange={(e) => setPushMessage({ ...pushMessage, body: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none" placeholder="Today's FR and SR results are now live..." />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL (optional)</label>
                            <input type="url" value={pushMessage.url} onChange={(e) => setPushMessage({ ...pushMessage, url: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition" placeholder="https://teer.club/live" />
                        </div>

                        {/* Preview */}
                        {pushMessage.title && (
                            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                <p className="text-xs text-gray-400 mb-2 font-medium">Preview</p>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">TC</div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{pushMessage.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{pushMessage.body || "..."}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={sendMutation.isPending}
                            className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition">
                            {sendMutation.isPending ? "Sending..." : `Send to ${totalActive} subscriber${totalActive !== 1 ? "s" : ""}`}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === "subscribers" && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">All Subscribers</h3>
                        <p className="text-xs text-gray-400">{totalActive} active · {subData?.data?.totalInactive || 0} inactive</p>
                    </div>
                    {subscribers.length === 0 ? (
                        <div className="p-12 text-center text-sm text-gray-400">No subscribers yet. Users will appear here after allowing notifications.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                                        <th className="px-5 py-3 font-medium">ID</th>
                                        <th className="px-5 py-3 font-medium">Device</th>
                                        <th className="px-5 py-3 font-medium">Browser</th>
                                        <th className="px-5 py-3 font-medium">OS</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Subscribed</th>
                                        <th className="px-5 py-3 font-medium">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {subscribers.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3 font-mono text-xs text-gray-500">{s.id.slice(0, 8)}…</td>
                                            <td className="px-5 py-3 text-gray-700">{s.deviceType || "—"}</td>
                                            <td className="px-5 py-3 text-gray-700">{s.browser || "—"}</td>
                                            <td className="px-5 py-3 text-gray-700">{s.os || "—"}</td>
                                            <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                                            <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                                            <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(s.lastActive)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "campaigns" && <CampaignLogs campaigns={campaigns} expandedCampaign={expandedCampaign} setExpandedCampaign={setExpandedCampaign} />}

            {activeTab === "config" && (
                <form onSubmit={handleSave} className="max-w-xl space-y-5">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                        <h2 className="text-sm font-semibold text-gray-900">Push Configuration</h2>
                        <ToggleRow label="Web Push Notifications" description="Allow users to subscribe to push notifications and enable broadcast sending." checked={formData.pushEnabled} onChange={() => setFormData({ ...formData, pushEnabled: !formData.pushEnabled })} />
                        <ToggleRow label="Add to Home Screen (A2HS)" description="Prompt mobile users to install Teer Club as a home screen app." checked={formData.a2hsEnabled} onChange={() => setFormData({ ...formData, a2hsEnabled: !formData.a2hsEnabled })} />
                        <button type="submit" disabled={updateMutation.isPending}
                            className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition">
                            {updateMutation.isPending ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <button type="button" onClick={onChange}
                className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-gray-900" : "bg-gray-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${checked ? "translate-x-6" : "translate-x-1"}`} />
            </button>
        </div>
    );
}

function CampaignLogs({ campaigns, expandedCampaign, setExpandedCampaign }: { campaigns: any[]; expandedCampaign: string | null; setExpandedCampaign: (id: string | null) => void }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Campaign Logs</h3>
            </div>
            {campaigns.length === 0 ? (
                <div className="p-12 text-center text-sm text-gray-400">No campaigns sent yet.</div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {campaigns.map((c: any) => {
                        const ctr = c.deliveredCount > 0 ? ((c.clickCount / c.deliveredCount) * 100).toFixed(1) : "0.0";
                        const isExpanded = expandedCampaign === c.id;
                        return (
                            <div key={c.id}>
                                <button onClick={() => setExpandedCampaign(isExpanded ? null : c.id)}
                                    className="w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{c.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.sentAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-5 text-xs">
                                            <div className="text-center"><p className="text-gray-400">Audience</p><p className="font-medium text-gray-700">{c.audienceSize}</p></div>
                                            <div className="text-center"><p className="text-gray-400">Delivered</p><p className="font-medium text-emerald-600">{c.deliveredCount}</p></div>
                                            <div className="text-center"><p className="text-gray-400">Failed</p><p className="font-medium text-red-500">{c.failedCount}</p></div>
                                            <div className="text-center"><p className="text-gray-400">Clicks</p><p className="font-medium text-gray-700">{c.clickCount}</p></div>
                                            <div className="text-center"><p className="text-gray-400">CTR</p><p className="font-medium text-gray-700">{ctr}%</p></div>
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                                {isExpanded && <CampaignDetailLogs campaignId={c.id} />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function CampaignDetailLogs({ campaignId }: { campaignId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ["campaignLogs", campaignId],
        queryFn: () => api.settings.notifications.getCampaignLogs(campaignId),
    });

    if (isLoading) return <div className="px-5 py-4 text-xs text-gray-400">Loading delivery logs...</div>;

    const logs = data?.data?.logs || [];
    if (logs.length === 0) return <div className="px-5 py-4 text-xs text-gray-400">No delivery logs found.</div>;

    return (
        <div className="bg-gray-50 border-t border-gray-100">
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-left text-gray-500 uppercase tracking-wide">
                        <th className="px-5 py-2 font-medium">Subscriber</th>
                        <th className="px-5 py-2 font-medium">Device</th>
                        <th className="px-5 py-2 font-medium">Status</th>
                        <th className="px-5 py-2 font-medium">Delivered</th>
                        <th className="px-5 py-2 font-medium">Clicked</th>
                        <th className="px-5 py-2 font-medium">Error</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map((log: any) => (
                        <tr key={log.id}>
                            <td className="px-5 py-2 font-mono text-gray-500">{log.subscriberId?.slice(0, 8)}…</td>
                            <td className="px-5 py-2 text-gray-600">{log.subscriber?.deviceType || "—"} / {log.subscriber?.browser || "—"}</td>
                            <td className="px-5 py-2"><DeliveryBadge status={log.status} /></td>
                            <td className="px-5 py-2 text-gray-500">{formatDate(log.deliveredAt)}</td>
                            <td className="px-5 py-2">{log.clicked ? <span className="text-emerald-600 font-medium">Yes</span> : <span className="text-gray-400">No</span>}</td>
                            <td className="px-5 py-2 text-red-500 max-w-[200px] truncate">{log.errorMessage || "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
