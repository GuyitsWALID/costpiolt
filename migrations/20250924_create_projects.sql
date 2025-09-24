-- Migration: Enhanced projects table with pricing and granular fields
-- Created: 2025-09-24

-- Drop existing projects table if it exists (for clean migration)
DROP TABLE IF EXISTS projects;

-- Create projects table with enhanced schema
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    project_type text NOT NULL CHECK (project_type IN ('prototype', 'fine_tune', 'production')),
    model_approach text NOT NULL CHECK (model_approach IN ('api_only', 'fine_tune', 'from_scratch')),
    dataset_gb numeric DEFAULT 0 CHECK (dataset_gb >= 0),
    label_count integer DEFAULT 0 CHECK (label_count >= 0),
    monthly_tokens bigint DEFAULT 0 CHECK (monthly_tokens >= 0),
    llm_provider_model text,
    gpu_type text,
    estimated_gpu_hours numeric CHECK (estimated_gpu_hours >= 0),
    labeling_service_provider text,
    price_snapshot jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for efficient user project queries
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Create index on created_at for ordering
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);