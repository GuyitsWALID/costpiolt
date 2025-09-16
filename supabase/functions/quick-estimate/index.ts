import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Request/Response interfaces
interface QuickEstimateRequest {
  projectId?: string | null;
  projectName: string;
  projectType: 'prototype' | 'fine_tune' | 'production';
  modelApproach: 'api_only' | 'fine_tune' | 'from_scratch';
  dataset_gb: number;
  label_count: number;
  monthly_tokens: number;
  team: Array<{
    role: string;
    hours: number;
    hourly_rate: number;
  }>;
}

interface BudgetRow {
  category: string;
  subcategory: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  unit_type: string;
  confidence_score: number;
}

interface QuickEstimateResponse {
  success: boolean;
  projectId: string;
  line_items: BudgetRow[];
  ml_forecast?: {
    predicted: number;
    lower_10: number;
    upper_90: number;
  };
  warnings: string[];
  total_estimate: number;
}

// Deterministic cost calculation formulas
const COST_FORMULAS = {
  // GPU costs per hour by type
  gpu_costs: {
    'h100': 2.50,
    'a100': 1.80,
    'v100': 0.90,
    't4': 0.35
  },
  
  // Model complexity factors
  model_factors: {
    'prototype': 0.5,
    'fine_tune': 1.0,
    'from_scratch': 3.0
  },
  
  // API costs (per 1K tokens)
  api_costs: {
    'gemini-1.5-flash': 0.00015, // $0.15 per 1M tokens
    'gemini-1.5-pro': 0.0035,    // $3.50 per 1M tokens
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.002
  },
  
  // Storage costs (per GB/month)
  storage_cost_per_gb: 0.10,
  
  // Infrastructure overhead multiplier
  infrastructure_overhead: 1.15
};

// LLM prompt template for budget estimation
const buildEstimatePrompt = (request: QuickEstimateRequest): string => {
  return `You are an AI cost estimation expert. Generate a detailed budget breakdown for this AI project.

Project Details:
- Name: ${request.projectName}
- Type: ${request.projectType}
- Model Approach: ${request.modelApproach}
- Dataset Size: ${request.dataset_gb} GB
- Labels: ${request.label_count}
- Monthly API Tokens: ${request.monthly_tokens}
- Team: ${JSON.stringify(request.team, null, 2)}

Requirements:
1. Return ONLY valid JSON in this exact format
2. Include ALL relevant cost categories: compute, data, team, infrastructure
3. Provide realistic estimates based on project type and approach
4. Include confidence scores (0.0-1.0) for each line item

Expected JSON format:
{
  "line_items": [
    {
      "category": "compute|data|team|infrastructure|misc",
      "subcategory": "gpu_training|api_calls|data_scientist|storage|etc",
      "description": "Clear description of what this covers",
      "quantity": 100.0,
      "unit_cost": 2.50,
      "total_cost": 250.0,
      "unit_type": "hours|tokens|gb|monthly",
      "confidence_score": 0.85
    }
  ],
  "insights": [
    "Key cost drivers and optimization opportunities",
    "Risk factors to consider"
  ]
}

Examples for reference:
- Fine-tuning with Gemini: ~$20-100 depending on dataset size
- GPU training (A100): $1.80/hour, typical fine-tune: 10-50 hours
- Data scientist: $75-150/hour depending on seniority
- API inference: $0.15/1M tokens for Gemini 1.5 Flash

Generate the estimate now:`;
};

