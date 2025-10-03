/**
 * Module 2: Deterministic Budget Calculator API Endpoint
 * POST /api/calc/deterministic
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calcDeterministic, validateDeterministicInput, type DeterministicInput, type BudgetLineItem } from '../../../src/utils/calcDeterministic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApiResponse {
  success: boolean;
  data?: {
    total_cost: number;
    line_items: BudgetLineItem[];
    summary: {
      compute_cost: number;
      data_cost: number;
      team_cost: number;
      monthly_operational_cost: number;
    };
    metadata: {
      calculation_timestamp: string;
      input_hash: string;
      version: string;
    };
    budget_rows_created?: number;
  };
  error?: {
    message: string;
    details?: string[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method not allowed. Use POST.' }
    });
  }

  try {
    // Validate input
    const validation = validateDeterministicInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          details: validation.errors
        }
      });
    }

    const input: DeterministicInput = req.body;

    // Optional authentication check
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid authentication token' }
        });
      }
      userId = user?.id || null;
    }

    // Perform deterministic calculation
    const result = calcDeterministic(input);

    // If projectId is provided, persist budget rows to database
    let budgetRowsCreated = 0;
    if (input.projectId) {
      // Validate project exists and user has access (if authenticated)
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', input.projectId)
        .single();

      if (projectError || !project) {
        return res.status(404).json({
          success: false,
          error: { message: 'Project not found' }
        });
      }

      // Check if user owns the project (if authenticated)
      if (userId && project.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied to project' }
        });
      }

      // Clear existing deterministic budget rows for this project
      await supabase
        .from('budget_rows')
        .delete()
        .eq('project_id', input.projectId)
        .eq('source', 'deterministic');

      // Insert new budget rows
      const budgetRowsToInsert = result.line_items.map((item: BudgetLineItem) => ({
        project_id: input.projectId,
        category: item.category,
        subcategory: item.subcategory,
        description: item.description,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        unit_type: item.unit_type,
        source: item.source,
        confidence_score: item.confidence_score,
        metadata: item.metadata
      }));

      const { data: insertedRows, error: insertError } = await supabase
        .from('budget_rows')
        .insert(budgetRowsToInsert)
        .select('id');

      if (insertError) {
        console.error('Failed to insert budget rows:', insertError);
        return res.status(500).json({
          success: false,
          error: { message: 'Failed to persist budget rows to database' }
        });
      }

      budgetRowsCreated = insertedRows?.length || 0;
    }

    // Return successful response
    res.status(200).json({
      success: true,
      data: {
        ...result,
        budget_rows_created: budgetRowsCreated
      }
    });

  } catch (error) {
    console.error('Deterministic calculation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during calculation',
        details: error instanceof Error ? [error.message] : ['Unknown error occurred']
      }
    });
  }
}