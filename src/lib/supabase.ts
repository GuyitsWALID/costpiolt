import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Project {
  id: string;
  user_id: string;
  name: string;
  project_type: 'prototype' | 'fine_tune' | 'production';
  model_approach: 'api_only' | 'fine_tune' | 'from_scratch';
  dataset_gb?: number;
  label_count?: number;
  monthly_tokens?: number;
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface BudgetRow {
  id: string;
  project_id: string;
  category: string;
  subcategory?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  unit_type?: string;
  source: 'manual' | 'ai_estimate' | 'billing_import';
  confidence_score?: number;
  created_at: string;
  metadata?: any;
}

export interface AIRun {
  id: string;
  project_id?: string;
  function_name: string;
  input_data: any;
  output_data?: any;
  llm_provider?: string;
  llm_model?: string;
  tokens_used?: number;
  latency_ms?: number;
  cost_usd?: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface ForecastHistory {
  id: string;
  project_id: string;
  forecast_type: string;
  predicted_total: number;
  confidence_lower?: number;
  confidence_upper?: number;
  actual_total?: number;
  mae?: number;
  mape?: number;
  features?: any;
  model_version?: string;
  created_at: string;
}

// Database helper functions
export const dbHelpers = {
  // Projects
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Budget Rows
  async createBudgetRows(rows: Omit<BudgetRow, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('budget_rows')
      .insert(rows)
      .select();
    
    if (error) throw error;
    return data;
  },

  async getProjectBudgetRows(projectId: string) {
    const { data, error } = await supabase
      .from('budget_rows')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async updateBudgetRow(id: string, updates: Partial<BudgetRow>) {
    const { data, error } = await supabase
      .from('budget_rows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // AI Runs
  async logAIRun(run: Omit<AIRun, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ai_runs')
      .insert(run)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAIRuns(projectId?: string, functionName?: string, limit = 50) {
    let query = supabase
      .from('ai_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (functionName) {
      query = query.eq('function_name', functionName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Forecast History
  async saveForecast(forecast: Omit<ForecastHistory, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('forecast_history')
      .insert(forecast)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProjectForecasts(projectId: string) {
    const { data, error } = await supabase
      .from('forecast_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};