"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { 
  Calculator, 
  TrendingUp, 
  Zap,
  Brain,
  Database,
  Settings,
  Save,
  Target,
  AlertTriangle
} from 'lucide-react';

interface CostBreakdown {
  training: number;
  inference: number;
  storage: number;
  compute: number;
  total: number;
}

interface BudgetEstimate {
  monthly: CostBreakdown;
  yearly: CostBreakdown;
  reasoning: {
    training: string;
    inference: string;
    storage: string;
    compute: string;
    optimization: string[];
  };
}

interface GoalStep {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
}

type ViewType = 'projects' | 'budget' | 'settings';

export default function BudgetEditor() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);
  const [goals, setGoals] = useState<GoalStep[]>([]);
  const [showGoalCreation, setShowGoalCreation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Budget parameters
  const [budgetParams, setBudgetParams] = useState({
    expectedUsers: 1000,
    peakUsage: 10000,
    dataRetention: 12, // months
    redundancy: 2,
    environment: 'production' as 'development' | 'staging' | 'production'
  });

  const fetchProjects = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
        const foundProject = data.projects.find((p: Project) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
        } else {
          throw new Error('Project not found');
        }
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/dashboard');
    }
  }, [projectId, router]);

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth');
        return;
      }
      
      setUser(session.user);
      await fetchProjects(session.access_token);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  }, [router, fetchProjects]);

  useEffect(() => {
    checkUser();
  }, [projectId, checkUser]);

  const generateAIEstimate = async () => {
    if (!project) return;
    
    setAnalyzing(true);
    setHasUnsavedChanges(true);
    
    // Simulate AI analysis with realistic calculations
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Calculate costs based on project parameters and budget params
    const baseTrainingCost = project.model_approach === 'from_scratch' ? 2500 : 
                           project.model_approach === 'fine_tune' ? 800 : 150;
    
    const dataMultiplier = Math.log10(project.dataset_gb + 1) / 2;
    const usageMultiplier = budgetParams.expectedUsers / 1000;
    const environmentMultiplier = budgetParams.environment === 'production' ? 1.5 : 
                                 budgetParams.environment === 'staging' ? 0.8 : 0.3;
    
    const monthlyTraining = baseTrainingCost * dataMultiplier * environmentMultiplier;
    const monthlyInference = (project.monthly_tokens / 1000) * 0.02 * usageMultiplier;
    const monthlyStorage = project.dataset_gb * 0.023 * budgetParams.dataRetention * budgetParams.redundancy;
    const monthlyCompute = monthlyInference * 1.8 + (monthlyTraining * 0.1);
    
    const monthly: CostBreakdown = {
      training: Math.round(monthlyTraining * 100) / 100,
      inference: Math.round(monthlyInference * 100) / 100,
      storage: Math.round(monthlyStorage * 100) / 100,
      compute: Math.round(monthlyCompute * 100) / 100,
      total: 0
    };
    
    monthly.total = monthly.training + monthly.inference + monthly.storage + monthly.compute;
    
    const yearly: CostBreakdown = {
      training: monthly.training * 12,
      inference: monthly.inference * 12,
      storage: monthly.storage * 12,
      compute: monthly.compute * 12,
      total: monthly.total * 12
    };

    const newEstimate: BudgetEstimate = {
      monthly,
      yearly,
      reasoning: {
        training: `Training costs based on ${project.model_approach} approach with ${project.dataset_gb}GB dataset. ${project.model_approach === 'from_scratch' ? 'Building from scratch requires significant compute resources.' : project.model_approach === 'fine_tune' ? 'Fine-tuning existing models is more cost-effective.' : 'API-only approach minimizes training costs.'}`,
        inference: `Inference costs calculated from ${project.monthly_tokens.toLocaleString()} monthly tokens with ${budgetParams.expectedUsers} expected users. Rate: $0.02 per 1K tokens.`,
        storage: `Storage costs for ${project.dataset_gb}GB dataset with ${budgetParams.dataRetention} months retention and ${budgetParams.redundancy}x redundancy. Rate: $0.023/GB/month.`,
        compute: `Compute overhead includes processing, networking, and infrastructure scaling for ${budgetParams.environment} environment.`,
        optimization: [
          'Consider batch processing for non-real-time inference to reduce costs by up to 40%',
          'Implement caching strategies to reduce repeated inference calls',
          'Use spot instances for training workloads to save 60-90%',
          'Optimize model size through quantization and pruning techniques',
          budgetParams.environment === 'production' ? 'Implement auto-scaling to match demand patterns' : 'Scale up resources gradually as usage grows'
        ]
      }
    };

    setEstimate(newEstimate);
    setAnalyzing(false);
  };

  const createGoalsFromEstimate = () => {
    if (!estimate || !project) return;

    const newGoals: GoalStep[] = [
      {
        id: '1',
        title: 'Optimize Training Costs',
        description: `Reduce monthly training costs from $${estimate.monthly.training} to under $${Math.round(estimate.monthly.training * 0.7)}`,
        targetAmount: estimate.monthly.training * 0.3,
        timeline: '3 months',
        priority: 'high',
        status: 'not-started'
      },
      {
        id: '2',
        title: 'Implement Cost Monitoring',
        description: 'Set up automated cost tracking and alerts for budget thresholds',
        targetAmount: 50,
        timeline: '1 month',
        priority: 'high',
        status: 'not-started'
      },
      {
        id: '3',
        title: 'Storage Optimization',
        description: `Optimize data storage and archival strategies to reduce monthly storage costs`,
        targetAmount: estimate.monthly.storage * 0.4,
        timeline: '2 months',
        priority: 'medium',
        status: 'not-started'
      },
      {
        id: '4',
        title: 'Inference Efficiency',
        description: 'Implement caching and batch processing to reduce inference costs by 30%',
        targetAmount: estimate.monthly.inference * 0.3,
        timeline: '4 months',
        priority: 'medium',
        status: 'not-started'
      },
      {
        id: '5',
        title: 'Scale Planning',
        description: 'Plan for 5x user growth while maintaining cost efficiency',
        targetAmount: estimate.monthly.total * 2,
        timeline: '6 months',
        priority: 'low',
        status: 'not-started'
      }
    ];

    setGoals(newGoals);
    setShowGoalCreation(true);
    setHasUnsavedChanges(true);
  };

  const updateGoalStatus = (goalId: string, status: GoalStep['status']) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, status } : goal
    ));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save the budget analysis data (you can implement actual save logic here)
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      alert('Budget analysis saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save budget analysis');
    }
  };

  const handleNavigation = (destination: ViewType) => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation(destination);
    } else {
      router.push('/dashboard');
    }
  };

  const handleProjectCreated = async () => {
    if (!user) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      await fetchProjects(session.access_token);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation(`/projects/${projectId}/budget-editor`);
    } else {
      router.push(`/projects/${projectId}/budget-editor`);
    }
  };

  const confirmNavigation = () => {
    setShowUnsavedWarning(false);
    if (pendingNavigation) {
      if (pendingNavigation.startsWith('/projects/')) {
        router.push(pendingNavigation);
      } else {
        router.push('/dashboard');
      }
      setPendingNavigation(null);
    }
  };

  const cancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Loading Sidebar */}
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Calculator className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading budget editor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        projects={projects}
        onProjectCreated={handleProjectCreated}
        onProjectSelect={handleProjectSelect}
        selectedProjectId={project.id}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        currentView="budget"
        onViewChange={handleNavigation}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Budget Editor</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.name}</p>
              </div>
              <div className="flex items-center space-x-3">
                {hasUnsavedChanges && (
                  <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Unsaved changes
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    hasUnsavedChanges
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Configuration */}
            <div className="space-y-6 flex flex-col items-center">
              {/* Project Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Project Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-sm text-gray-900 dark:text-white capitalize font-medium">{project.project_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Approach:</span>
                    <span className="text-sm text-gray-900 dark:text-white capitalize font-medium">{project.model_approach.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dataset:</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{project.dataset_gb} GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Tokens:</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{project.monthly_tokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Budget Parameters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Budget Parameters</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Users
                    </label>
                    <input
                      type="number"
                      value={budgetParams.expectedUsers}
                      onChange={(e) => {
                        setBudgetParams(prev => ({ ...prev, expectedUsers: parseInt(e.target.value) || 0 }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Peak Usage (requests/day)
                    </label>
                    <input
                      type="number"
                      value={budgetParams.peakUsage}
                      onChange={(e) => {
                        setBudgetParams(prev => ({ ...prev, peakUsage: parseInt(e.target.value) || 0 }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data Retention (months)
                    </label>
                    <input
                      type="number"
                      value={budgetParams.dataRetention}
                      onChange={(e) => {
                        setBudgetParams(prev => ({ ...prev, dataRetention: parseInt(e.target.value) || 1 }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Environment
                    </label>
                    <select
                      value={budgetParams.environment}
                      onChange={(e) => {
                        setBudgetParams(prev => ({ ...prev, environment: e.target.value as 'development' | 'staging' | 'production' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={generateAIEstimate}
                  disabled={analyzing}
                  className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate AI Estimate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Center Panel - Analysis Results */}
            <div className="lg:col-span-2 space-y-6">
              {analyzing && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Cost Analysis in Progress</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Analyzing your project parameters and generating detailed cost estimates...</p>
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <p>• Evaluating model complexity and training requirements</p>
                      <p>• Calculating inference costs based on usage patterns</p>
                      <p>• Optimizing storage and compute configurations</p>
                      <p>• Generating cost optimization recommendations</p>
                    </div>
                  </div>
                </div>
              )}

              {estimate && (
                <>
                  {/* Cost Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Cost Analysis & Breakdown</h3>
                    
                    {/* Monthly vs Yearly Toggle */}
                    <div className="flex space-x-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex-1">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Monthly Total</h4>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${estimate.monthly.total.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex-1">
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Yearly Total</h4>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">${estimate.yearly.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Training</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">${estimate.monthly.training.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Inference</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">${estimate.monthly.inference.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Database className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Storage</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">${estimate.monthly.storage.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Settings className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Compute</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">${estimate.monthly.compute.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Cost Analysis Reasoning</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-purple-500" />
                          Training Costs
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{estimate.reasoning.training}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                          Inference Costs
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{estimate.reasoning.inference}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <Database className="h-4 w-4 mr-2 text-blue-500" />
                          Storage Costs
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{estimate.reasoning.storage}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-green-500" />
                          Compute Overhead
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{estimate.reasoning.compute}</p>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Recommendations */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Optimization Recommendations</h3>
                    <div className="space-y-3">
                      {estimate.reasoning.optimization.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={createGoalsFromEstimate}
                      className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Create Budget Goals & Tracking Plan
                    </button>
                  </div>

                  {/* Goals & Tracking */}
                  {showGoalCreation && goals.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Goals & Tracking Plan</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        Based on the AI analysis, here are recommended budget optimization goals. Accept this plan to start tracking your progress.
                      </p>
                      
                      <div className="space-y-4 mb-6">
                        {goals.map((goal) => (
                          <div key={goal.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                  {goal.priority}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{goal.timeline}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{goal.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Target Savings: ${goal.targetAmount.toFixed(2)}/month
                              </span>
                              <select
                                value={goal.status}
                                onChange={(e) => updateGoalStatus(goal.id, e.target.value as GoalStep['status'])}
                                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            // Accept and start tracking
                            alert('Budget tracking plan activated! You can now monitor your progress in the dashboard.');
                            setHasUnsavedChanges(true);
                          }}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Accept Plan & Start Tracking
                        </button>
                        <button
                          onClick={() => setShowGoalCreation(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Modify Goals
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You have unsaved changes to your budget analysis. Are you sure you want to leave without saving?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmNavigation}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Leave Without Saving
              </button>
              <button
                onClick={cancelNavigation}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}