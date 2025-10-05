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