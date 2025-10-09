-- Table to store AI estimations for projects
CREATE TABLE project_estimations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Estimation metadata
    estimation_name VARCHAR(255) NOT NULL DEFAULT 'Default Estimation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true, -- Only one active estimation per project
    
    -- Training costs
    training_cost DECIMAL(12,2) DEFAULT 0,
    training_duration_hours INTEGER DEFAULT 0,
    training_gpu_type VARCHAR(100),
    training_gpu_count INTEGER DEFAULT 1,
    training_cloud_provider VARCHAR(50),
    
    -- Fine-tuning costs
    fine_tuning_cost DECIMAL(12,2) DEFAULT 0,
    fine_tuning_duration_hours INTEGER DEFAULT 0,
    fine_tuning_iterations INTEGER DEFAULT 0,
    
    -- Inference costs
    inference_cost_monthly DECIMAL(12,2) DEFAULT 0,
    inference_requests_monthly INTEGER DEFAULT 0,
    inference_cost_per_request DECIMAL(8,4) DEFAULT 0,
    
    -- Team costs
    team_size INTEGER DEFAULT 1,
    team_monthly_cost DECIMAL(12,2) DEFAULT 0,
    project_duration_months INTEGER DEFAULT 1,
    
    -- Infrastructure costs
    storage_cost_monthly DECIMAL(10,2) DEFAULT 0,
    bandwidth_cost_monthly DECIMAL(10,2) DEFAULT 0,
    monitoring_cost_monthly DECIMAL(10,2) DEFAULT 0,
    
    -- Total costs
    total_development_cost DECIMAL(12,2) DEFAULT 0,
    total_monthly_operational_cost DECIMAL(12,2) DEFAULT 0,
    total_yearly_cost DECIMAL(12,2) DEFAULT 0,
    
    -- AI analysis
    ai_recommendations TEXT,
    cost_breakdown JSONB,
    risk_factors JSONB,
    optimization_suggestions JSONB
);

-- Table for goal tracking
CREATE TABLE project_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Goal details
    goal_title VARCHAR(255) NOT NULL,
    goal_description TEXT,
    goal_type VARCHAR(50) NOT NULL, -- 'cost_reduction', 'performance', 'timeline', 'quality'
    target_value DECIMAL(12,2),
    current_value DECIMAL(12,2) DEFAULT 0,
    unit VARCHAR(50), -- 'dollars', 'percentage', 'days', 'accuracy'
    
    -- Timeline
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- AI suggestions
    ai_suggestions JSONB,
    ai_milestones JSONB,
    
    -- Tracking
    is_tracking_started BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for goal progress tracking
CREATE TABLE goal_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES project_goals(id) ON DELETE CASCADE,
    
    -- Progress data
    recorded_value DECIMAL(12,2) NOT NULL,
    progress_note TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Milestone tracking
    milestone_achieved VARCHAR(255),
    is_milestone BOOLEAN DEFAULT false,
    
    -- Metadata
    data_source VARCHAR(50) DEFAULT 'manual' -- 'manual', 'automated', 'ai_calculated'
);

-- Indexes for performance
CREATE INDEX idx_project_estimations_project_id ON project_estimations(project_id);
CREATE INDEX idx_project_estimations_user_id ON project_estimations(user_id);
CREATE INDEX idx_project_estimations_active ON project_estimations(project_id, is_active);

CREATE INDEX idx_project_goals_project_id ON project_goals(project_id);
CREATE INDEX idx_project_goals_user_id ON project_goals(user_id);
CREATE INDEX idx_project_goals_status ON project_goals(status);

CREATE INDEX idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX idx_goal_progress_recorded_at ON goal_progress(recorded_at DESC);

-- Partial unique index to ensure only one active estimation per project
CREATE UNIQUE INDEX idx_project_estimations_unique_active 
ON project_estimations(project_id) 
WHERE is_active = true;

-- RLS Policies
ALTER TABLE project_estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;

-- Policies for project_estimations
CREATE POLICY "Users can view their own estimations" ON project_estimations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own estimations" ON project_estimations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimations" ON project_estimations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimations" ON project_estimations
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for project_goals
CREATE POLICY "Users can view their own goals" ON project_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON project_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON project_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON project_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for goal_progress
CREATE POLICY "Users can view progress for their goals" ON goal_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_goals 
            WHERE project_goals.id = goal_progress.goal_id 
            AND project_goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert progress for their goals" ON goal_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_goals 
            WHERE project_goals.id = goal_progress.goal_id 
            AND project_goals.user_id = auth.uid()
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_estimation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_estimations_timestamp
    BEFORE UPDATE ON project_estimations
    FOR EACH ROW
    EXECUTE FUNCTION update_estimation_timestamp();

-- Function to deactivate other estimations when a new one is marked active
CREATE OR REPLACE FUNCTION ensure_single_active_estimation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE project_estimations 
        SET is_active = false 
        WHERE project_id = NEW.project_id 
        AND id != NEW.id 
        AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_estimation_trigger
    BEFORE INSERT OR UPDATE ON project_estimations
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION ensure_single_active_estimation();
