import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ExplainLineItemRequest {
  budgetRowId: string;
  context?: string; // Additional context about the project
}

interface ExplainLineItemResponse {
  success: boolean;
  explanation: string;
  optimization_tips: string[];
  cost_breakdown?: any;
}

// Build explanation prompt
const buildExplanationPrompt = (budgetRow: any, projectContext: any): string => {
  return `You are an AI cost expert. Explain this budget line item in simple terms and provide optimization suggestions.

Budget Line Item:
- Category: ${budgetRow.category}
- Subcategory: ${budgetRow.subcategory}
- Description: ${budgetRow.description}
- Quantity: ${budgetRow.quantity} ${budgetRow.unit_type}
- Unit Cost: $${budgetRow.unit_cost}
- Total Cost: $${budgetRow.total_cost}

Project Context:
- Project Type: ${projectContext.project_type}
- Model Approach: ${projectContext.model_approach}
- Dataset Size: ${projectContext.dataset_gb} GB

Requirements:
1. Provide a clear, non-technical explanation of what this cost represents
2. Explain why this cost is necessary for the project
3. Suggest 2-3 specific optimization strategies
4. Return ONLY valid JSON

Expected JSON format:
{
  "explanation": "Clear explanation of what this cost covers and why it's needed",
  "optimization_tips": [
    "Specific actionable tip to reduce this cost",
    "Another optimization strategy",
    "Alternative approach consideration"
  ],
  "confidence": 0.85
}

Generate the explanation now:`;
};

// Deterministic explanations as fallback
const getDeterministicExplanation = (budgetRow: any): ExplainLineItemResponse => {
  const explanations: { [key: string]: { [key: string]: any } } = {
    compute: {
      gpu_training: {
        explanation: "GPU training costs for machine learning model development. This covers the computational resources needed to train your AI model on specialized hardware.",
        optimization_tips: [
          "Use spot instances for non-critical training runs (50-70% savings)",
          "Implement efficient data loading to reduce idle GPU time",
          "Consider smaller model architectures if accuracy requirements allow"
        ]
      },
      api_calls: {
        explanation: "API inference costs for serving your trained model. This is the cost per request when users interact with your AI system.",
        optimization_tips: [
          "Implement response caching for common queries",
          "Use batch processing for multiple requests",
          "Consider fine-tuning smaller models for better cost efficiency"
        ]
      }
    },
    data: {
      storage: {
        explanation: "Data storage costs for your training dataset and model artifacts. This covers cloud storage fees for keeping your data accessible.",
        optimization_tips: [
          "Use tiered storage (move old data to cheaper cold storage)",
          "Compress datasets without quality loss",
          "Clean up temporary files and unused model checkpoints"
        ]
      }
    },
    team: {
      data_scientist: {
        explanation: "Data scientist time for model development, experimentation, and optimization. This covers the human expertise needed to build effective AI systems.",
        optimization_tips: [
          "Use automated ML tools to reduce manual experimentation time",
          "Implement proper experiment tracking to avoid duplicate work",
          "Consider outsourcing routine data preparation tasks"
        ]
      }
    }
  };

  const categoryExplanation = explanations[budgetRow.category];
  const subcategoryExplanation = categoryExplanation?.[budgetRow.subcategory];

  if (subcategoryExplanation) {
    return {
      success: true,
      explanation: subcategoryExplanation.explanation,
      optimization_tips: subcategoryExplanation.optimization_tips
    };
  }

  // Generic fallback
  return {
    success: true,
    explanation: `This cost covers ${budgetRow.description.toLowerCase()} for your project. It represents ${budgetRow.quantity} ${budgetRow.unit_type} at $${budgetRow.unit_cost} per unit.`,
    optimization_tips: [
      "Review if the quantity can be optimized based on actual requirements",
      "Compare prices across different vendors or service tiers",
      "Consider if this component can be implemented more efficiently"
    ]
  };
};

// Call Google Gemini API for explanation
const callLLMForExplanation = async (prompt: string): Promise<any> => {
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
        temperature: 0.2,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 10
      }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
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
    const requestData: ExplainLineItemRequest = await req.json();
    
    if (!requestData.budgetRowId) {
      return new Response(
        JSON.stringify({ error: 'Missing budgetRowId' }),
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

    // Get budget row with project context
    const { data: budgetRow, error: budgetError } = await supabase
      .from('budget_rows')
      .select(`
        *,
        projects (*)
      `)
      .eq('id', requestData.budgetRowId)
      .single();

    if (budgetError || !budgetRow) {
      return new Response(
        JSON.stringify({ error: 'Budget row not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    let llmResult: any = null;
    let response: ExplainLineItemResponse;

    // Try LLM explanation first
    try {
      const prompt = buildExplanationPrompt(budgetRow, budgetRow.projects);
      llmResult = await callLLMForExplanation(prompt);
      
      response = {
        success: true,
        explanation: llmResult.explanation,
        optimization_tips: llmResult.optimization_tips || []
      };
    } catch (error) {
      // Fallback to deterministic explanation
      response = getDeterministicExplanation(budgetRow);
    }

    // Log AI run
    await supabase
      .from('ai_runs')
      .insert({
        project_id: budgetRow.project_id,
        function_name: 'explain_line_item',
        input_data: requestData,
        output_data: response,
        llm_provider: llmResult ? 'google' : 'deterministic',
        llm_model: llmResult ? 'gemini-1.5-flash' : null,
        latency_ms: Date.now() - startTime,
        success: true
      });

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
    console.error('Explain line item error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to generate explanation'
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