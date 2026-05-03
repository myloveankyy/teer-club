"use client";

import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function WidgetToolPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [color, setColor] = useState<string>("2563eb");
    const [market, setMarket] = useState<string>("all");

    const { data } = useQuery({
        queryKey: ["todays-results"],
        queryFn: () => api.results.getToday(),
    });

    const games = data?.data?.data?.games || [];

    const widgetUrl = `https://teer.club/widget?theme=${theme}&color=${color}${market !== "all" ? `&market=${market}` : ""}`;

    const embedCode = `<iframe 
    src="${widgetUrl}" 
    width="100%" 
    height="${market === "all" ? "400" : "180"}" 
    style="border:none; border-radius:12px; overflow:hidden;" 
    title="Live Teer Result Widget">
</iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        alert("Embed code copied to clipboard!");
    };

    return (
        <PageLayout>
            <main className="flex-1 bg-gray-50 pb-20">
                {/* Hero Header */}
                <div className="bg-gray-900 text-white py-16">
                    <Container>
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Teer Live Result Widget</h1>
                            <p className="text-lg text-gray-400">
                                Add our 100% free, auto-updating Teer Result widget to your website or blog. Keep your users engaged with real-time updates.
                            </p>
                        </div>
                    </Container>
                </div>

                <Section>
                    <Container>
                        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            {/* Configuration Panel */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                                <h2 className="text-2xl font-bold mb-6">Customize Your Widget</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Theme</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setTheme("light")}
                                                className={`flex-1 py-3 px-4 rounded-xl font-medium border-2 transition-all ${theme === "light" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                                            >
                                                Light Mode
                                            </button>
                                            <button
                                                onClick={() => setTheme("dark")}
                                                className={`flex-1 py-3 px-4 rounded-xl font-medium border-2 transition-all ${theme === "dark" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                                            >
                                                Dark Mode
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Primary Color (HEX Code)</label>
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-bold">#</span>
                                            <input
                                                type="text"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value.replace("#", ""))}
                                                maxLength={6}
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none uppercase font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Target Market</label>
                                        <select
                                            value={market}
                                            onChange={(e) => setMarket(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                        >
                                            <option value="all">All Live Games</option>
                                            {games.map((g: any) => (
                                                <option key={g.id} value={g.name}>{g.name} Only</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <label className="block text-sm font-semibold mb-2">Your Embed Code</label>
                                        <div className="relative">
                                            <pre className="p-4 bg-gray-900 text-green-400 text-sm rounded-xl overflow-x-auto">
                                                <code>{embedCode}</code>
                                            </pre>
                                            <button
                                                onClick={handleCopy}
                                                className="absolute top-2 right-2 px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                COPY
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview Panel */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Live Preview</h2>
                                <div className="p-4 bg-gray-100 rounded-3xl border-4 border-gray-200 overflow-hidden relative" style={{ height: market === "all" ? "450px" : "250px" }}>
                                    <div className="absolute top-0 left-0 right-0 bg-gray-200 h-8 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="mt-8 h-full bg-white rounded-xl shadow-inner overflow-hidden">
                                        <iframe
                                            src={widgetUrl}
                                            width="100%"
                                            height="100%"
                                            style={{ border: "none" }}
                                            title="Preview"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
