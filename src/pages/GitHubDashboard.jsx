import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GitBranch, GitCommit, AlertCircle, Loader2, ExternalLink, CheckCircle } from 'lucide-react';

export default function GitHubDashboard() {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branch, setBranch] = useState(null);
  const [gitlabProjects, setGitlabProjects] = useState([]);
  const [selectedGitlabProject, setSelectedGitlabProject] = useState(null);
  const [gitlabCommits, setGitlabCommits] = useState([]);
  const [activeTab, setActiveTab] = useState('github');
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

        // Get GitHub data
        const githubUserRes = await base44.functions.invoke('getGitHubUser', {});
        const reposRes = await base44.functions.invoke('getGitHubRepositories', {});
        const reposData = reposRes.data?.repos || [];
        setRepos(reposData);
        if (reposData.length > 0) {
          setSelectedRepo(reposData[0]);
        }

        // Get GitLab data
        try {
          const projectsRes = await base44.functions.invoke('getGitLabProjects', {});
          const projectsData = projectsRes.data?.projects || [];
          setGitlabProjects(projectsData);
          if (projectsData.length > 0) {
            setSelectedGitlabProject(projectsData[0]);
          }
        } catch (e) {
          console.log('GitLab not connected or error:', e);
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

  useEffect(() => {
    if (!selectedGitlabProject) return;

    const fetchData = async () => {
      try {
        const commitsRes = await base44.functions.invoke('getGitLabCommits', {
          projectId: selectedGitlabProject.id,
          per_page: 10,
        });
        setGitlabCommits(commitsRes.data?.commits || []);
      } catch (err) {
        console.error('Error fetching GitLab commits:', err);
      }
    };

    fetchData();
  }, [selectedGitlabProject]);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Repository Dashboard</h1>
          <p className="text-gray-600">Admin-only view of GitHub and GitLab repository status</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 border-b border-gray-200">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                activeTab === 'github'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              GitHub
            </button>
            <button
              onClick={() => setActiveTab('gitlab')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                activeTab === 'gitlab'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              GitLab
            </button>
          </div>
        </div>

        {/* GitHub Tab */}
        {activeTab === 'github' && (
        <div>
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
        )}

        {/* GitLab Tab */}
        {activeTab === 'gitlab' && (
        <div>
          {gitlabProjects.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-900 font-semibold">GitLab not connected</p>
              <p className="text-blue-700 text-sm">Complete the GitLab OAuth authorization to see your projects.</p>
            </div>
          ) : (
            <>
              {/* GitLab Project Selector */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Project
                </label>
                <select
                  value={selectedGitlabProject?.id || ''}
                  onChange={(e) => {
                    const project = gitlabProjects.find(p => p.id === parseInt(e.target.value));
                    setSelectedGitlabProject(project);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {gitlabProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name_with_namespace}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGitlabProject && (
                <>
                  {/* GitLab Project Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Project Info</h2>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Project</p>
                          <p className="text-sm font-mono text-gray-900">{selectedGitlabProject.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Default Branch</p>
                          <p className="text-sm font-mono text-gray-900">{selectedGitlabProject.default_branch}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Repository</h2>
                      <a
                        href={selectedGitlabProject.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        View on GitLab
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <p className="text-sm text-gray-600 mt-4">
                        {selectedGitlabProject.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Recent Commits */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <GitCommit className="w-6 h-6 text-orange-600" />
                      <h2 className="text-lg font-bold text-gray-900">Recent Commits</h2>
                    </div>

                    {gitlabCommits.length > 0 ? (
                      <div className="space-y-4">
                        {gitlabCommits.map(commit => (
                          <div
                            key={commit.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{commit.message.split('\n')[0]}</p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                  {commit.short_id}
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{commit.author_name}</span>
                              <span>
                                {new Date(commit.created_at).toLocaleDateString()}
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
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}