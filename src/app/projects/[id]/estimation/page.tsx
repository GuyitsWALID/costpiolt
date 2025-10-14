"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Project, ProjectEstimation } from '@/lib/supabaseClient';
import { 
  Calculator, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Database, 
  Cpu, 
  Globe, 
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ProjectEstimation() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id ?? '';
  
  const [project, setProject] = useState<Project | null>(null);
  const [estimations, setEstimations] = useState<ProjectEstimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectAndEstimation = useCallback(async () => {
    if (!params?.id) return;
    
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch estimations
      const { data: estimationData, error: estimationError } = await supabase
        .from('project_estimations')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false });

      if (estimationError) throw estimationError;
      setEstimations(estimationData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchProjectAndEstimation();
  }, [fetchProjectAndEstimation]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </button>
          </div>
        </div>

        {/* Estimation List */}
        <div className="space-y-8">
          {estimations.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                No estimations found for this project. Please generate a new estimation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {estimations.map((estimation) => (
                <div key={estimation.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Estimation #{estimation.id}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(estimation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs font-semibold rounded-full px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total Development Cost
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(estimation.total_development_cost)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Monthly Operational Cost
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(estimation.total_monthly_operational_cost)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total Yearly Cost
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(estimation.total_yearly_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}