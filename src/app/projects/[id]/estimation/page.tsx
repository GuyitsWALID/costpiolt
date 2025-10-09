"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Project, ProjectEstimation } from '@/lib/supabaseClient';
import { AIEstimationService } from '@/services/aiEstimationService';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Users, 
  Server, 
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Edit,
  Save,
  Loader2,
  BarChart3,
  Zap
} from 'lucide-react';

export default function ProjectEstimationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [estimation, setEstimation] = useState<ProjectEstimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectAndEstimation();
  }, [projectId]);

  const fetchProjectAndEstimation = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch existing estimation
      const { data: estimationData, error: estimationError } = await supabase
        .from('project_estimations')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single();

      if (estimationError && estimationError.code !== 'PGRST116') {
        throw estimationError;
      }

      if (estimationData) {
        setEstimation(estimationData);
      } else {
        // Generate new estimation if none exists
        await generateNewEstimation(projectData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateNewEstimation = async (projectData: Project) => {
    setGenerating(true);
    try {
      const newEstimation = await AIEstimationService.generateEstimation({
        project: projectData
      });

      const { data, error } = await supabase
        .from('project_estimations')
        .insert([newEstimation])
        .select()
        .single();

      if (error) throw error;
      setEstimation(data);
    } catch (err) {
      console.error('Error generating estimation:', err);
      setError('Failed to generate estimation');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEstimation = async () => {
    if (!estimation) return;
    
    try {
      const { error } = await supabase
        .from('project_estimations')
        .update({
          ...estimation,
          estimation_name: 'Updated Estimation',
          updated_at: new Date().toISOString()
        })
        .eq('id', estimation.id);

      if (error) throw error;
      setEditing(false);
    } catch (err) {
      console.error('Error saving estimation:', err);
      setError('Failed to save estimation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading project estimation...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name} - Cost Estimation
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered cost analysis and budget breakdown
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setEditing(!editing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              {editing ? 'Cancel Edit' : 'Edit Estimation'}
            </button>
            {editing && (
              <button
                onClick={handleSaveEstimation}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            )}
            <button
              onClick={() => generateNewEstimation(project)}
              disabled={generating}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              New Estimation
            </button>
          </div>
        </div>

        {generating && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-3" />
              <span className="text-blue-700 dark:text-blue-300">
                Generating AI-powered cost estimation...
              </span>
            </div>
          </div>
        )}

        {estimation && (
          <div className="space-y-8">
            {/* Cost Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Development Cost
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${estimation.total_development_cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    One-time setup cost
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Monthly Operations
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${estimation.total_monthly_operational_cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recurring monthly cost
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Total Yearly Cost
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${estimation.total_yearly_cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Complete first year
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cost Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Cost Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="font-medium text-gray-900 dark:text-white">Training</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${estimation.training_cost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                      <span className="font-medium text-gray-900 dark:text-white">Fine-tuning</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${estimation.fine_tuning_cost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-900 dark:text-white">Monthly Inference</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${estimation.inference_cost_monthly.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-500 mr-3" />
                      <span className="font-medium text-gray-900 dark:text-white">Team ({estimation.team_size} members)</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${estimation.team_monthly_cost.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  AI Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {estimation.ai_recommendations}
                    </p>
                  </div>
                  
                  {estimation.optimization_suggestions && Array.isArray(estimation.optimization_suggestions) && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Optimization Opportunities</h4>
                      {estimation.optimization_suggestions.map((opt: any, index: number) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-800 dark:text-blue-200">{opt.suggestion}</span>
                            {opt.potential_savings && (
                              <span className="text-sm text-green-600 dark:text-green-400">
                                Save ${opt.potential_savings.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{opt.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Training Setup</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>GPU: {estimation.training_gpu_type}</p>
                    <p>Duration: {estimation.training_duration_hours}h</p>
                    <p>Provider: {estimation.training_cloud_provider}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fine-tuning</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>Iterations: {estimation.fine_tuning_iterations}</p>
                    <p>Duration: {estimation.fine_tuning_duration_hours}h</p>
                    <p>Cost: ${estimation.fine_tuning_cost.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Inference</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>Monthly Requests: {estimation.inference_requests_monthly.toLocaleString()}</p>
                    <p>Cost per Request: ${estimation.inference_cost_per_request.toFixed(4)}</p>
                    <p>Monthly Cost: ${estimation.inference_cost_monthly.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Infrastructure</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>Storage: ${estimation.storage_cost_monthly.toFixed(2)}/mo</p>
                    <p>Bandwidth: ${estimation.bandwidth_cost_monthly.toFixed(2)}/mo</p>
                    <p>Monitoring: ${estimation.monitoring_cost_monthly.toFixed(2)}/mo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
