import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our project
export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  project_type: 'prototype' | 'fine_tune' | 'production'
  model_approach: 'api_only' | 'fine_tune' | 'from_scratch'
  dataset_gb: number
  label_count: number
  monthly_tokens: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  budget?: number
}

export interface CreateProjectRequest {
  name: string
  description?: string
  projectType: 'prototype' | 'fine_tune' | 'production'
  modelApproach: 'api_only' | 'fine_tune' | 'from_scratch'
  dataset_gb: number
  label_count: number
  monthly_tokens: number
}

// Enhanced error handling for auth
export const handleAuthError = (error: Error | { message?: string }) => {
  console.error('Auth Error:', error);
  
  const errorMessage = 'message' in error ? error.message : error.toString();
  
  if (errorMessage?.includes('JWT') || errorMessage?.includes('expired')) {
    console.log('Token expired, signing out...');
    supabase.auth.signOut();
    return 'Your session has expired. Please sign in again.';
  }
  
  if (errorMessage?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  
  return errorMessage || 'An unexpected error occurred.';
};

// Enhanced project fetching with retry logic
export const fetchUserProjects = async (userId: string, retries = 2): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      
      // Retry on certain errors
      if (retries > 0 && (error.code === 'PGRST301' || error.message.includes('connection'))) {
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserProjects(userId, retries - 1);
      }
      
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUserProjects:', error);
    throw error;
  }
};

export interface ProjectEstimation {
  id: string;
  project_id: string;
  user_id: string;
  estimation_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  
  // Training costs
  training_cost: number;
  training_duration_hours: number;
  training_gpu_type: string;
  training_gpu_count: number;
  training_cloud_provider: string;
  
  // Fine-tuning costs
  fine_tuning_cost: number;
  fine_tuning_duration_hours: number;
  fine_tuning_iterations: number;
  
  // Inference costs
  inference_cost_monthly: number;
  inference_requests_monthly: number;
  inference_cost_per_request: number;
  
  // Team costs
  team_size: number;
  team_monthly_cost: number;
  project_duration_months: number;
  
  // Infrastructure costs
  storage_cost_monthly: number;
  bandwidth_cost_monthly: number;
  monitoring_cost_monthly: number;
  
  // Total costs
  total_development_cost: number;
  total_monthly_operational_cost: number;
  total_yearly_cost: number;
  
  // AI analysis
  ai_recommendations: string;
  cost_breakdown: any;
  risk_factors: any;
  optimization_suggestions: any;
}

export interface ProjectGoal {
  id: string;
  project_id: string;
  user_id: string;
  goal_title: string;
  goal_description: string;
  goal_type: 'cost_reduction' | 'performance' | 'timeline' | 'quality';
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage: number;
  ai_suggestions: any;
  ai_milestones: any;
  is_tracking_started: boolean;
  last_updated: string;
  created_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  recorded_value: number;
  progress_note: string;
  recorded_by: string;
  recorded_at: string;
  milestone_achieved: string;
  is_milestone: boolean;
  data_source: 'manual' | 'automated' | 'ai_calculated';
}