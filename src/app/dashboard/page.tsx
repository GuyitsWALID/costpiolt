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
import { Calculator, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import BudgetTool from '@/components/BudgetTool';

type ViewType = 'projects' | 'budget' | 'settings';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('projects');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-6xl mx-auto">
              {selectedProject ? (
                <div className="space-y-6">
                  {/* Project Header */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedProject.name}</h1>
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200 mt-2">
                          {selectedProject.project_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {selectedProject.description && (
                      <p className="text-gray-600 dark:text-gray-300">{selectedProject.description}</p>
                    )}
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Type</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                        {selectedProject.project_type.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Model Approach</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                        {selectedProject.model_approach.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Dataset Size</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedProject.dataset_gb} GB</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Tokens</div>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {selectedProject.monthly_tokens.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Budget Editor Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      View detailed cost breakdown and budget estimates for your AI project.
                    </p>
                    <button
                      onClick={() => router.push(`/projects/${selectedProject.id}/budget-editor`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Open Budget Editor
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Projects Overview */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projects Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage your AI projects and track budget forecasts</p>
                      </div>
                      {projects.length > 0 && (
                        <button
                          onClick={handleShowCreateForm}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Project
                        </button>
                      )}
                    </div>
                  </div>

                  {projects.length > 0 ? (
                    <div className="space-y-6">
                      {/* Projects Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleProjectSelect(project.id)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{project.name}</h3>
                              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                {project.project_type.replace('_', ' ')}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                            )}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Model:</span>
                                <span className="text-gray-900 dark:text-white capitalize">{project.model_approach.replace('_', ' ')}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Dataset:</span>
                                <span className="text-gray-900 dark:text-white">{project.dataset_gb} GB</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Monthly Tokens:</span>
                                <span className="text-gray-900 dark:text-white">{project.monthly_tokens.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projects.length}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Projects</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {projects.reduce((sum, p) => sum + p.dataset_gb, 0)} GB
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Dataset Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {projects.reduce((sum, p) => sum + p.monthly_tokens, 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Tokens</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Welcome to CostPilot Dashboard</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                        Create your first AI project to start tracking costs and managing budget forecasts.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleShowCreateForm}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Project
                        </button>
                      </div>
                    </div>
                  )}
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
      </div>
  );
}