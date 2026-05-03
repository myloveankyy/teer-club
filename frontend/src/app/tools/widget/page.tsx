"use client";

import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function WidgetToolPage() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [color, setColor] = useState<string>("3b82f6");
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
    height="${market === "all" ? "420" : "180"}" 
    style="border:none; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);" 
    title="Teer Club Live Data">
</iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        alert("Embed code copied to clipboard!");
    };

    return (
        <PageLayout>
            <main className="flex-1 bg-white flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                
                {/* Left Column: Documentation & Configuration */}
                <div className="flex-1 border-r border-gray-200 bg-gray-50/30">
                    <div className="max-w-3xl ml-auto px-6 py-12 md:px-12 lg:pl-24 lg:pr-16">
                        
                        <div className="mb-12">
                            <span className="text-primary font-bold tracking-widest text-[11px] uppercase mb-2 block">Developer Tools</span>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
                                Embed Integration
                            </h1>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Integrate official, real-time Teer data directly into your platform. Our premium iframe widget is built for performance, utilizing edge-caching and resilient scraper fallbacks.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {/* Section 1: Configuration */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs">1</span>
                                    Configure Parameters
                                </h2>
                                
                                <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Color Scheme</label>
                                        <p className="text-xs text-gray-500 mb-3">Select the base appearance to match your UI.</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setTheme("dark")}
                                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${theme === "dark" ? "bg-gray-900 text-white shadow-md ring-2 ring-gray-900 ring-offset-2" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                                            >
                                                Dark Mode
                                            </button>
                                            <button
                                                onClick={() => setTheme("light")}
                                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${theme === "light" ? "bg-white text-gray-900 shadow-md border-gray-200 ring-2 ring-gray-900 ring-offset-2" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                                            >
                                                Light Mode
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Brand Accent Color</label>
                                        <p className="text-xs text-gray-500 mb-3">Provide a HEX code to tint the live indicators.</p>
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-mono text-sm">#</span>
                                            <input
                                                type="text"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value.replace("#", ""))}
                                                maxLength={6}
                                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase font-mono text-sm"
                                                placeholder="3b82f6"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Data Source Filter</label>
                                        <p className="text-xs text-gray-500 mb-3">Select a specific market, or display all active games.</p>
                                        <select
                                            value={market}
                                            onChange={(e) => setMarket(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 text-sm font-semibold"
                                        >
                                            <option value="all">Global (All Markets)</option>
                                            {games.map((g: any) => (
                                                <option key={g.id} value={g.name}>{g.name} Only</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Implementation */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs">2</span>
                                    Implementation
                                </h2>
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    Copy the HTML snippet below and paste it into your website's source code where you want the widget to render. The iframe is fully responsive and will inherit the width of its parent container.
                                </p>
                                
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <div className="relative bg-[#0d1117] rounded-2xl overflow-hidden border border-gray-800">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#161b22]">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                            </div>
                                            <span className="text-xs font-mono text-gray-500">HTML</span>
                                        </div>
                                        <pre className="p-5 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                            <code className="text-[#a5d6ff]">{"<iframe"}</code>
                                            <br/>
                                            <code className="text-[#79c0ff]">  src=</code><code className="text-[#a5d6ff]">"{widgetUrl}"</code>
                                            <br/>
                                            <code className="text-[#79c0ff]">  width=</code><code className="text-[#a5d6ff]">"100%"</code>
                                            <br/>
                                            <code className="text-[#79c0ff]">  height=</code><code className="text-[#a5d6ff]">"{market === "all" ? "420" : "180"}"</code>
                                            <br/>
                                            <code className="text-[#79c0ff]">  style=</code><code className="text-[#a5d6ff]">"border:none; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"</code>
                                            <br/>
                                            <code className="text-[#79c0ff]">  title=</code><code className="text-[#a5d6ff]">"Teer Club Live Data"</code><code className="text-[#a5d6ff]">{">"}</code>
                                            <br/>
                                            <code className="text-[#a5d6ff]">{"</iframe>"}</code>
                                        </pre>
                                        <button
                                            onClick={handleCopy}
                                            className="absolute bottom-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors backdrop-blur-sm"
                                        >
                                            Copy Snippet
                                        </button>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Live Preview */}
                <div className="w-full md:w-[45%] lg:w-[40%] bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-8 md:p-12">
                    {/* Abstract background elements for the preview area */}
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px]"></div>
                    
                    <div className="w-full max-w-sm relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold tracking-tight">Live Render</h3>
                            <span className="px-2 py-1 bg-white/10 text-white/60 text-[10px] uppercase tracking-widest font-bold rounded">Preview</span>
                        </div>
                        
                        <div 
                            className="w-full rounded-[20px] p-2 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-500"
                            style={{ height: market === "all" ? "440px" : "200px" }}
                        >
                            <iframe
                                src={widgetUrl}
                                width="100%"
                                height="100%"
                                style={{ border: "none", borderRadius: "12px" }}
                                title="Live Preview"
                            ></iframe>
                        </div>
                    </div>
                </div>

            </main>
        </PageLayout>
    );
}
