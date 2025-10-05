import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({
        success: false,
        error: 'Session error',
        details: sessionError.message
      });
    }
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found'
      });
    }
    
    // Test database access with proper count syntax
    const { count, error: dbError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    
    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email
      },
      projectCount: count || 0,
      dbError: dbError?.message || null
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
