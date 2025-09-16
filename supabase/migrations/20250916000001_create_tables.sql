-- CostPilot Database Schema Migration
-- Created: 2025-09-16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table - core project information
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('prototype', 'fine_tune', 'production')),
    model_approach VARCHAR(50) NOT NULL CHECK (model_approach IN ('api_only', 'fine_tune', 'from_scratch')),
    dataset_gb DECIMAL(10,2),
    label_count INTEGER,
    monthly_tokens BIGINT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Budget rows - detailed cost breakdown
CREATE TABLE budget_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'compute', 'data', 'team', 'infrastructure', 'misc'
    subcategory VARCHAR(100), -- 'gpu_training', 'api_calls', 'data_scientist', etc.
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    unit_type VARCHAR(50), -- 'hours', 'tokens', 'gb', 'monthly'
    source VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'ai_estimate', 'billing_import'
    confidence_score DECIMAL(3,2), -- 0.00-1.00 for AI-generated estimates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- AI runs - track all AI inference calls
CREATE TABLE ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    function_name VARCHAR(100) NOT NULL, -- 'quick_estimate', 'explain_line_item', etc.
    input_data JSONB NOT NULL,
    output_data JSONB,
    llm_provider VARCHAR(50), -- 'openai', 'anthropic', etc.
    llm_model VARCHAR(100),
    tokens_used INTEGER,
    latency_ms INTEGER,
    cost_usd DECIMAL(8,4),
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecast history - ML model predictions and calibration
CREATE TABLE forecast_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    forecast_type VARCHAR(50) NOT NULL, -- 'initial', 'calibrated', 'updated'
    predicted_total DECIMAL(12,2) NOT NULL,
    confidence_lower DECIMAL(12,2), -- 10th percentile
    confidence_upper DECIMAL(12,2), -- 90th percentile
    actual_total DECIMAL(12,2), -- filled when project completes
    mae DECIMAL(8,4), -- mean absolute error when actual is known
    mape DECIMAL(6,3), -- mean absolute percentage error
    features JSONB, -- input features used for prediction
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing rows - imported actual costs for calibration
CREATE TABLE billing_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    billing_date DATE NOT NULL,
    vendor VARCHAR(100) NOT NULL, -- 'aws', 'gcp', 'openai', etc.
    service_category VARCHAR(100), -- 'compute', 'storage', 'api', etc.
    description TEXT NOT NULL,
    cost_usd DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2),
    unit_type VARCHAR(50),
    raw_data JSONB, -- original billing line for audit trail
    auto_categorized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User scenarios - for comparing different project approaches
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB NOT NULL, -- scenario-specific parameters
    estimated_total DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_budget_rows_project_id ON budget_rows(project_id);
CREATE INDEX idx_budget_rows_category ON budget_rows(category);
CREATE INDEX idx_ai_runs_project_id ON ai_runs(project_id);
CREATE INDEX idx_ai_runs_function_name ON ai_runs(function_name);
CREATE INDEX idx_ai_runs_created_at ON ai_runs(created_at DESC);
CREATE INDEX idx_forecast_history_project_id ON forecast_history(project_id);
CREATE INDEX idx_billing_rows_project_id ON billing_rows(project_id);
CREATE INDEX idx_billing_rows_billing_date ON billing_rows(billing_date DESC);
CREATE INDEX idx_scenarios_project_id ON scenarios(project_id);

-- RLS Policies (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only access budget rows for their projects
CREATE POLICY "Users can view own budget rows" ON budget_rows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = budget_rows.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own budget rows" ON budget_rows
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = budget_rows.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view own ai runs" ON ai_runs
    FOR SELECT USING (
        project_id IS NULL OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = ai_runs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ai runs" ON ai_runs
    FOR INSERT WITH CHECK (
        project_id IS NULL OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = ai_runs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON projects TO anon, authenticated;
GRANT ALL ON budget_rows TO anon, authenticated;
GRANT ALL ON ai_runs TO anon, authenticated;
GRANT ALL ON forecast_history TO anon, authenticated;
GRANT ALL ON billing_rows TO anon, authenticated;
GRANT ALL ON scenarios TO anon, authenticated;