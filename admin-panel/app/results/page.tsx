"use client";

import { useEffect, useState, useCallback } from "react";
import api, { DashboardData, Game, Result, ResultsStats, BackfillResult } from "../api/client";

const PAGE_SIZE = 50;

export default function ResultsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<ResultsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>("");

  // Pagination state (offset-based)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Date range filter
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Backfill state
  const [backfillRunning, setBackfillRunning] = useState(false);
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);
  const [showBackfillConfirm, setShowBackfillConfirm] = useState(false);

  // Auto-Debug state
  const [debugRunning, setDebugRunning] = useState(false);
  const [debugReport, setDebugReport] = useState<any[] | null>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Validation state
  const [validationRunning, setValidationRunning] = useState(false);
  const [validationReport, setValidationReport] = useState<any[] | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const loadData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const [adminRes, statsRes, gamesRes] = await Promise.all([
        api.admin.getResults({
          gameId: selectedGame || undefined,
          page,
          limit: PAGE_SIZE,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }),
        api.results.getStats({
          gameId: selectedGame || undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }),
        api.results.getDashboard({ limit: 1 }), // Just to get game list
      ]);

      setResults(adminRes.data.results);
      setCurrentPage(adminRes.data.pagination.page);
      setTotalPages(adminRes.data.pagination.totalPages);
      setTotalResults(adminRes.data.pagination.total);
      setStats(statsRes.data);
      setData(gamesRes.data);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch data";
      console.error("[Results Error]", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, dateFrom, dateTo]);

  useEffect(() => {
    loadData(1);
  }, [selectedGame, loadData]);

  const handleFilter = () => {
    setCurrentPage(1);
    loadData(1);
  };

  const handleClearDates = () => {
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    // Will trigger reload via useEffect
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackfill = async () => {
    setShowBackfillConfirm(false);
    setBackfillRunning(true);
    setBackfillResult(null);

    try {
      const res = await api.admin.triggerBackfill("shillong");
      setBackfillResult(res.data);
      // Reload after success
      if (res.data.success) {
        await loadData(1);
      }
    } catch (err: any) {
      setBackfillResult({
        success: false,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        errorDetails: [err.message],
        totalExtracted: 0,
        duration: 0,
        dateRange: null,
      });
    } finally {
      setBackfillRunning(false);
    }
  };

  const handleAutoDebug = async () => {
    setDebugRunning(true);
    setDebugReport(null);
    setShowDebugModal(true);

    try {
      const res = await api.admin.debug.triggerResults();
      setDebugReport(res.data);
      // Reload results in background
      loadData(currentPage);
    } catch (err: any) {
      console.error("[Debug Error]", err);
      setDebugReport([{
        game: "System Error",
        status: "ERROR",
        issues: ["Failed to run debug: " + err.message],
        actions: []
      }]);
    } finally {
      setDebugRunning(false);
    }
  };

  const handleAutoCheck = async () => {
    setValidationRunning(true);
    setValidationReport(null);
    setShowValidationModal(true);

    try {
      const res = await api.validation.checkToday();
      setValidationReport(res.data);
      // Reload results in background
      loadData(currentPage);
    } catch (err: any) {
      console.error("[Validation Error]", err);
    } finally {
      setValidationRunning(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            LOW
          </span>
        );
    }
  };

  if (loading && results.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={() => loadData(1)}
            className="mt-2 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Published Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalResults.toLocaleString()} total results
            {selectedGame && data?.games ? ` • ${data.games.find(g => g.id === selectedGame)?.displayName || ""}` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBackfillConfirm(true)}
            disabled={backfillRunning}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {backfillRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Historical Data
              </>
            )}
          </button>
          <button
            onClick={() => loadData(currentPage)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleAutoDebug}
            disabled={debugRunning}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {debugRunning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            )}
            Auto Debug
          </button>
          <button
            onClick={handleAutoCheck}
            disabled={validationRunning}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {validationRunning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Auto Check
          </button>
        </div>
      </div>

      {/* Backfill Confirmation Modal */}
      {showBackfillConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Import Historical Data</h3>
                <p className="text-sm text-gray-500">Shillong Teer</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will scrape all historical Shillong Teer results from teerresults.net and store them in the database.
              Existing records will not be overwritten. This may take 10–30 seconds.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBackfillConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBackfill}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backfill Result Banner */}
      {backfillResult && (
        <div className={`rounded-xl border p-4 ${backfillResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {backfillResult.success ? (
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              <div>
                <p className={`font-medium ${backfillResult.success ? "text-green-800" : "text-red-800"}`}>
                  {backfillResult.success ? "Import Complete" : "Import Failed"}
                </p>
                <div className="mt-1 text-sm space-y-0.5">
                  {backfillResult.success ? (
                    <>
                      <p className="text-green-700">
                        📊 Extracted: {backfillResult.totalExtracted} • ✅ Inserted: {backfillResult.inserted} • 🔄 Updated: {backfillResult.updated} • ⏭️ Skipped: {backfillResult.skipped}
                      </p>
                      {backfillResult.dateRange && (
                        <p className="text-green-600">
                          📅 {backfillResult.dateRange.from} → {backfillResult.dateRange.to} • ⏱️ {(backfillResult.duration / 1000).toFixed(1)}s
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-red-700">{backfillResult.errorDetails.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setBackfillResult(null)} className="p-1 hover:bg-black/5 rounded">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Results" value={stats.total}
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            bgColor="bg-blue-50"
          />
          <StatCard title="Games" value={stats.games}
            icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            bgColor="bg-purple-50"
          />
          <StatCard title="High Confidence" value={stats.byConfidence.HIGH}
            icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            bgColor="bg-green-50"
          />
          <StatCard title="Medium / Low" value={stats.byConfidence.MEDIUM + stats.byConfidence.LOW}
            icon={<svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
            bgColor="bg-yellow-50"
          />
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Game</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Games</option>
              {data?.games.map((game) => (
                <option key={game.id} value={game.id}>{game.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
            {(dateFrom || dateTo) && (
              <button
                onClick={handleClearDates}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm text-gray-400 mt-1">
            No results found. Try adjusting your filters or import historical data.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">FR</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SR</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-purple-500 uppercase tracking-wider">TR</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{formatDate(result.date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700">{result.game?.displayName || result.gameId}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold ${result.round1 && result.round1 !== "XX" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-400"}`}>
                        {result.round1 && result.round1 !== "XX" ? result.round1 : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold ${result.round2 && result.round2 !== "XX" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-400"}`}>
                        {result.round2 && result.round2 !== "XX" ? result.round2 : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold ${result.round3 && result.round3 !== "XX" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-400"}`}>
                        {result.round3 && result.round3 !== "XX" ? result.round3 : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getConfidenceBadge(result.confidence)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(result as any).verified ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalResults)} of {totalResults.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs font-medium text-gray-900 bg-gray-100 rounded-md">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Auto-Debug Report Modal */}
      {showDebugModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">System Diagnostic Report</h3>
                  <p className="text-sm text-gray-500">Auto-Debug & Self-Healing Results</p>
                </div>
              </div>
              <button
                onClick={() => !debugRunning && setShowDebugModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={debugRunning}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {debugRunning ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Scanning Platforms...</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">Checking today and yesterday results across all sources and healing gaps.</p>
                  </div>
                </div>
              ) : debugReport ? (
                <div className="space-y-3">
                  {debugReport.map((item: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-xl border transition-all ${item.status === 'OK' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.status === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="font-bold text-gray-900">{item.game}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${item.status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.status}
                        </span>
                      </div>

                      {item.issues.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {item.issues.map((issue: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.actions.length > 0 && (
                        <div className="space-y-1 mt-3 pt-3 border-t border-gray-100">
                          {item.actions.map((action: string, i: number) => (
                            <div key={i} className={`flex items-start gap-2 text-xs font-medium ${action.includes('SUCCESS') ? 'text-green-700' : 'text-gray-500'}`}>
                              <svg className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${action.includes('SUCCESS') ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No diagnostics available.</p>
              )}
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowDebugModal(false)}
                disabled={debugRunning}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/10"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Check Validation Report Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Validation & Authenticity Report</h3>
                  <p className="text-sm text-gray-500">Auto-Check cross-referenced with live sources</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="/validation-logs"
                  className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                >
                  View Full Logs
                </a>
                <button
                  onClick={() => !validationRunning && setShowValidationModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={validationRunning}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {validationRunning ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Validating Data...</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">Cross-checking dates and previous records to detect false fresh data.</p>
                  </div>
                </div>
              ) : validationReport ? (
                <div className="space-y-3">
                  {validationReport.length === 0 && (
                    <div className="text-center py-6 text-gray-500">No results found today to validate.</div>
                  )}
                  {validationReport.map((log: any) => (
                    <div key={log.id} className={`p-4 rounded-xl border transition-all ${log.status === 'VALID' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${log.status === 'VALID' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="font-bold text-gray-900">{log.game?.displayName || log.gameId}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${log.status === 'VALID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status === 'VALID' ? "✅ Valid" : "❌ Invalid"}
                        </span>
                      </div>

                      <div className="mt-2 text-sm">
                        <p className={`font-bold ${log.status === 'VALID' ? 'text-green-800' : 'text-red-800'}`}>
                          Reason: {log.reason}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Source: <a href={log.sourceUrl} target="_blank" className="underline hover:text-indigo-500">{log.sourceUrl}</a></p>
                        <p className="text-gray-600 font-mono text-xs mt-1">
                          Data: r1: {log.scrapedResult?.r1 || '--'}, r2: {log.scrapedResult?.r2 || '--'} &nbsp;&bull;&nbsp; Confidence: {log.confidenceScore}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  bgColor = "bg-gray-50",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
