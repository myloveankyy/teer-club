"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import ImportProgressModal from "@/components/ImportProgressModal";
import api, { Game } from "../api/client";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    location: "",
    startTime: "",
    frTime: "",
    srTime: "",
    closeTime: "",
    historySourceUrl: "",
    liveSourceUrl: "",
    hasRound3: false,
    isLiveScrapingEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Import modal state
  const [importTarget, setImportTarget] = useState<Game | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await api.games.getAll();
      setGames(response.data);
      setLoadError(null);
    } catch (err: any) {
      console.error("Failed to load games:", err);
      setLoadError(err.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        displayName: formData.displayName,
        description: formData.description || undefined,
        location: formData.location || undefined,
        startTime: formData.startTime || undefined,
        frTime: formData.frTime || undefined,
        srTime: formData.srTime || undefined,
        closeTime: formData.closeTime || undefined,
        historySourceUrl: formData.historySourceUrl || null,
        liveSourceUrl: formData.liveSourceUrl || null,
        hasRound3: formData.hasRound3,
        isLiveScrapingEnabled: formData.isLiveScrapingEnabled,
      };

      if (editingGame) {
        await api.games.update(editingGame.id, payload);
        showToast("Game updated successfully", "success");
      } else {
        await api.games.create({ ...payload, name: formData.name });
        showToast("Game created successfully", "success");
      }
      setShowModal(false);
      setEditingGame(null);
      resetForm();
      loadGames();
    } catch (err: any) {
      setError(err.message || "Failed to save game");
      showToast(err.message || "Failed to save game", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      location: "",
      startTime: "",
      frTime: "",
      srTime: "",
      closeTime: "",
      historySourceUrl: "",
      liveSourceUrl: "",
      hasRound3: false,
      isLiveScrapingEnabled: true,
    });
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      displayName: game.displayName,
      description: game.description || "",
      location: game.location || "",
      startTime: game.startTime || "",
      frTime: game.frTime || "",
      srTime: game.srTime || "",
      closeTime: game.closeTime || "",
      historySourceUrl: game.historySourceUrl || "",
      liveSourceUrl: game.liveSourceUrl || "",
      hasRound3: game.hasRound3 || false,
      isLiveScrapingEnabled: game.isLiveScrapingEnabled ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    try {
      await api.games.delete(id);
      showToast("Game deleted successfully", "success");
      loadGames();
    } catch (err: any) {
      showToast(err.message || "Failed to delete game", "error");
    }
  };

  const toggleGame = async (game: Game) => {
    try {
      await api.games.update(game.id, { isEnabled: !game.isEnabled });
      loadGames();
    } catch (err: any) {
      showToast(err.message || "Failed to update game", "error");
    }
  };

  const openCreateModal = () => {
    setEditingGame(null);
    resetForm();
    setError(null);
    setShowModal(true);
  };

  const handleImport = (game: Game) => {
    if (!game.historySourceUrl) {
      showToast("No history source URL configured. Edit the game to add one.", "error");
      return;
    }
    setImportTarget(game);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-white rounded-lg border border-red-200">
          <p className="text-red-600">{loadError}</p>
          <button onClick={loadGames} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Games</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your game configurations and data sources</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Game
        </button>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">No games</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new game</p>
          <button onClick={openCreateModal} className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg">
            Add Game
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{game.name}</div>
                    {game.location && <div className="text-xs text-gray-400">{game.location}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{game.displayName}</div>
                  </td>
                  <td className="px-6 py-4">
                    {game.historySourceUrl ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        Not Set
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleGame(game)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${game.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {game.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {/* Import Button */}
                    <button
                      onClick={() => handleImport(game)}
                      title={game.historySourceUrl ? "Import historical data" : "Set a source URL first"}
                      className={`mr-3 ${game.historySourceUrl
                        ? "text-blue-500 hover:text-blue-700"
                        : "text-gray-300 cursor-not-allowed"
                        }`}
                      disabled={!game.historySourceUrl}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    {/* Edit */}
                    <button onClick={() => handleEdit(game)} className="text-gray-400 hover:text-gray-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button onClick={() => handleDelete(game.id)} className="text-gray-400 hover:text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGame ? "Edit Game" : "Add New Game"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!editingGame && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., shillong-teer"
                  required
                />
              </div>
            )}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., Shillong Teer"
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., Meghalaya"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Game description..."
                rows={2}
              />
            </div>

            {/* Source URLs Section */}
            <div className="col-span-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Data Sources</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                History Source URL
                <span className="text-xs text-gray-400 ml-1">(for bulk import)</span>
              </label>
              <input
                type="url"
                value={formData.historySourceUrl}
                onChange={(e) => setFormData({ ...formData, historySourceUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                placeholder="https://example.com/results"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Live Source URL
                <span className="text-xs text-gray-400 ml-1">(for daily cron)</span>
              </label>
              <input
                type="url"
                value={formData.liveSourceUrl}
                onChange={(e) => setFormData({ ...formData, liveSourceUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                placeholder="https://example.com/live"
              />
            </div>

            <div className="col-span-2 pt-2 flex items-center">
              <input
                id="hasRound3"
                type="checkbox"
                checked={formData.hasRound3}
                onChange={(e) => setFormData({ ...formData, hasRound3: e.target.checked })}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="hasRound3" className="ml-2 block text-sm font-medium text-gray-700">
                Has Third Round (TR)
              </label>
            </div>

            <div className="col-span-2 pt-1 flex items-center">
              <input
                id="isLiveScrapingEnabled"
                type="checkbox"
                checked={formData.isLiveScrapingEnabled}
                onChange={(e) => setFormData({ ...formData, isLiveScrapingEnabled: e.target.checked })}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="isLiveScrapingEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                Enable Automated Live Scraping (Cron)
              </label>
            </div>

            {/* Timing Section */}
            <div className="col-span-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Timing</p>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., 3:30 PM"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
              <input
                type="text"
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., 5:00 PM"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">FR Result Time</label>
              <input
                type="text"
                value={formData.frTime}
                onChange={(e) => setFormData({ ...formData, frTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., 4:00 PM"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">SR Result Time</label>
              <input
                type="text"
                value={formData.srTime}
                onChange={(e) => setFormData({ ...formData, srTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., 4:30 PM"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg whitespace-nowrap">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50 whitespace-nowrap">
              {saving ? "Saving..." : editingGame ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Progress Modal */}
      {importTarget && (
        <ImportProgressModal
          isOpen={!!importTarget}
          onClose={() => {
            setImportTarget(null);
            loadGames(); // Refresh data after import
          }}
          gameId={importTarget.id}
          gameName={importTarget.displayName}
        />
      )}
    </div>
  );
}
