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