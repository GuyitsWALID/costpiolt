"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import SettingsPage from '@/components/SettingsPage';
import ProjectCreateDialog from '@/components/ProjectCreateDialog';
import { MaterialThemeProvider } from '@/components/MaterialThemeProvider';
import { 
  Calculator, 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  MoreHorizontal, 
  ChevronDown,
  Trash2,
  ExternalLink,
  TrendingUp,
  Database,
  Activity,
  DollarSign
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import BudgetTool from '@/components/BudgetTool';

type ViewType = 'projects' | 'budget' | 'settings';
type ProjectViewType = 'card' | 'list';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('projects');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectViewType, setProjectViewType] = useState<ProjectViewType>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const fetchProjects = useCallback(async (currentUser: User) => {
    try {
      console.log('🔄 Fetching projects for user:', currentUser.email);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Projects query error:', error);
        // Don't throw error for empty results or minor issues
        setProjects([]);
        return;
      }

      console.log('✅ Projects fetched successfully:', data?.length || 0);
      setProjects(data || []);
      
      if (data && data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
      
    } catch (error) {
      console.log('Error fetching projects:', error);
      setProjects([]); // Set empty array instead of throwing
    }
  }, [selectedProjectId]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/auth');
          return;
        }

        if (mounted) {
          setUser(session.user);
          await fetchProjects(session.user);
          setLoading(false);
        }
      } catch (error) {
        console.log('Auth initialization error:', error);
        router.push('/auth');
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth');
      } else if (event === 'SIGNED_IN' && session?.user && mounted) {
        setUser(session.user);
        await fetchProjects(session.user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, fetchProjects]);

  const handleProjectCreated = async () => {
    if (user) {
      await fetchProjects(user);
    }
    setShowCreateForm(false);
  };

  const handleCreateProjectSuccess = (projectId: string) => {
    handleProjectCreated();
    // Navigate to the new project's budget editor
    router.push(`/projects/${projectId}/budget-editor`);
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Don't navigate away, just select the project
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view === 'projects') {
      setSelectedProjectId(null);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || project.project_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalDatasetSize = projects.reduce((sum, p) => sum + p.dataset_gb, 0);
  const totalMonthlyTokens = projects.reduce((sum, p) => sum + p.monthly_tokens, 0);
  const avgProjectSize = projects.length > 0 ? totalDatasetSize / projects.length : 0;

  const handleExportData = () => {
    const exportData = {
      summary: {
        totalProjects: projects.length,
        totalDatasetSize,
        totalMonthlyTokens,
        avgProjectSize: Math.round(avgProjectSize * 100) / 100
      },
      projects: projects.map(p => ({
        name: p.name,
        type: p.project_type,
        model: p.model_approach,
        datasetSize: p.dataset_gb,
        monthlyTokens: p.monthly_tokens,
        createdAt: p.created_at
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `costpilot-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProjectAction = (action: 'details' | 'delete', projectId: string) => {
    if (action === 'details') {
      router.push(`/projects/${projectId}/budget-editor`);
    } else if (action === 'delete') {
      // Add delete confirmation logic here
      console.log('Delete project:', projectId);
    }
    setShowDropdown(null);
  };

  // Simple loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't show anything if no user (will redirect)
  if (!user) {
    return null;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const renderMainContent = () => {
    switch (currentView) {
      case 'budget':
        return <BudgetTool />;
      case 'settings':
        return <SettingsPage user={user} />;
      case 'projects':
      default:
        return (
          <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleExportData}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                  <button
                    onClick={handleShowCreateForm}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </button>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-emerald-100 text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold">{projects.length}</p>
                    <p className="text-emerald-100 text-xs">Increased from last month</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Dataset Size</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDatasetSize} GB</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Total across all projects</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Tokens</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMonthlyTokens.toLocaleString()}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Combined usage</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Project Size</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgProjectSize.toFixed(1)} GB</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Per project average</p>
                  </div>
                </div>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-6">
                  {/* Project Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Search */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search tasks"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Filter */}
                      <div className="relative">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-4 pr-10 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Types</option>
                          <option value="classification">Classification</option>
                          <option value="generation">Generation</option>
                          <option value="analysis">Analysis</option>
                          <option value="other">Other</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => setProjectViewType('card')}
                        className={`p-2 rounded-md transition-colors ${
                          projectViewType === 'card'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setProjectViewType('list')}
                        className={`p-2 rounded-md transition-colors ${
                          projectViewType === 'list'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Projects Display */}
                  {projectViewType === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25 transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:-translate-y-2"
                          onClick={() => handleProjectSelect(project.id)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.name}
                              </h3>
                              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                                {project.project_type.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === project.id ? null : project.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              {showDropdown === project.id && (
                                <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProjectAction('details', project.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProjectAction('delete', project.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Project
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {project.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                              {project.description}
                            </p>
                          )}

                          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700 group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Model Approach</span>
                              <span className="text-gray-900 dark:text-white font-medium capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.model_approach.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Dataset Size</span>
                              <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.dataset_gb} GB</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Monthly Tokens</span>
                              <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.monthly_tokens.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onClick={() => handleProjectSelect(project.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {project.name}
                                  </h3>
                                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                    {project.project_type.replace('_', ' ')}
                                  </span>
                                </div>
                                {project.description && (
                                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                              <div className="relative ml-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDropdown(showDropdown === project.id ? null : project.id);
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                  <MoreHorizontal className="h-5 w-5" />
                                </button>
                                {showDropdown === project.id && (
                                  <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProjectAction('details', project.id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProjectAction('delete', project.id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Project
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calculator className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Welcome to CostPilot Dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Create your first AI project to start tracking costs and managing budget forecasts.
                  </p>
                  <button
                    onClick={handleShowCreateForm}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Project
                  </button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // Enhanced error display
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setError(null);
                  
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/auth');
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Sign Out & Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Theme Toggle Button - Fixed position in top-right */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        title="Toggle theme"
      >
        {theme === 'dark' ? 
          <Sun className="h-5 w-5" /> : 
          <Moon className="h-5 w-5" />
        }
      </button>

      {/* Sidebar */}
      <Sidebar 
        projects={projects}
        onProjectCreated={handleProjectCreated}
        onProjectSelect={handleProjectSelect}
        selectedProjectId={selectedProjectId}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {renderMainContent()}
      </div>

      {/* Create Project Dialog */}
      <MaterialThemeProvider>
        <ProjectCreateDialog
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateProjectSuccess}
        />
      </MaterialThemeProvider>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}