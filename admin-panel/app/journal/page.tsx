"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/client";
import { useToast } from "@/components/Toast";

export default function JournalPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

    // Profile Form States
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [newProfileName, setNewProfileName] = useState("");

    // Note Form States
    const [isDrafting, setIsDrafting] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");

    // Fetches
    const { data: profilesData, isLoading: profilesLoading } = useQuery({
        queryKey: ["seo-profiles"],
        queryFn: () => api.journal.profiles.getAll(),
    });

    const profiles = profilesData?.data || [];
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

    const { data: notesData, isLoading: notesLoading } = useQuery({
        queryKey: ["seo-notes", selectedProfileId],
        queryFn: () => api.journal.notes.getAll({ profileId: selectedProfileId as string, limit: 100 }),
        enabled: !!selectedProfileId,
    });

    const notes = notesData?.data?.notes || [];

    // Mutations
    const createProfileMutation = useMutation({
        mutationFn: (data: { name: string; role: string }) => api.journal.profiles.create(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["seo-profiles"] });
            setShowProfileForm(false);
            setNewProfileName("");
            setSelectedProfileId(res?.data?.id || null);
            showToast("Profile created successfully", "success");
        },
        onError: () => showToast("Failed to create profile", "error"),
    });

    const createNoteMutation = useMutation({
        mutationFn: (data: { profileId: string; title: string; content: string }) => api.journal.notes.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seo-notes", selectedProfileId] });
            setIsDrafting(false);
            setNoteTitle("");
            setNoteContent("");
            showToast("Note saved successfully", "success");
        },
        onError: () => showToast("Failed to save note", "error"),
    });

    const deleteNoteMutation = useMutation({
        mutationFn: (id: string) => api.journal.notes.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seo-notes", selectedProfileId] });
            showToast("Note deleted", "success");
        },
    });

    const handleCreateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProfileName.trim()) return;
        createProfileMutation.mutate({ name: newProfileName, role: "SEO Expert" });
    };

    const handleSaveNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteTitle.trim() || !noteContent.trim() || !selectedProfileId) return;
        createNoteMutation.mutate({ profileId: selectedProfileId, title: noteTitle, content: noteContent });
    };

    return (
        <div className="flex bg-gray-50/50 min-h-[calc(100vh-4rem)]">
            {/* Left Sidebar: Profile Selector */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col pt-6">
                <div className="px-5 mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">SEO Experts</h2>
                    <button
                        onClick={() => setShowProfileForm(!showProfileForm)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {showProfileForm && (
                    <div className="px-5 mb-6">
                        <form onSubmit={handleCreateProfile} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2 mb-3 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={createProfileMutation.isPending}
                                    className="flex-1 bg-gray-900 text-white p-2 rounded-md justify-center items-center font-medium text-xs disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileForm(false)}
                                    className="flex-1 bg-white border border-gray-200 text-gray-700 p-2 rounded-md font-medium text-xs hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
                    {profilesLoading ? (
                        <div className="p-4 text-center text-sm text-gray-400">Loading profiles...</div>
                    ) : profiles.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 italic">No profiles created yet.</div>
                    ) : (
                        profiles.map((profile: any) => (
                            <button
                                key={profile.id}
                                onClick={() => setSelectedProfileId(profile.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedProfileId === profile.id ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-100 border border-transparent"
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-semibold truncate ${selectedProfileId === profile.id ? "text-blue-900" : "text-gray-900"}`}>
                                        {profile.name}
                                    </p>
                                    <p className={`text-xs truncate ${selectedProfileId === profile.id ? "text-blue-700 font-medium" : "text-gray-500"}`}>
                                        {profile.role}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Profile Dashboard & Notepad */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                {!selectedProfileId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">SEO Expert Journal</h3>
                        <p className="text-sm text-gray-500">Select a profile from the sidebar or create a new one to access the daily insight dashboard.</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto w-full space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">{selectedProfile?.name}&apos;s Workspace</h1>
                                <p className="text-sm text-gray-500 mt-1">Capture daily SEO insights and notes here.</p>
                            </div>
                            <button
                                onClick={() => setIsDrafting(!isDrafting)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Write Note
                            </button>
                        </div>

                        {/* Note Editor */}
                        {isDrafting && (
                            <form onSubmit={handleSaveNote} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-in slide-in-from-top-4">
                                <input
                                    type="text"
                                    placeholder="Note Title..."
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="w-full text-lg font-medium border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:ring-0 px-0 mb-4 bg-transparent placeholder-gray-400"
                                    required
                                />
                                <textarea
                                    placeholder="Write your daily insight, ranking updates, or algorithm thoughts..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    rows={6}
                                    className="w-full text-sm border border-gray-200 rounded-lg p-4 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 resize-y"
                                    required
                                />
                                <div className="mt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsDrafting(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createNoteMutation.isPending}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        Save Note
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Notes List */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Notes</h2>
                            {notesLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-500">No notes written yet. Start by writing your first note above!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notes.map((note: any) => (
                                        <div key={note.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors group">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-base font-semibold text-gray-900">{note.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(note.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Are you sure you want to delete this note?")) {
                                                                deleteNoteMutation.mutate(note.id);
                                                            }
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
