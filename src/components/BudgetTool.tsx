"use client";

import { useState, useEffect } from 'react';
import { 
  Calculator, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Grid3X3,
  List,
  Search,
  Filter,
  ArrowRight,
  BarChart3,
  PieChart,
  Calendar,
  Users
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { supabase } from '@/lib/supabaseClient';
import type { Project } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface ProjectEstimate {
  project_id: string;
  total_cost: number;
  monthly_operational_cost: number;
  compute_cost: number;
  data_cost: number;
  team_cost: number;
  created_at: string;
  forecast_months: number;
  goals: BudgetGoal[];
}

interface BudgetGoal {
  id: string;
  title: string;
  description: string;
  potential_savings: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  category: 'compute' | 'data' | 'team' | 'operations';
}

type ViewType = 'grid' | 'list';
type FilterType = 'all' | 'high_cost' | 'needs_attention' | 'optimized';

export default function BudgetTool() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [estimates, setEstimates] = useState<Record<string, ProjectEstimate>>({});
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjectsAndEstimates();
    }
  }, [user]);

  const fetchProjectsAndEstimates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);

      // Mock estimates data - in real app, this would come from database
      const mockEstimates: Record<string, ProjectEstimate> = {};
      (projectsData || []).forEach(project => {
        mockEstimates[project.id] = {
          project_id: project.id,
          total_cost: Math.random() * 10000 + 5000,
          monthly_operational_cost: Math.random() * 2000 + 500,
          compute_cost: Math.random() * 4000 + 2000,
          data_cost: Math.random() * 1000 + 200,
          team_cost: Math.random() * 8000 + 3000,
          created_at: new Date().toISOString(),
          forecast_months: 12,
          goals: generateMockGoals()
        };
      });
      
      setEstimates(mockEstimates);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockGoals = (): BudgetGoal[] => {
    const goals = [
      {
        id: '1',
        title: 'Optimize GPU Usage',
        description: 'Switch to spot instances during non-peak hours to reduce compute costs',
        potential_savings: Math.random() * 500 + 200,
        priority: 'high' as const,
        status: 'pending' as const,
        category: 'compute' as const
      },
      {
        id: '2',
        title: 'Data Pipeline Efficiency',
        description: 'Implement data compression and caching to reduce storage and transfer costs',
        potential_savings: Math.random() * 300 + 100,
        priority: 'medium' as const,
        status: 'in_progress' as const,
        category: 'data' as const
      },
      {
        id: '3',
        title: 'Team Optimization',
        description: 'Automate repetitive tasks to reduce manual hours needed',
        potential_savings: Math.random() * 1000 + 500,
        priority: 'high' as const,
        status: 'pending' as const,
        category: 'team' as const
      }
    ];
    return goals.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const estimate = estimates[project.id];
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'high_cost':
        return estimate && estimate.total_cost > 8000;
      case 'needs_attention':
        return estimate && estimate.goals.some(g => g.priority === 'high' && g.status === 'pending');
      case 'optimized':
        return estimate && estimate.goals.every(g => g.status === 'completed');
      default:
        return true;
    }
  });

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const selectedEstimate = selectedProject ? estimates[selectedProject] : null;

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading budget data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProject && selectedProjectData && selectedEstimate) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header - Add mobile top margin to avoid hamburger overlap */}
          <div className="flex items-center justify-between mb-8 mt-16 md:mt-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedProject(null)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Projects
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedProjectData.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">Budget Forecast & Optimization</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Cost Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Budget</p>
                  <p className="text-2xl font-bold">${selectedEstimate.total_cost.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Ops</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${selectedEstimate.monthly_operational_cost.toFixed(0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedEstimate.goals.reduce((sum, g) => sum + g.potential_savings, 0).toFixed(0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Goals</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedEstimate.goals.filter(g => g.status !== 'completed').length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Cost Breakdown and Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Cost Breakdown</h2>
              
              <div className="space-y-4">
                {Object.entries({
                  compute: selectedEstimate.compute_cost,
                  team: selectedEstimate.team_cost,
                  data: selectedEstimate.data_cost,
                  operations: selectedEstimate.monthly_operational_cost * 12
                }).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${key === 'compute' ? 'bg-blue-500' : key === 'team' ? 'bg-purple-500' : key === 'data' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${value.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">{((value / selectedEstimate.total_cost) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Goals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Optimization Goals</h2>
              
              <div className="space-y-4">
                {selectedEstimate.goals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {goal.priority}
                        </span>
                        {goal.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : goal.status === 'in_progress' ? (
                          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{goal.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{goal.category}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        Save ${goal.potential_savings.toFixed(0)}/month
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 mt-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Management</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor project costs, forecasts, and optimization opportunities
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-4 pr-10 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                <option value="high_cost">High Cost ({'>'}$8k)</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="optimized">Optimized</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Projects Display */}
        {filteredProjects.length > 0 ? (
          viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => {
                const estimate = estimates[project.id];
                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                          {project.project_type.replace('_', ' ')}
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>

                    {estimate && (
                      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Total Budget</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${estimate.total_cost.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Monthly Ops</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${estimate.monthly_operational_cost.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Optimization Goals</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {estimate.goals.filter(g => g.status !== 'completed').length} active
                          </span>
                        </div>
                        {estimate.goals.some(g => g.priority === 'high' && g.status === 'pending') && (
                          <div className="flex items-center space-x-2 pt-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-xs text-orange-600 dark:text-orange-400">Needs attention</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map(project => {
                  const estimate = estimates[project.id];
                  return (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {project.name}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                              {project.project_type.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {estimate && (
                            <div className="flex items-center space-x-6 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Budget: </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ${estimate.total_cost.toFixed(0)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Monthly: </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ${estimate.monthly_operational_cost.toFixed(0)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Goals: </span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                  {estimate.goals.filter(g => g.status !== 'completed').length} active
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {estimate?.goals.some(g => g.priority === 'high' && g.status === 'pending') && (
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                          )}
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <Calculator className="h-20 w-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No Projects Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {searchQuery || filter !== 'all' 
                ? 'No projects match your current filters. Try adjusting your search or filter criteria.'
                : 'Create your first project to start tracking budgets and forecasts.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}