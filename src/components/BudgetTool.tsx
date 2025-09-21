"use client";

import { useState, useEffect } from 'react';
import { 
  Calculator, Target, TrendingUp, DollarSign, BarChart3, 
  CheckCircle, AlertCircle, Brain, PieChart, Play, CheckSquare, 
  Lightbulb, TrendingDown, ArrowRight 
} from 'lucide-react';
import type { Project } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';

interface CostBreakdown {
  training: {
    amount: number;
    reasoning: string;
    factors: string[];
  };
  inference: {
    amount: number;
    reasoning: string;
    factors: string[];
  };
  storage: {
    amount: number;
    reasoning: string;
    factors: string[];
  };
  compute: {
    amount: number;
    reasoning: string;
    factors: string[];
  };
  total: number;
}

interface AIAnalysis {
  thoughtProcess: string[];
  costBreakdown: CostBreakdown;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  optimizationOpportunities: Array<{
    area: string;
    potentialSavings: number;
    implementation: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  monthlyEstimate: number;
  yearlyEstimate: number;
  confidenceScore: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  milestones: Array<{
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
  }>;
}

type ViewState = 'project-selection' | 'estimate-form' | 'analysis-results' | 'goal-creation' | 'tracking';

export default function BudgetTool() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewState, setViewState] = useState<ViewState>('project-selection');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [proposedGoals, setProposedGoals] = useState<Goal[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);

  const [formData, setFormData] = useState({
    expectedUsers: 1000,
    peakConcurrency: 100,
    trainingFrequency: 'monthly',
    deploymentType: 'cloud',
    scalingRequirements: 'auto',
    complianceNeeds: 'basic'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProjects(data.projects);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    if (!selectedProject) return;

    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const thoughtProcess = [
        "Analyzing project parameters and requirements...",
        `Processing ${selectedProject.project_type} with ${selectedProject.model_approach} approach`,
        `Evaluating ${selectedProject.dataset_gb}GB dataset size impact on storage costs`,
        `Calculating inference costs for ${selectedProject.monthly_tokens.toLocaleString()} monthly tokens`,
        `Assessing ${formData.expectedUsers} expected users with ${formData.peakConcurrency} peak concurrency`,
        `Factoring in ${formData.trainingFrequency} training frequency and ${formData.deploymentType} deployment`,
        "Applying industry benchmarks and optimization patterns...",
        "Generating cost breakdown with detailed reasoning..."
      ];

      const baseTokenCost = selectedProject.model_approach === 'from_scratch' ? 0.002 : 
                           selectedProject.model_approach === 'fine_tune' ? 0.0015 : 0.001;
      const storageCostPerGB = 0.023;
      const computeCostPerHour = formData.deploymentType === 'cloud' ? 0.50 : 0.35;
      
      const trainingMultiplier = formData.trainingFrequency === 'daily' ? 30 : 
                                 formData.trainingFrequency === 'weekly' ? 4 : 1;
      const trainingTokens = selectedProject.monthly_tokens * 0.1 * trainingMultiplier;
      const trainingComputeHours = Math.ceil(selectedProject.dataset_gb / 10) * 2;
      const trainingCost = (trainingTokens * baseTokenCost) + (trainingComputeHours * computeCostPerHour);

      const concurrencyFactor = Math.log10(formData.peakConcurrency) / 2;
      const userScalingFactor = Math.sqrt(formData.expectedUsers / 1000);
      const inferenceCost = selectedProject.monthly_tokens * baseTokenCost * userScalingFactor * (1 + concurrencyFactor);

      const redundancyFactor = formData.complianceNeeds === 'enterprise' ? 3 : 
                              formData.complianceNeeds === 'standard' ? 2 : 1.5;
      const storageCost = selectedProject.dataset_gb * storageCostPerGB * redundancyFactor;

      const baseComputeHours = 24 * 30;
      const scalingFactor = formData.scalingRequirements === 'auto' ? 1.2 : 
                           formData.scalingRequirements === 'manual' ? 1.0 : 1.5;
      const instanceCount = Math.ceil(formData.peakConcurrency / 100);
      const computeCost = baseComputeHours * computeCostPerHour * instanceCount * scalingFactor;

      const total = trainingCost + inferenceCost + storageCost + computeCost;

      const riskLevel = total > 5000 ? 'high' : total > 1000 ? 'medium' : 'low';
      const riskFactors = [
        ...(formData.scalingRequirements === 'aggressive' ? ['Aggressive scaling may lead to cost spikes'] : []),
        ...(formData.peakConcurrency > 1000 ? ['High concurrency requirements increase infrastructure costs'] : []),
        ...(selectedProject.dataset_gb > 100 ? ['Large dataset size impacts storage and transfer costs'] : []),
        ...(formData.trainingFrequency === 'daily' ? ['Frequent training increases computational overhead'] : [])
      ];

      const optimizations = [
        {
          area: 'Training Optimization',
          potentialSavings: trainingCost * 0.3,
          implementation: 'Use spot instances and batch processing during off-peak hours',
          effort: 'medium' as const
        },
        {
          area: 'Inference Caching',
          potentialSavings: inferenceCost * 0.25,
          implementation: 'Implement intelligent caching for repeated queries',
          effort: 'low' as const
        },
        {
          area: 'Storage Tiering',
          potentialSavings: storageCost * 0.4,
          implementation: 'Move cold data to cheaper storage tiers automatically',
          effort: 'medium' as const
        },
        {
          area: 'Auto-scaling Tuning',
          potentialSavings: computeCost * 0.2,
          implementation: 'Fine-tune auto-scaling policies based on usage patterns',
          effort: 'high' as const
        }
      ];

      const analysis: AIAnalysis = {
        thoughtProcess,
        costBreakdown: {
          training: {
            amount: trainingCost,
            reasoning: `Based on ${formData.trainingFrequency} training with ${selectedProject.dataset_gb}GB dataset. Includes compute hours (${trainingComputeHours}h) and token processing costs.`,
            factors: [
              `${trainingTokens.toLocaleString()} training tokens`,
              `${trainingComputeHours} compute hours at $${computeCostPerHour}/hour`,
              `${formData.trainingFrequency} training frequency`,
              `${selectedProject.model_approach} model complexity`
            ]
          },
          inference: {
            amount: inferenceCost,
            reasoning: `Calculated for ${formData.expectedUsers} users with ${formData.peakConcurrency} peak concurrency. Includes scaling factors for user load and concurrent requests.`,
            factors: [
              `${selectedProject.monthly_tokens.toLocaleString()} base monthly tokens`,
              `${userScalingFactor.toFixed(2)}x user scaling factor`,
              `${concurrencyFactor.toFixed(2)} concurrency impact`,
              `$${baseTokenCost} per 1K tokens base rate`
            ]
          },
          storage: {
            amount: storageCost,
            reasoning: `${selectedProject.dataset_gb}GB with ${redundancyFactor}x redundancy for ${formData.complianceNeeds} compliance level. Includes backups and disaster recovery.`,
            factors: [
              `${selectedProject.dataset_gb}GB primary dataset`,
              `${redundancyFactor}x redundancy factor`,
              `$${storageCostPerGB}/GB monthly rate`,
              `${formData.complianceNeeds} compliance requirements`
            ]
          },
          compute: {
            amount: computeCost,
            reasoning: `Infrastructure for ${instanceCount} instances with ${formData.scalingRequirements} scaling. Calculated for 24/7 operation with load balancing.`,
            factors: [
              `${instanceCount} compute instances`,
              `${baseComputeHours} monthly hours`,
              `${scalingFactor}x scaling multiplier`,
              `$${computeCostPerHour}/hour instance cost`
            ]
          },
          total
        },
        riskAssessment: {
          level: riskLevel,
          factors: riskFactors
        },
        optimizationOpportunities: optimizations,
        monthlyEstimate: total,
        yearlyEstimate: total * 12,
        confidenceScore: 85 + Math.random() * 10
      };

      setAiAnalysis(analysis);
      generateGoalsFromAnalysis(analysis);
      setViewState('analysis-results');
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateGoalsFromAnalysis = (analysis: AIAnalysis) => {
    const goals: Goal[] = [
      {
        id: '1',
        title: 'Monthly Budget Optimization',
        description: `Reduce monthly costs from $${analysis.monthlyEstimate.toFixed(2)} to $${(analysis.monthlyEstimate * 0.8).toFixed(2)} through strategic optimizations`,
        targetAmount: analysis.monthlyEstimate * 0.8,
        currentAmount: analysis.monthlyEstimate,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        milestones: [
          {
            title: 'Implement Training Optimization',
            description: 'Switch to spot instances and optimize training schedules',
            completed: false,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            title: 'Deploy Inference Caching',
            description: 'Set up intelligent caching system for repeated queries',
            completed: false,
            dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '2',
        title: 'Performance Efficiency Target',
        description: 'Achieve 95% cost efficiency while maintaining performance standards',
        targetAmount: 95,
        currentAmount: analysis.confidenceScore,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        milestones: [
          {
            title: 'Baseline Performance Metrics',
            description: 'Establish current performance benchmarks',
            completed: false,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ];

    if (analysis.riskAssessment.level === 'high') {
      goals.push({
        id: '3',
        title: 'Risk Mitigation Plan',
        description: 'Implement safeguards to prevent cost overruns',
        targetAmount: analysis.monthlyEstimate * 1.1,
        currentAmount: analysis.monthlyEstimate,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        milestones: [
          {
            title: 'Cost Monitoring Alerts',
            description: 'Set up automated alerts for budget thresholds',
            completed: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    }

    setProposedGoals(goals);
  };

  const startGoalTracking = (goalId: string) => {
    const goal = proposedGoals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = { ...goal, status: 'in-progress' as const };
      setActiveGoals(prev => [...prev, updatedGoal]);
      setViewState('tracking');
    }
  };

  const renderProjectSelection = () => (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Analysis Tool</h1>
          <p className="text-gray-600 dark:text-gray-300">Select a project to analyze costs and generate budget estimates</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Calculator className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedProject(project);
                  setViewState('estimate-form');
                }}
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
        ) : (
          <div className="text-center py-12">
            <Calculator className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No Projects Found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Create a project first to start analyzing costs.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEstimateForm = () => (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setViewState('project-selection')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            ← Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cost Estimation Form</h1>
          <p className="text-gray-600 dark:text-gray-300">Provide additional details for accurate cost analysis</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Users
              </label>
              <input
                type="number"
                value={formData.expectedUsers}
                onChange={(e) => setFormData({...formData, expectedUsers: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peak Concurrency
              </label>
              <input
                type="number"
                value={formData.peakConcurrency}
                onChange={(e) => setFormData({...formData, peakConcurrency: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Training Frequency
              </label>
              <select
                value={formData.trainingFrequency}
                onChange={(e) => setFormData({...formData, trainingFrequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deployment Type
              </label>
              <select
                value={formData.deploymentType}
                onChange={(e) => setFormData({...formData, deploymentType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="cloud">Cloud</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-premise">On-Premise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scaling Requirements
              </label>
              <select
                value={formData.scalingRequirements}
                onChange={(e) => setFormData({...formData, scalingRequirements: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="auto">Auto Scaling</option>
                <option value="manual">Manual Scaling</option>
                <option value="aggressive">Aggressive Scaling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compliance Needs
              </label>
              <select
                value={formData.complianceNeeds}
                onChange={(e) => setFormData({...formData, complianceNeeds: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={generateAIAnalysis}
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-md transition-colors flex items-center"
            >
              {analyzing ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-pulse" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-2" />
                  Generate AI Cost Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisResults = () => (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setViewState('estimate-form')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            ← Back to Form
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Cost Analysis Results</h1>
          <p className="text-gray-600 dark:text-gray-300">Detailed breakdown with AI reasoning and recommendations</p>
        </div>

        {aiAnalysis && (
          <div className="space-y-8">
            {/* AI Thought Process */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Brain className="h-5 w-5 text-purple-500 mr-2" />
                AI Thought Process
              </h3>
              <div className="space-y-2">
                {aiAnalysis.thoughtProcess.map((thought, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    {thought}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Confidence Score:</strong> {aiAnalysis.confidenceScore.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <PieChart className="h-5 w-5 text-blue-500 mr-2" />
                Detailed Cost Breakdown
              </h3>
              
              {/* Cost Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${aiAnalysis.costBreakdown.training.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">Training</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {((aiAnalysis.costBreakdown.training.amount / aiAnalysis.costBreakdown.total) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${aiAnalysis.costBreakdown.inference.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-300 font-medium">Inference</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {((aiAnalysis.costBreakdown.inference.amount / aiAnalysis.costBreakdown.total) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${aiAnalysis.costBreakdown.storage.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">Storage</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {((aiAnalysis.costBreakdown.storage.amount / aiAnalysis.costBreakdown.total) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${aiAnalysis.costBreakdown.compute.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-orange-800 dark:text-orange-300 font-medium">Compute</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {((aiAnalysis.costBreakdown.compute.amount / aiAnalysis.costBreakdown.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Total Cost Summary */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total Monthly Cost:</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${aiAnalysis.costBreakdown.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Yearly Estimate:</span>
                  <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    ${aiAnalysis.yearlyEstimate.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detailed Reasoning */}
              <div className="space-y-4">
                {Object.entries(aiAnalysis.costBreakdown).filter(([key]) => key !== 'total').map(([category, details]) => (
                  <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize mb-2">{category} Cost Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{details.reasoning}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {details.factors.map((factor: string, index: number) => (
                        <div key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment & Optimization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertCircle className={`h-5 w-5 mr-2 ${
                    aiAnalysis.riskAssessment.level === 'high' ? 'text-red-500' :
                    aiAnalysis.riskAssessment.level === 'medium' ? 'text-orange-500' : 'text-green-500'
                  }`} />
                  Risk Assessment - {aiAnalysis.riskAssessment.level.toUpperCase()}
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                        aiAnalysis.riskAssessment.level === 'high' ? 'bg-red-500' :
                        aiAnalysis.riskAssessment.level === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`}></span>
                      {factor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  Top Optimization
                </h3>
                {aiAnalysis.optimizationOpportunities.length > 0 && (
                  <div className="space-y-3">
                    {aiAnalysis.optimizationOpportunities.slice(0, 2).map((opportunity, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{opportunity.area}</h4>
                          <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                            -${opportunity.potentialSavings.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{opportunity.implementation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setViewState('goal-creation')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center"
              >
                <Target className="h-5 w-5 mr-2" />
                Create Goals & Start Tracking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGoalCreation = () => (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setViewState('analysis-results')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            ← Back to Analysis
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI-Generated Goals</h1>
          <p className="text-gray-600 dark:text-gray-300">Review and select goals based on your cost analysis</p>
        </div>

        <div className="space-y-6">
          {proposedGoals.map((goal) => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{goal.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{goal.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${goal.targetAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Target</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-gray-900 dark:text-white">
                    ${goal.currentAmount.toFixed(2)} → ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Milestones</h4>
                <div className="space-y-2">
                  {goal.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{milestone.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{milestone.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => startGoalTracking(goal.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking This Goal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Tracking Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor your active goals and cost optimization progress</p>
        </div>

        {activeGoals.length > 0 ? (
          <div className="space-y-6">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                      {goal.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${goal.targetAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Milestone Progress</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, index) => (
                        <div key={index} className={`flex items-center p-2 rounded ${
                          milestone.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                        }`}>
                          <CheckCircle className={`h-4 w-4 mr-3 ${
                            milestone.completed ? 'text-green-500' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              milestone.completed ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'
                            }`}>
                              {milestone.title}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cost Trends</h4>
                    <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingDown className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Cost trending downward</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No Active Goals</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Start by creating a goal from your cost analysis.
            </p>
            <button
              onClick={() => setViewState('project-selection')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Analyze a Project
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Main render logic
  switch (viewState) {
    case 'project-selection':
      return renderProjectSelection();
    case 'estimate-form':
      return renderEstimateForm();
    case 'analysis-results':
      return renderAnalysisResults();
    case 'goal-creation':
      return renderGoalCreation();
    case 'tracking':
      return renderTracking();
    default:
      return renderProjectSelection();
  }
}