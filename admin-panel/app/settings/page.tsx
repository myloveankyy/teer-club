"use client";

import { useState, useEffect } from "react";

interface Settings {
  apiUrl: string;
  apiKey: string;
  autoRefresh: boolean;
  refreshInterval: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    apiUrl: "",
    apiKey: "",
    autoRefresh: true,
    refreshInterval: 30,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings({
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
        apiKey: "",
        autoRefresh: true,
        refreshInterval: 30,
      });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    
    if (settings.apiKey) {
      localStorage.setItem("apiKey", settings.apiKey);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${settings.apiUrl}/games`, {
        headers: settings.apiKey ? { "X-API-Key": settings.apiKey } : {},
      });
      if (response.ok) {
        alert("Connection successful!");
      } else {
        alert("Connection failed: " + response.status);
      }
    } catch (err) {
      alert("Connection failed: " + err);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your admin panel settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
              <input
                type="url"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="http://localhost:3001/api"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter your API key"
              />
              <p className="mt-1 text-xs text-gray-500">Required for production environments</p>
            </div>

            <button
              onClick={testConnection}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Test Connection
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
                <p className="text-xs text-gray-500">Automatically refresh data on pages</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoRefresh: !settings.autoRefresh })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.autoRefresh ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.autoRefresh ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {settings.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) || 30 })}
                  min={5}
                  max={300}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">API Key Authentication</p>
                <p className="text-xs text-gray-500">Protect API endpoints with API key</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Rate Limiting</p>
                <p className="text-xs text-gray-500">100 requests per minute per IP</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">CORS Protection</p>
                <p className="text-xs text-gray-500">Restrict cross-origin requests</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-sm text-green-600">Settings saved successfully!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}