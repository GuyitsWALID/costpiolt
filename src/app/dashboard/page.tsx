"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import SettingsPage from '@/components/SettingsPage';
import ProjectCreateDialog from '@/components/ProjectCreateDialog';
import EnterpriseProjectForm from '@/components/EnterpriseProjectForm';
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
  ChevronDown,
  Trash2,
  ExternalLink,
  TrendingUp,
  Database,
  Activity,
  DollarSign,
  AlertTriangle,
  Menu,
  X
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
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectViewType, setProjectViewType] = useState<ProjectViewType>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    // Check project limit for free tier users
    if (projects.length >= 2) {
      setShowUpgradeModal(true);
      return;
    }
    setShowEnterpriseForm(true);
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

  const handleProjectAction = async (action: 'details' | 'delete', projectId: string) => {
    console.log('Project action triggered:', action, 'for project:', projectId);
    
    if (action === 'details') {
      console.log('Navigating to:', `/projects/${projectId}/estimation`);
      setShowDropdown(null);
      router.push(`/projects/${projectId}/estimation`);
    } else if (action === 'delete') {
      setShowDropdown(null);
      setShowDeleteConfirm(projectId);
    }
  };

  const handleDeleteConfirm = async (projectId: string) => {
    setDeleting(true);
    try {
      console.log('Attempting to delete project:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id); // Extra security check
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Project deleted successfully from database');
      
      // Refresh projects list
      if (user) {
        await fetchProjects(user);
      }
      
      // Clear selected project if it was the deleted one
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleDropdownToggle = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (showDropdown === projectId) {
      setShowDropdown(null);
      setDropdownPosition(null);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right + window.scrollX
    });
    setShowDropdown(projectId);
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

  const renderMainContent = () => {
    switch (currentView) {
      case 'budget':
        return <BudgetTool />;
      case 'settings':
        return <SettingsPage user={user} />;
      case 'projects':
      default:
        return (
          <div className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              {/* Header Section - Add top margin on mobile to avoid hamburger overlap */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mt-16 md:mt-0">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                  <button
                    onClick={handleExportData}
                    className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full md:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                  <button
                    onClick={handleShowCreateForm}
                    className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </button>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-blue-700 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
                  <div className="absolute top-3 right-3 md:top-4 md:right-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-emerald-100 text-xs md:text-sm font-medium">Total Projects</p>
                    <p className="text-2xl md:text-3xl font-bold">{projects.length}</p>
                    <p className="text-emerald-100 text-xs">Increased from last month</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Database className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Dataset Size</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{totalDatasetSize} GB</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Total across all projects</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Activity className="h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Monthly Tokens</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{totalMonthlyTokens.toLocaleString()}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Combined usage</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Avg Project Size</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{avgProjectSize.toFixed(1)} GB</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Per project average</p>
                  </div>
                </div>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-4 md:space-y-6">
                  {/* Project Controls */}
                  <div className="flex flex-col space-y-4 md:flex-row md:gap-4 md:items-center md:justify-between md:space-y-0">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 flex-1">
                      {/* Search */}
                      <div className="relative flex-1 max-w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search projects"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Filter */}
                      <div className="relative w-full md:w-auto">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-4 pr-10 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto"
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

                    {/* View Toggle - Hidden on mobile, shown on larger screens */}
                    <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
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

                  {/* Projects Display - Card view on mobile, toggle on desktop */}
                  {projectViewType === 'card' ? (
                    /* Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 group relative"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleProjectSelect(project.id)}
                            >
                              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                {project.name}
                              </h3>
                              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                {project.project_type.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {/* Dropdown Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === project.id ? null : project.id);
                                }}
                                className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-150"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              
                              {showDropdown === project.id && (
                                <div className="absolute right-0 top-8 md:top-10 w-44 md:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-[100]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProjectAction('details', project.id);
                                  }}
                                  className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors duration-150"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2 md:mr-3" />
                                  View Details
                                </button>
                                
                                <hr className="border-gray-100 dark:border-gray-700" />
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProjectAction('delete', project.id);
                                  }}
                                  className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center transition-colors duration-150"
                                >
                                  <Trash2 className="h-4 w-4 mr-2 md:mr-3" />
                                  Delete Project
                                </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Content */}
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleProjectSelect(project.id)}
                          >
                            {project.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>
                            )}

                            <div className="space-y-2 md:space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Model Approach</span>
                                <span className="text-gray-900 dark:text-white font-medium capitalize text-right">
                                  {project.model_approach.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Dataset Size</span>
                                <span className="text-gray-900 dark:text-white font-medium">{project.dataset_gb} GB</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Monthly Tokens</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {project.monthly_tokens.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Project Limit Reached Message */}
                      {projects.length >= 2 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-yellow-50 dark:bg-yellow-900 rounded-2xl p-4 md:p-6 border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="h-4 w-4 md:h-4 md:w-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-yellow-800 dark:text-yellow-200 text-sm md:text-base font-medium">
                                Project Limit Reached
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                You have reached the maximum number of projects allowed on the free tier. Upgrade to Pro to create unlimited projects.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* List View */
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                              <div className="flex items-start justify-between">
                                <div 
                                  className="flex-1 cursor-pointer pr-4"
                                  onClick={() => handleProjectSelect(project.id)}
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {project.name}
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                      {project.project_type.replace('_', ' ')}
                                    </span>
                                  </div>
                                  
                                  {project.description && (
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-1">
                                      {project.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center">
                                      <span className="text-gray-500 dark:text-gray-400 mr-1">Model:</span>
                                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                                        {project.model_approach.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-gray-500 dark:text-gray-400 mr-1">Dataset:</span>
                                      <span className="text-gray-900 dark:text-white font-medium">{project.dataset_gb} GB</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-gray-500 dark:text-gray-400 mr-1">Tokens:</span>
                                      <span className="text-gray-900 dark:text-white font-medium">
                                        {project.monthly_tokens.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Dropdown Button */}
                                <div className="flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleDropdownToggle(project.id, e)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-150"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Project Limit Reached Message */}
                      {projects.length >= 2 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900 rounded-2xl p-4 md:p-6 border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="h-4 w-4 md:h-4 md:w-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-yellow-800 dark:text-yellow-200 text-sm md:text-base font-medium">
                                Project Limit Reached
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                You have reached the maximum number of projects allowed on the free tier. Upgrade to Pro to create unlimited projects.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 px-4">
                  <Calculator className="h-16 w-16 md:h-20 md:w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Welcome to CostPilot Dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                    Create your first AI project to start tracking costs and managing budget forecasts.
                  </p>
                  <button
                    onClick={handleShowCreateForm}
                    className="inline-flex items-center px-6 md:px-8 py-3 border border-transparent text-sm md:text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full max-w-xs md:w-auto"
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
    
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        user={user}
        currentView={currentView}
        onViewChange={handleViewChange}
        isCollapsed={isSidebarCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        projects={projects}
        onProjectCreated={handleProjectCreated}
        onProjectSelect={handleProjectSelect}
        selectedProjectId={selectedProjectId}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content - Properly positioned relative to sidebar */}
      <div className={`flex-1 transition-all duration-300 ${
        // On desktop: adjust margin based on sidebar state
        // On mobile: full width (sidebar overlays)
        isSidebarCollapsed 
          ? 'md:ml-20 ml-0' 
          : 'md:ml-72 ml-0'
      }`}>
        {renderMainContent()}
      </div>
    
      {/* Dropdown Menu Portal - Fixed position outside all containers */}
      {showDropdown && dropdownPosition && projectViewType === 'list' && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => {
              setShowDropdown(null);
              setDropdownPosition(null);
            }}
          />
          <div
            className="fixed z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
          >
            <div className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectAction('details', showDropdown);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors duration-150"
              >
                <ExternalLink className="h-4 w-4 mr-3" />
                View Details
              </button>
              
              <hr className="border-gray-100 dark:border-gray-700" />
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectAction('delete', showDropdown);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center transition-colors duration-150"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete Project
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Project Dialog */}
      <MaterialThemeProvider>
        <ProjectCreateDialog
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateProjectSuccess}
          projectCount={projects.length}
        />
      </MaterialThemeProvider>

      {/* Enterprise Project Form */}
      <MaterialThemeProvider>
        <EnterpriseProjectForm
          open={showEnterpriseForm}
          onClose={() => setShowEnterpriseForm(false)}
          onSuccess={handleCreateProjectSuccess}
          projectCount={projects.length}
        />
      </MaterialThemeProvider>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(null)}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUpgradeModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Upgrade to Unlock More
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    You&apos;ve reached the limit of 2 projects on the free tier. Choose a plan that fits your needs and unlock unlimited potential.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Free Plan - Current */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 relative">
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6 text-sm">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Up to 2 projects</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Basic Budget Tracking</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Email Support</span>
                      </li>
                    </ul>
                    
                    <button
                      disabled
                      className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 transform scale-105">
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pro</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$19</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6 text-sm">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Unlimited Projects</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Advanced Analytics</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Priority Support</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Export Data</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => {
                        window.open('https://polar.sh/checkout/3bdd0f57-bac5-4190-8847-f48681c18e43', '_blank');
                        setShowUpgradeModal(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Upgrade to Pro
                    </button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                      7-day free trial • Cancel anytime
                    </p>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$49</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6 text-sm">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Everything in Pro</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Team Collaboration</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Custom Integrations</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Dedicated Support</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => {
                        window.open('https://polar.sh/checkout/3bdd0f57-bac5-4190-8847-f48681c18e43', '_blank');
                        setShowUpgradeModal(false);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Contact Sales
                    </button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                      Custom pricing • Volume discounts
                    </p>
                  </div>
                </div>

                <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    ✨ All plans include secure data handling, regular backups, and 99.9% uptime guarantee
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Questions? <a href="mailto:support@costpilot.ai" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Contact our team</a> • 
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-2">View detailed comparison</a>
                  </p>
                </div>
              </div>
              

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:justify-center">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(null)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this project? This action cannot be undone and will permanently remove all project data including estimations and goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Project'
                  )}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}