// Deterministic calculator as fallback
const calculateDeterministicEstimate = (request: QuickEstimateRequest): BudgetRow[] => {
  const rows: BudgetRow[] = [];
  const factor = COST_FORMULAS.model_factors[request.projectType];
  
  // Compute costs
  if (request.modelApproach === 'fine_tune' || request.modelApproach === 'from_scratch') {
    const gpu_hours = Math.max(10, request.dataset_gb * factor * 2); // 2 hours per GB scaled by complexity
    const gpu_cost = gpu_hours * COST_FORMULAS.gpu_costs.a100;
    
    rows.push({
      category: 'compute',
      subcategory: 'gpu_training',
      description: `GPU training (A100) - ${gpu_hours.toFixed(1)} hours`,
      quantity: gpu_hours,
      unit_cost: COST_FORMULAS.gpu_costs.a100,
      total_cost: gpu_cost,
      unit_type: 'hours',
      confidence_score: 0.8
    });
  }
  
  // API costs
  if (request.monthly_tokens > 0) {
    const api_cost = (request.monthly_tokens / 1000) * COST_FORMULAS.api_costs['gemini-1.5-flash'];
    rows.push({
      category: 'compute',
      subcategory: 'api_calls',
      description: `API inference costs - ${(request.monthly_tokens / 1000).toFixed(0)}K tokens/month`,
      quantity: request.monthly_tokens / 1000,
      unit_cost: COST_FORMULAS.api_costs['gemini-1.5-flash'],
      total_cost: api_cost,
      unit_type: 'k_tokens',
      confidence_score: 0.9
    });
  }
  
  // Data storage
  if (request.dataset_gb > 0) {
    const storage_cost = request.dataset_gb * COST_FORMULAS.storage_cost_per_gb;
    rows.push({
      category: 'data',
      subcategory: 'storage',
      description: `Dataset storage - ${request.dataset_gb} GB`,
      quantity: request.dataset_gb,
      unit_cost: COST_FORMULAS.storage_cost_per_gb,
      total_cost: storage_cost,
      unit_type: 'gb_monthly',
      confidence_score: 0.95
    });
  }
  
  // Team costs
  request.team.forEach(member => {
    const team_cost = member.hours * member.hourly_rate;
    rows.push({
      category: 'team',
      subcategory: member.role.toLowerCase().replace(' ', '_'),
      description: `${member.role} - ${member.hours} hours @ $${member.hourly_rate}/hr`,
      quantity: member.hours,
      unit_cost: member.hourly_rate,
      total_cost: team_cost,
      unit_type: 'hours',
      confidence_score: 0.9
    });
  });
  
  return rows;
};

// Call Google Gemini API
const callLLM = async (prompt: string): Promise<any> => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GOOGLE_API_KEY')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
        topP: 0.8,
        topK: 10
      }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  return JSON.parse(content);
};

// Main handler
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request
    const requestData: QuickEstimateRequest = await req.json();
    
    // Validate required fields
    if (!requestData.projectName || !requestData.projectType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectName, projectType' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    let llmResult: any = null;
    let llmError: string | null = null;
    let warnings: string[] = [];

    // Try LLM first
    try {
      const prompt = buildEstimatePrompt(requestData);
      llmResult = await callLLM(prompt);
      
      // Validate LLM response structure
      if (!llmResult.line_items || !Array.isArray(llmResult.line_items)) {
        throw new Error('Invalid LLM response structure');
      }
    } catch (error) {
      llmError = error.message;
      warnings.push('LLM estimation failed, using deterministic fallback');
    }

    // Fallback to deterministic calculation
    const deterministicRows = calculateDeterministicEstimate(requestData);
    const finalRows = llmResult?.line_items || deterministicRows;

    // Calculate total
    const totalEstimate = finalRows.reduce((sum: number, row: any) => sum + (row.total_cost || 0), 0);

    // Create or update project
    let projectId = requestData.projectId;
    if (!projectId) {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: requestData.projectName,
          project_type: requestData.projectType,
          model_approach: requestData.modelApproach,
          dataset_gb: requestData.dataset_gb,
          label_count: requestData.label_count,
          monthly_tokens: requestData.monthly_tokens,
          metadata: { team: requestData.team }
        })
        .select()
        .single();

      if (projectError) {
        throw new Error(`Failed to create project: ${projectError.message}`);
      }
      projectId = newProject.id;
    }

    // Insert budget rows
    const budgetRows = finalRows.map((row: any) => ({
      project_id: projectId,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      quantity: row.quantity,
      unit_cost: row.unit_cost,
      total_cost: row.total_cost,
      unit_type: row.unit_type,
      source: llmResult ? 'ai_estimate' : 'deterministic',
      confidence_score: row.confidence_score
    }));

    const { error: budgetError } = await supabase
      .from('budget_rows')
      .insert(budgetRows);

    if (budgetError) {
      throw new Error(`Failed to insert budget rows: ${budgetError.message}`);
    }

    // Log AI run
    await supabase
      .from('ai_runs')
      .insert({
        project_id: projectId,
        function_name: 'quick_estimate',
        input_data: requestData,
        output_data: { line_items: finalRows, total: totalEstimate },
        llm_provider: 'google',
        llm_model: 'gemini-1.5-flash',
        latency_ms: Date.now() - startTime,
        success: !llmError,
        error_message: llmError
      });

    // Return response
    const response: QuickEstimateResponse = {
      success: true,
      projectId: projectId!,
      line_items: finalRows,
      warnings,
      total_estimate: totalEstimate
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );

  } catch (error) {
    console.error('Quick estimate error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        warnings: ['An error occurred during estimation']
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});