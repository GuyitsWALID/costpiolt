import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { CreateProjectRequest } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the user with the access token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body: CreateProjectRequest = await request.json()
    
    // Validate required fields
    if (!body.name || body.name.length > 120) {
      return NextResponse.json(
        { success: false, error: 'Project name is required and must be less than 120 characters' },
        { status: 400 }
      )
    }

    if (!['prototype', 'fine_tune', 'production'].includes(body.projectType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project type' },
        { status: 400 }
      )
    }

    if (!['api_only', 'fine_tune', 'from_scratch'].includes(body.modelApproach)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model approach' },
        { status: 400 }
      )
    }

    if (body.dataset_gb < 0 || body.label_count < 0 || body.monthly_tokens < 0) {
      return NextResponse.json(
        { success: false, error: 'Numeric fields must be non-negative' },
        { status: 400 }
      )
    }

    // Insert project into database
    const { data: project, error: insertError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        project_type: body.projectType,
        model_approach: body.modelApproach,
        dataset_gb: body.dataset_gb,
        label_count: body.label_count,
        monthly_tokens: body.monthly_tokens,
        metadata: {}
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, project },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the user with the access token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Get projects for the user
    const { data: projects, error: queryError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      projects: projects || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}