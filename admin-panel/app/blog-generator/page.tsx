"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../api/client";
import { useToast } from "@/components/Toast";

export default function BlogGeneratorPage() {
    const { showToast } = useToast();
    const [topic, setTopic] = useState("");
    const [draft, setDraft] = useState<any>(null);

    const generateMutation = useMutation({
        mutationFn: (t: string) => api.ai.generateBlog(t),
        onSuccess: (res) => {
            setDraft(res.data);
            showToast("Blog draft generated!", "success");
        },
        onError: () => showToast("Failed to generate blog", "error"),
    });

    const publishMutation = useMutation({
        mutationFn: (data: any) => api.pages.create({
            title: data.title,
            slug: data.slug,
            content: data.content,
            type: "BLOG",
            meta_title: data.title,
            meta_description: data.meta_description
        }),
        onSuccess: () => {
            setDraft(null);
            setTopic("");
            showToast("Blog published successfully!", "success");
        },
        onError: () => showToast("Failed to publish blog", "error"),
    });

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">AI Blog Generator</h1>
                <p className="mt-1 text-sm text-gray-500">Generate programmatic SEO content automatically using AI instructions.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic or Keyword Focus</label>
                <div className="flex gap-4">
                    <input
                        type="text"
                        className="flex-1 w-full text-sm border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Shillong teer result prediction today"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={generateMutation.isPending}
                    />
                    <button
                        onClick={() => { if (topic.trim()) generateMutation.mutate(topic); }}
                        disabled={!topic.trim() || generateMutation.isPending}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        {generateMutation.isPending && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        Generate
                    </button>
                </div>
            </div>

            {draft && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden auto-cols-auto">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Generated Draft</h2>
                        <button
                            onClick={() => publishMutation.mutate(draft)}
                            disabled={publishMutation.isPending}
                            className="bg-gray-900 text-white px-4 py-2 rounded font-medium text-sm hover:bg-gray-800 disabled:opacity-50"
                        >
                            Publish to Live App
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Title</label>
                            <input
                                type="text"
                                value={draft.title}
                                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                className="w-full border-gray-200 rounded p-2 text-sm bg-transparent"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">URL Slug</label>
                            <input
                                type="text"
                                value={draft.slug}
                                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                                className="w-full border-gray-200 rounded p-2 text-sm text-gray-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Meta Description</label>
                            <textarea
                                value={draft.meta_description}
                                onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
                                className="w-full border-gray-200 rounded p-2 text-sm"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Markdown Payload</label>
                            <textarea
                                value={draft.content}
                                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                                className="w-full border-gray-200 rounded p-4 font-mono text-sm h-64 resize-y"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
