import React, { useState, useEffect, useCallback } from 'react';

const PROJECT_ID = 'generatedapp';
const API_BASE = 'https://api.ainative.studio/api/v1';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    activeRoadmaps: 0,
    totalEmails: 0,
    deployedPages: 0
  });
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [recentEmails, setRecentEmails] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('ainative_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [ideasRes, emailsRes, roadmapsRes, pagesRes] = await Promise.all([
        fetch(`${API_BASE}/projects/${PROJECT_ID}/database/tables/ideas/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ limit: 5, sort: { created_at: -1 } })
        }),
        fetch(`${API_BASE}/projects/${PROJECT_ID}/database/tables/emails/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ limit: 5, sort: { created_at: -1 } })
        }),
        fetch(`${API_BASE}/projects/${PROJECT_ID}/database/tables/roadmaps/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ filter: { status: 'active' } })
        }),
        fetch(`${API_BASE}/projects/${PROJECT_ID}/database/tables/landing_pages/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ filter: { deployed: true } })
        })
      ]);

      const ideas = await ideasRes.json();
      const emails = await emailsRes.json();
      const roadmaps = await roadmapsRes.json();
      const pages = await pagesRes.json();

      setRecentIdeas(ideas.data || []);
      setRecentEmails(emails.data || []);
      setStats({
        totalIdeas: ideas.total || 0,
        activeRoadmaps: roadmaps.total || 0,
        totalEmails: emails.total || 0,
        deployedPages: pages.total || 0
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteIdea = async (ideaId) => {
    try {
      const token = localStorage.getItem('ainative_token');
      await fetch(`${API_BASE}/projects/${PROJECT_ID}/database/tables/ideas/records/${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete idea');
    }
  };

  const handleViewIdea = (idea) => {
    setSelectedIdea(idea);
    setShowIdeaModal(true);
  };

  const handleExportEmails = () => {
    const csv = ['Email,Created At'].concat(
      recentEmails.map(e => `${e.email},${e.created_at}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emails.csv';
    a.click();
  };

  if (loading) {
    return (
      <div data-testid="dashboard-container" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="dashboard-container" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-container" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to GeneratedApp - Your AI Company Builder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ideas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalIdeas}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Roadmaps</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeRoadmaps}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Subscribers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEmails}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deployed Pages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.deployedPages}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Ideas</h2>
              <button
                onClick={fetchDashboardData}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
            <div className="p-6">
              {recentIdeas.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-gray-500">No ideas submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentIdeas.map((idea) => (
                    <div key={idea._id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{idea.title || 'Untitled Idea'}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{idea.description || idea.idea_text}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs text-gray-500">
                              {new Date(idea.created_at).toLocaleDateString()}
                            </span>
                            {idea.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                idea.status === 'completed' ? 'bg-green-100 text-green-800' :
                                idea.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {idea.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleViewIdea(idea)}
                            className="text-