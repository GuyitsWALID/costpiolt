import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { calcDeterministic, type DeterministicInput, type DeterministicResult } from '@/utils/calcDeterministic';

interface ApiRequest extends DeterministicInput {
  save_to_project?: string; // project_id to save budget data to
}

interface ApiResponse {
  success: boolean;
  data?: DeterministicResult & { budget_rows_created?: number };
  error?: {
    message: string;
    details?: string[];
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: ApiRequest = await request.json();
    const { save_to_project, ...calculationInput } = body;

    // Validate input
    if (!calculationInput.project_type || !Array.isArray(calculationInput.team_size)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid input data',
          details: ['project_type and team_size are required']
        }
      }, { status: 400 });
    }

    // Perform the calculation
    const result = calcDeterministic(calculationInput);

    // If save_to_project is specified, save to database
    let budgetRowsCreated = 0;
    if (save_to_project) {
      const supabase = createRouteHandlerClient({ cookies });
      
      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Authentication required',
            details: ['User must be logged in to save budget data']
          }
        }, { status: 401 });
      }

      // Verify project belongs to user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', save_to_project)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Project not found or access denied',
            details: ['Project must exist and belong to the authenticated user']
          }
        }, { status: 403 });
      }

      // Clear existing budget rows for this project
      await supabase
        .from('budget_rows')
        .delete()
        .eq('project_id', save_to_project);

      // Prepare budget rows for insertion
      const budgetRows = result.line_items.map((item, index) => ({
        project_id: save_to_project,
        category: item.category || 'General',
        description: item.description,
        unit_cost: item.unit_cost,
        quantity: item.quantity,
        unit_type: item.unit_type,
        total_cost: item.total_cost,
        sort_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insert budget rows
      const { data: insertedRows, error: insertError } = await supabase
        .from('budget_rows')
        .insert(budgetRows)
        .select('id');

      if (insertError) {
        console.error('Error inserting budget rows:', insertError);
        return NextResponse.json({
          success: false,
          error: {
            message: 'Failed to save budget data',
            details: [insertError.message]
          }
        }, { status: 500 });
      }

      budgetRowsCreated = insertedRows?.length || 0;

      // Update project with total budget
      await supabase
        .from('projects')
        .update({ 
          budget: result.total_cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', save_to_project);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        budget_rows_created: budgetRowsCreated > 0 ? budgetRowsCreated : undefined
      }
    });

  } catch (error) {
    console.error('Deterministic calculation error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Internal server error',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
    }, { status: 500 });
  }
}
