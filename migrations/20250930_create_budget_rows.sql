-- Budget Rows Migration
-- Module 2: Deterministic Budget Calculator
-- Created: 2025-09-30

-- Create budget_rows table for detailed cost breakdown
CREATE TABLE IF NOT EXISTS budget_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'compute', 'data', 'team', 'infrastructure', 'misc'
    subcategory VARCHAR(100), -- 'gpu_training', 'api_calls', 'data_scientist', etc.
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    unit_type VARCHAR(50), -- 'hours', 'tokens', 'gb', 'monthly'
    source VARCHAR(50) NOT NULL DEFAULT 'deterministic', -- 'manual', 'deterministic', 'ai_estimate'
    confidence_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00-1.00, deterministic = 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_rows_project_id ON budget_rows(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_rows_category ON budget_rows(category);
CREATE INDEX IF NOT EXISTS idx_budget_rows_source ON budget_rows(source);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budget_rows_updated_at
    BEFORE UPDATE ON budget_rows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
