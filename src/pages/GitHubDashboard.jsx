import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GitBranch, GitCommit, AlertCircle, Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function GitHubDashboard() {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          setError('Admin access required');
          setLoading(false);
          return;
        }
        setUser(currentUser);

        // Get user
        const userRes = await base44.functions.invoke('getGitHubUser', {});
        const userData = userRes.data?.user;

        // Get repos
        const reposRes = await base44.functions.invoke('getGitHubRepositories', {});
        const reposData = reposRes.data?.repos || [];
        setRepos(reposData);

        if (reposData.length > 0) {
          setSelectedRepo(reposData[0]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!selectedRepo) return;

    const fetchData = async () => {
      try {
        const [commitsRes, branchRes] = await Promise.all([
          base44.functions.invoke('getGitHubCommits', {
            owner: selectedRepo.owner.login,
            repo: selectedRepo.name,
            per_page: 10,
          }),
          base44.functions.invoke('getGitHubBranch', {
            owner: selectedRepo.owner.login,
            repo: selectedRepo.name,
          }),
        ]);

        setCommits(commitsRes.data?.commits || []);
        setBranch(branchRes.data?.branch);
      } catch (err) {
        console.error('Error fetching repo data:', err);
      }
    };

    fetchData();
  }, [selectedRepo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h2 className="font-bold text-red-900">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GitHub Dashboard</h1>
          <p className="text-gray-600">Admin-only view of repository status and recent activity</p>
        </div>

        {/* Repository Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Repository
          </label>
          <select
            value={selectedRepo?.name || ''}
            onChange={(e) => {
              const repo = repos.find(r => r.name === e.target.value);
              setSelectedRepo(repo);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {repos.map(repo => (
              <option key={repo.id} value={repo.name}>
                {repo.full_name}
              </option>
            ))}
          </select>
        </div>

        {selectedRepo && (
          <>
            {/* Current Branch Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Current Branch</h2>
                </div>
                {branch && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-2xl font-mono font-bold text-blue-900">{branch}</p>
                    <p className="text-sm text-blue-700 mt-2">Default branch</p>
                  </div>
                )}
              </div>

              {/* Repository Link */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Repository</h2>
                <a
                  href={selectedRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View on GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-600 mt-4">
                  {selectedRepo.description || 'No description'}
                </p>
              </div>
            </div>

            {/* Recent Commits */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <GitCommit className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Recent Commits</h2>
              </div>

              {commits.length > 0 ? (
                <div className="space-y-4">
                  {commits.map(commit => (
                    <div
                      key={commit.sha}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{commit.commit.message.split('\n')[0]}</p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {commit.sha.substring(0, 7)}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{commit.commit.author.name}</span>
                        <span>
                          {new Date(commit.commit.author.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No commits found</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}